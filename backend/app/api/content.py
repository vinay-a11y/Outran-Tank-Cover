from fastapi import APIRouter

router = APIRouter(tags=["content"])


@router.get("/categories")
def categories():
    return {"items": ["Tank Covers"]}


@router.get("/coupons/{code}")
def coupon(code: str):
    return {"code": code.upper(), "valid": code.lower() == "founder", "discount": 500}


@router.get("/journal")
def journal_posts():
    return {"items": [{"title": "Built for the ride beyond roads", "slug": "built-for-the-ride-beyond-roads"}]}
