from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter
from slowapi.middleware import SlowAPIMiddleware
from slowapi.util import get_remote_address

from backend.app.api import admin, content, orders, products
from backend.app.core.config import settings
from backend.app.db.migrate import run_migrations
from backend.app.db.session import Base, SessionLocal, engine
from backend.app.services.catalog import seed_catalog

limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title="OUTRAN Commerce API",
    version="2.0.0"
)

app.state.limiter = limiter

app.add_middleware(SlowAPIMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

app.include_router(products.router, prefix="/api")
app.include_router(orders.router, prefix="/api")
app.include_router(content.router, prefix="/api")
app.include_router(admin.router, prefix="/api")


@app.on_event("startup")
def startup():
    Base.metadata.create_all(bind=engine)
    run_migrations(engine)

    db = SessionLocal()
    try:
        seed_catalog(db)
    finally:
        db.close()


@app.get("/health")
def health():
    return {
        "status": "ok",
        "brand": "OUTRAN"
    }
