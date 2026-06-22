from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict


ROOT_DIR = Path(__file__).resolve().parents[3]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=ROOT_DIR / "backend" / ".env", env_file_encoding="utf-8")

    database_url: str = "sqlite:///./outran.db"
    secret_key: str = "change-me"
    frontend_origin: str = "http://localhost:3000"
    razorpay_key_id: str = ""
    razorpay_key_secret: str = ""
    razorpay_webhook_secret: str = ""
    cloudinary_cloud_name: str = ""
    cloudinary_api_key: str = ""
    cloudinary_api_secret: str = ""
    admin_api_key: str = ""
    google_client_id: str = ""
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24 * 7
    auth_cookie_name: str = "outran_access_token"
    auth_cookie_secure: bool = False
    auth_cookie_samesite: str = "lax"


settings = Settings()
