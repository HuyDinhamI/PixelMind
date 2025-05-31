import os
import tempfile
from pathlib import Path
from pydantic_settings import BaseSettings
from pydantic import Field
from dotenv import load_dotenv

load_dotenv()

# Sử dụng thư mục tạm của hệ thống
class Settings(BaseSettings):
    APP_NAME: str = "AI Photo Generation API"
    LEONARDO_API_KEY: str = Field(..., env="LEONARDO_API_KEY")
    UPLOAD_DIR: str = os.path.join(tempfile.gettempdir(), "pixelmind_uploads")
    
    # CORS Settings
    CORS_ORIGINS: list = ["*"]
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()

# Đảm bảo thư mục upload tồn tại
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
