from datetime import datetime, timedelta, timezone

import jwt
from fastapi import Cookie, Depends, HTTPException, status
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token
from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.app.core.config import settings
from backend.app.db.session import get_db
from backend.app.models.entities import User


def create_access_token(user: User) -> str:
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=settings.access_token_expire_minutes)
    payload = {"sub": user.id, "email": user.email, "exp": expires_at}
    return jwt.encode(payload, settings.secret_key, algorithm=settings.jwt_algorithm)


def decode_access_token(token: str) -> dict:
    try:
        return jwt.decode(token, settings.secret_key, algorithms=[settings.jwt_algorithm])
    except jwt.PyJWTError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token",
        ) from exc


def verify_google_credential(credential: str) -> dict:
    if not settings.google_client_id:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Google OAuth client id is not configured on the backend",
        )
    try:
        payload = id_token.verify_oauth2_token(
            credential,
            google_requests.Request(),
            settings.google_client_id,
        )
    except ValueError as exc:
        raise HTTPException(status_code=401, detail="Google sign-in could not be verified") from exc
    if not payload.get("email"):
        raise HTTPException(status_code=400, detail="Google account did not return an email address")
    return payload


def get_current_user(
    token: str | None = Cookie(default=None, alias=settings.auth_cookie_name),
    db: Session = Depends(get_db),
) -> User:
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required")
    payload = decode_access_token(token)
    user_id = payload.get("sub")
    user = db.scalar(select(User).where(User.id == user_id))
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user


def get_current_user_optional(
    token: str | None = Cookie(default=None, alias=settings.auth_cookie_name),
    db: Session = Depends(get_db),
) -> User | None:
    if not token:
        return None
    try:
        payload = decode_access_token(token)
    except HTTPException:
        return None
    user_id = payload.get("sub")
    user = db.scalar(select(User).where(User.id == user_id))
    return user


def user_payload(user: User) -> dict:
    return {
        "id": user.id,
        "email": user.email,
        "google_id": user.google_id,
        "name": user.name,
        "phone_number": user.phone_number,
        "profile_image": user.profile_image,
        "is_phone_verified": user.is_phone_verified,
        "created_at": user.created_at.isoformat() if user.created_at else None,
        "updated_at": user.updated_at.isoformat() if user.updated_at else None,
        "profile_complete": bool(user.name and user.phone_number),
    }
