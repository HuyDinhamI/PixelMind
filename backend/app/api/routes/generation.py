import os
import uuid
import shutil
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, BackgroundTasks
from fastapi.responses import JSONResponse
from typing import Optional, List
import logging

from app.api.services.leonardo_service import LeonardoService
from app.core.config import settings

router = APIRouter()
leonardo_service = LeonardoService()
logger = logging.getLogger(__name__)

# Tạo thư mục tạm thời để lưu ảnh
TEMP_DIR = os.path.join(settings.UPLOAD_DIR, "temp")
# Đảm bảo thư mục tạm tồn tại với quyền đầy đủ
os.makedirs(TEMP_DIR, exist_ok=True)
# In ra đường dẫn để dễ debug
logger.info(f"Thư mục tạm thời: {TEMP_DIR}")

@router.post("/generate")
async def generate_images(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    prompt: str = Form(...),
    num_images: Optional[int] = Form(4),
    width: Optional[int] = Form(512),
    height: Optional[int] = Form(512)
):
    """
    Endpoint duy nhất: Upload ảnh và gửi prompt tới Leonardo.ai API để sinh ảnh mới
    """
    try:
        # Tạo session_id và thư mục
        session_id = str(uuid.uuid4())
        session_dir = os.path.join(TEMP_DIR, session_id)
        os.makedirs(session_dir, exist_ok=True)
        
        # Lưu file
        file_path = os.path.join(session_dir, f"original_{file.filename}")
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Gọi Leonardo.ai API
        result = leonardo_service.generate_with_image_prompt(
            image_path=file_path,
            prompt=prompt,
            num_images=num_images,
            width=width,
            height=height
        )
        
        # Lưu generation_id vào session
        with open(os.path.join(session_dir, "generation_id.txt"), "w") as f:
            f.write(result["generation_id"])
        
        # Thêm session_id vào kết quả để client có thể kiểm tra trạng thái
        result["session_id"] = session_id
        
        return result
    except Exception as e:
        logger.error(f"Error generating images: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/status/{session_id}")
async def check_generation_status(session_id: str):
    """
    Kiểm tra trạng thái của quá trình tạo ảnh
    """
    try:
        # Kiểm tra session_id
        session_dir = os.path.join(TEMP_DIR, session_id)
        if not os.path.exists(session_dir):
            raise HTTPException(status_code=404, detail="Session not found")
        
        # Đọc generation_id
        gen_id_path = os.path.join(session_dir, "generation_id.txt")
        if not os.path.exists(gen_id_path):
            raise HTTPException(status_code=400, detail="No generation has been started")
        
        with open(gen_id_path, "r") as f:
            generation_id = f.read().strip()
        
        # Kiểm tra trạng thái
        result = leonardo_service.check_generation_status(generation_id)
        
        # Nếu đã hoàn thành, lưu ảnh
        status = result.get('generations_by_pk', {}).get('status')
        if status == 'COMPLETE':
            # Chuẩn bị để lưu ảnh trong background
            background_tasks.add_task(
                save_images_in_background, 
                generation_id=generation_id, 
                session_dir=session_dir
            )
            
            # Trả về kết quả với URLs
            generated_images = result.get('generations_by_pk', {}).get('generated_images', [])
            return {
                "status": "complete",
                "images": generated_images
            }
        
        return {
            "status": status.lower() if status else "processing",
            "message": "Generation in progress"
        }
    except Exception as e:
        logger.error(f"Error checking status: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/session/{session_id}")
async def cleanup_session(session_id: str):
    """
    Xóa một phiên làm việc và các file tạm thời
    """
    try:
        session_dir = os.path.join(TEMP_DIR, session_id)
        if os.path.exists(session_dir):
            shutil.rmtree(session_dir)
        
        return {
            "status": "success",
            "message": "Session cleaned up successfully"
        }
    except Exception as e:
        logger.error(f"Error cleaning up session: {e}")
        raise HTTPException(status_code=500, detail=str(e))

def save_images_in_background(generation_id: str, session_dir: str):
    """
    Lưu các ảnh đã sinh ra vào thư mục session
    """
    try:
        leonardo_service.save_generated_images(generation_id, session_dir)
        logger.info(f"Images for generation {generation_id} saved to {session_dir}")
    except Exception as e:
        logger.error(f"Error saving images in background: {e}")
