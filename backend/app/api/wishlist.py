from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from backend.app.core.auth import get_current_user
from backend.app.db.session import get_db
from backend.app.models.entities import Product, User, WishlistItem

router = APIRouter(prefix="/wishlist", tags=["wishlist"])


class WishlistIn(BaseModel):
    product_id: int


@router.get("")
def list_wishlist(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    items = db.scalars(select(WishlistItem).where(WishlistItem.user_id == user.id).order_by(WishlistItem.created_at.desc())).all()
    return {"items": [{"id": item.id, "product_id": item.product_id} for item in items]}


@router.post("")
def add_wishlist_item(payload: WishlistIn, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    if not db.get(Product, payload.product_id):
        raise HTTPException(status_code=404, detail="Product not found")
    existing = db.scalar(select(WishlistItem).where(WishlistItem.user_id == user.id, WishlistItem.product_id == payload.product_id))
    if existing:
        return existing
    item = WishlistItem(user_id=user.id, product_id=payload.product_id)
    db.add(item)
    db.commit()
    db.refresh(item)
    return {"id": item.id, "product_id": item.product_id}


@router.delete("/{product_id}")
def remove_wishlist_item(product_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    db.execute(delete(WishlistItem).where(WishlistItem.user_id == user.id, WishlistItem.product_id == product_id))
    db.commit()
    return {"ok": True}
