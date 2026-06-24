import logging

import cloudinary
import cloudinary.uploader
from backend.app.core.config import settings

logger = logging.getLogger(__name__)

cloudinary.config(
    cloud_name=settings.cloudinary_cloud_name,
    api_key=settings.cloudinary_api_key,
    api_secret=settings.cloudinary_api_secret,
    secure=True
)


class MediaUploadError(RuntimeError):
    """Raised when a Cloudinary upload fails."""


def upload_media(file, folder: str = "outran/products") -> dict:
    if not settings.cloudinary_cloud_name or not settings.cloudinary_api_key:
        raise MediaUploadError(
            "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME and CLOUDINARY_API_KEY in backend/.env."
        )
    try:
        return cloudinary.uploader.upload(file, folder=folder, resource_type="auto")
    except Exception as exc:
        logger.error("Cloudinary upload failed: %s", exc)
        raise MediaUploadError(f"Media upload failed: {exc}") from exc
