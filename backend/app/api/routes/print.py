from fastapi import APIRouter, HTTPException, Form, BackgroundTasks
from typing import Optional
import os
import logging

from app.api.services.print_service import PrintService
from app.core.config import settings

router = APIRouter()
print_service = PrintService()
logger = logging.getLogger(__name__)

@router.post("/print")
async def print_image(
    background_tasks: BackgroundTasks,
    session_id: str = Form(...),
    image_index: int = Form(...),
    copies: Optional[int] = Form(1)
):
    """
    Gửi một hình ảnh đã tạo ra tới máy in
    """
    try:
        # Xác định đường dẫn của session và ảnh
        session_dir = os.path.join(settings.UPLOAD_DIR, "temp", session_id)
        if not os.path.exists(session_dir):
            raise HTTPException(status_code=404, detail="Session not found")
        
        # Tìm ảnh đã tải về (nếu có) hoặc lấy từ URL
        image_path = os.path.join(session_dir, f"generated_{image_index}.jpg")
        if not os.path.exists(image_path):
            raise HTTPException(status_code=404, detail="Image not found. It may not have been downloaded yet.")
        
        # Thêm vào hàng đợi in
        result = print_service.add_to_queue(image_path, copies=copies)
        
        # Xử lý in trong background
        background_tasks.add_task(
            process_print_job_in_background,
            job_id=result["job_id"]
        )
        
        return {
            "status": "queued",
            "message": "Print job added to queue",
            "job_id": result["job_id"]
        }
    except Exception as e:
        logger.error(f"Error printing image: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/print/status/{job_id}")
async def check_print_status(job_id: int):
    """
    Kiểm tra trạng thái của một lệnh in
    """
    try:
        result = print_service.get_job_status(job_id)
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error checking print status: {e}")
        raise HTTPException(status_code=500, detail=str(e))

def process_print_job_in_background(job_id: int):
    """
    Xử lý lệnh in ảnh trong background
    """
    try:
        print_service.print_image(job_id)
        logger.info(f"Print job {job_id} processed successfully")
    except Exception as e:
        logger.error(f"Error processing print job in background: {e}")
