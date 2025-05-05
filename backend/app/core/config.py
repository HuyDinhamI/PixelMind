import os
from pydantic import BaseSettings, Field
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    APP_NAME: str = "AI Photo Generation API"
    LEONARDO_API_KEY: str = Field(..., env="LEONARDO_API_KEY")
    UPLOAD_DIR: str = "uploads"
    
    # CORS Settings
    CORS_ORIGINS: list = ["*"]
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()

# Đảm bảo thư mục upload tồn tại
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
