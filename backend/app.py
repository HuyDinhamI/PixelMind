from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os
import uuid
import logging
import aiofiles
from leonardo_api import LeonardoAPI

# Setup detailed logging for FastAPI
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI(title="PixelMind API", version="2.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration
UPLOAD_FOLDER = 'uploads'
RESULT_FOLDER = 'results'

# Tạo thư mục nếu chưa có
logger.info(f"Creating folders: {UPLOAD_FOLDER}, {RESULT_FOLDER}")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(RESULT_FOLDER, exist_ok=True)
logger.info("Folders created successfully")

# Initialize Leonardo API
logger.info("Initializing Leonardo API...")
leonardo = LeonardoAPI()
logger.info("Leonardo API initialized")

@app.post("/api/upload")
async def upload_and_process(
    image: UploadFile = File(...),
    prompt: str = Form(...),
    strength: float = Form(0.3)
):
    logger.info("=== NEW UPLOAD REQUEST ===")
    
    try:
        # Log request details
        logger.info(f"Received image file: {image.filename}")
        logger.info(f"Received prompt: '{prompt}'")
        logger.info(f"Received strength: {strength}")
        
        if not image.filename:
            logger.error("Empty image filename")
            raise HTTPException(status_code=400, detail="No image selected")
        
        # Tạo unique ID cho request này
        request_id = str(uuid.uuid4())
        logger.info(f"Generated request ID: {request_id}")
        
        # Lưu ảnh gốc
        original_filename = f"{request_id}_original.jpg"
        original_path = os.path.join(UPLOAD_FOLDER, original_filename)
        
        logger.info(f"Saving original image to: {original_path}")
        
        try:
            # Read and save image using aiofiles
            contents = await image.read()
            async with aiofiles.open(original_path, 'wb') as f:
                await f.write(contents)
            
            file_size = os.path.getsize(original_path)
            logger.info(f"Original image saved successfully, size: {file_size} bytes")
        except Exception as e:
            logger.error(f"Failed to save original image: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Failed to save image: {str(e)}")
        
        # Gọi Leonardo API với translation
        logger.info("Calling Leonardo API for image generation with translation...")
        result = await leonardo.generate_image(original_path, prompt, strength)
        
        logger.info(f"Leonardo API result: {result}")
        
        if result['success']:
            logger.info("Image generation successful!")
            response_data = {
                'success': True,
                'request_id': request_id,
                'original_image': f'/api/image/{original_filename}',
                'generated_images': result['images'],  # Tất cả ảnh được tạo
                'primary_image': result['primary_image'],  # Ảnh chính
                'enhanced_prompt': result['enhanced_prompt'],  # Prompt đã cải thiện
                'settings': result['settings'],  # Thông số đã sử dụng
                'total_images': len(result['images'])
            }
            logger.info(f"Sending success response: {response_data}")
            return response_data
        else:
            logger.error(f"Leonardo API failed: {result['error']}")
            raise HTTPException(status_code=500, detail=result['error'])
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Exception in upload_and_process: {str(e)}")
        logger.exception("Full exception traceback:")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/image/{filename}")
async def get_image(filename: str):
    logger.info(f"Serving image: {filename}")
    file_path = os.path.join(UPLOAD_FOLDER, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Image not found")
    return FileResponse(file_path)

@app.get("/api/result/{filename}")
async def get_result(filename: str):
    logger.info(f"Serving result: {filename}")
    file_path = os.path.join(RESULT_FOLDER, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Result not found")
    return FileResponse(file_path)

@app.get("/api/download/{filename}")
async def download_image(filename: str):
    logger.info(f"Download requested for: {filename}")
    file_path = os.path.join(RESULT_FOLDER, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(
        file_path, 
        media_type='application/octet-stream',
        filename=filename
    )

@app.get("/health")
async def health():
    logger.info("Health check requested")
    return {
        'status': 'healthy',
        'leonardo_model': 'PhotoReal v2',
        'optimized_settings': True,
        'version': '3.0',
        'features': ['simple_edit', 'optimized_defaults', 'translation_support'],
        'logging_enabled': True,
        'framework': 'FastAPI'
    }

if __name__ == '__main__':
    import uvicorn
    logger.info("Starting FastAPI application...")
    logger.info(f"Upload folder: {UPLOAD_FOLDER}")
    logger.info(f"Result folder: {RESULT_FOLDER}")
    uvicorn.run("app:app", host="0.0.0.0", port=5000, reload=True)
