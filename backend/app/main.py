from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging
import os

from app.api.routes import generation, print
from app.core.config import settings

# Thiết lập logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("app")

# Khởi tạo ứng dụng FastAPI
app = FastAPI(
    title="AI Photo Booth API",
    description="API for AI Photo Booth application using Leonardo.ai",
    version="1.0.0",
)

# Cấu hình CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Đăng ký các router
app.include_router(generation.router, prefix="/api/generation", tags=["Generation"])
app.include_router(print.router, prefix="/api/print", tags=["Print"])

# Health check endpoint
@app.get("/", tags=["Health"])
async def health_check():
    return {
        "status": "healthy",
        "app_name": settings.APP_NAME,
        "api_version": "1.0.0",
    }

# Startup event
@app.on_event("startup")
async def startup_event():
    logger.info(f"Starting {settings.APP_NAME}")
    # Đảm bảo thư mục uploads tồn tại
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    temp_dir = os.path.join(settings.UPLOAD_DIR, "temp")
    os.makedirs(temp_dir, exist_ok=True)
    logger.info(f"Upload directory: {settings.UPLOAD_DIR}")

# Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    logger.info(f"Shutting down {settings.APP_NAME}")
