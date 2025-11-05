from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    app_name: str = "视频链接解析API"
    app_version: str = "1.0.0"
    debug: bool = False
    
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    
    request_timeout: int = 10
    
    enable_cors: bool = True
    cors_origins: list = ["*"]
    
    log_level: str = "INFO"
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
