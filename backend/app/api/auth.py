from fastapi import APIRouter, Depends, HTTPException, Response
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.app.core.auth import create_access_token, get_current_user, user_payload, verify_google_credential
from backend.app.core.config import settings
from backend.app.db.session import get_db
from backend.app.models.entities import User

router = APIRouter(tags=["auth"])


class GoogleLoginIn(BaseModel):
    credential: str


class ProfileUpdateIn(BaseModel):
    name: str = Field(min_length=1)
    phone_number: str = Field(min_length=1)


def _set_auth_cookie(response: Response, token: str) -> None:
    response.set_cookie(
        key=settings.auth_cookie_name,
        value=token,
        max_age=settings.access_token_expire_minutes * 60,
        httponly=True,
        secure=settings.auth_cookie_secure,
        samesite=settings.auth_cookie_samesite,
        path="/",
    )


@router.post("/auth/google")
def google_login(payload: GoogleLoginIn, response: Response, db: Session = Depends(get_db)):
    google_user = verify_google_credential(payload.credential)
    email = str(google_user["email"]).lower()
    google_id = str(google_user["sub"])
    user = db.scalar(select(User).where((User.google_id == google_id) | (User.email == email)))
    if user:
        user.google_id = google_id
        user.email = email
        user.profile_image = google_user.get("picture") or user.profile_image
        if not user.name:
            user.name = google_user.get("name")
    else:
        user = User(
            email=email,
            google_id=google_id,
            name=google_user.get("name"),
            profile_image=google_user.get("picture"),
        )
        db.add(user)
    db.commit()
    db.refresh(user)
    _set_auth_cookie(response, create_access_token(user))
    return {"user": user_payload(user)}


@router.get("/auth/me")
def me(user: User = Depends(get_current_user)):
    return {"user": user_payload(user)}


@router.post("/auth/logout")
def logout(response: Response):
    response.delete_cookie(settings.auth_cookie_name, path="/")
    return {"ok": True}


@router.get("/profile")
def get_profile(user: User = Depends(get_current_user)):
    return {"user": user_payload(user)}


@router.patch("/profile")
def update_profile(payload: ProfileUpdateIn, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    name = payload.name.strip()
    phone_number = payload.phone_number.strip()
    if not name:
        raise HTTPException(status_code=400, detail="Name cannot be empty")
    if not phone_number:
        raise HTTPException(status_code=400, detail="Phone number is required")
    existing = db.scalar(select(User).where(User.phone_number == phone_number, User.id != user.id))
    if existing:
        raise HTTPException(status_code=409, detail="Phone number is already in use")
    user.name = name
    user.phone_number = phone_number
    db.commit()
    db.refresh(user)
    return {"user": user_payload(user)}
