from fastapi import APIRouter, Depends
from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from backend.app.core.auth import get_current_user
from backend.app.db.session import get_db
from backend.app.models.entities import User, UserAddress
from backend.app.schemas.common import ShippingAddressIn

router = APIRouter(prefix="/address", tags=["address"])


@router.get("")
def list_addresses(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    addresses = db.scalars(select(UserAddress).where(UserAddress.user_id == user.id).order_by(UserAddress.created_at.desc()).limit(2)).all()
    return {"items": addresses}


@router.post("")
def create_address(payload: ShippingAddressIn, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    existing = db.scalar(
        select(UserAddress).where(
            UserAddress.user_id == user.id,
            UserAddress.address == payload.address,
            UserAddress.pincode == payload.pincode,
        )
    )
    if existing:
        return existing
    address = UserAddress(user_id=user.id, **payload.model_dump())
    db.add(address)
    db.flush()
    older = db.scalars(
        select(UserAddress.id)
        .where(UserAddress.user_id == user.id, UserAddress.id != address.id)
        .order_by(UserAddress.created_at.desc())
        .offset(1)
    ).all()
    if older:
        db.execute(delete(UserAddress).where(UserAddress.id.in_(older)))
    db.commit()
    db.refresh(address)
    return address
