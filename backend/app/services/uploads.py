import cloudinary
import cloudinary.uploader
from backend.app.core.config import settings


cloudinary.config(
    cloud_name=settings.cloudinary_cloud_name,
    api_key=settings.cloudinary_api_key,
    api_secret=settings.cloudinary_api_secret,
    secure=True
)


def upload_media(file, folder: str = "outran/products") -> dict:
    return cloudinary.uploader.upload(file, folder=folder, resource_type="auto")
