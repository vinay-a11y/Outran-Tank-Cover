from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from backend.app.models.entities import UserAddress


def save_user_address(db: Session, user_id: str, address_data: dict) -> UserAddress:
    existing = db.scalar(
        select(UserAddress).where(
            UserAddress.user_id == user_id,
            UserAddress.address == address_data["address"],
            UserAddress.pincode == address_data["pincode"],
        )
    )
    if existing:
        return existing
    address = UserAddress(user_id=user_id, **address_data)
    db.add(address)
    db.flush()
    _prune_old_addresses(db, user_id, keep_id=address.id)
    return address


def _prune_old_addresses(db: Session, user_id: str, keep_id: int) -> None:
    older = db.scalars(
        select(UserAddress.id)
        .where(UserAddress.user_id == user_id, UserAddress.id != keep_id)
        .order_by(UserAddress.created_at.desc())
        .offset(1)
    ).all()
    if older:
        db.execute(delete(UserAddress).where(UserAddress.id.in_(older)))
