from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.app.core.auth import get_current_user
from backend.app.db.session import get_db
from backend.app.models.entities import User, UserAddress
from backend.app.schemas.common import ShippingAddressIn
from backend.app.services.addresses import save_user_address

router = APIRouter(prefix="/address", tags=["address"])


@router.get("")
def list_addresses(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    addresses = db.scalars(select(UserAddress).where(UserAddress.user_id == user.id).order_by(UserAddress.created_at.desc()).limit(2)).all()
    return {"items": addresses}


@router.post("")
def create_address(payload: ShippingAddressIn, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    address = save_user_address(db, user.id, payload.model_dump())
    db.commit()
    db.refresh(address)
    return address
