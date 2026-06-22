from sqlalchemy import inspect, text
from sqlalchemy.engine import Engine


CATEGORY_COLUMNS = {
    "description": "TEXT",
    "image_url": "VARCHAR(500)",
}

BANNER_COLUMNS = {
    "subtitle": "VARCHAR(300)",
    "section": "VARCHAR(80) DEFAULT 'hero'",
    "sort_order": "INTEGER DEFAULT 0",
}

PRODUCT_COLUMNS = {
    "product_code": "VARCHAR(120)",
    "short_description": "TEXT",
    "full_description": "TEXT",
    "specifications": "TEXT",
    "installation_guide": "TEXT",
    "hsn_code": "VARCHAR(20)",
    "sku": "VARCHAR(120)",
    "discount_type": "VARCHAR(30)",
    "discount_value": "NUMERIC(10,2) DEFAULT 0",
    "inventory_tracking": "BOOLEAN DEFAULT 1",
    "variant_stock_tracking": "BOOLEAN DEFAULT 1",
    "supported_bike_models": "TEXT",
}

VARIANT_COLUMNS = {
    "color_hex": "VARCHAR(20) DEFAULT '#090909'",
    "is_default": "BOOLEAN DEFAULT 0",
}

IMAGE_COLUMNS = {
    "is_thumbnail": "BOOLEAN DEFAULT 0",
    "variant_id": "INTEGER",
}

ORDER_ITEM_COLUMNS = {
    "color": "VARCHAR(80)",
    "bike_model": "VARCHAR(120)",
    "variant_sku": "VARCHAR(120)",
}

ORDER_COLUMNS = {
    "discount": "NUMERIC(10,2) DEFAULT 0",
    "user_id": "VARCHAR(36)",
}


def _add_columns(engine: Engine, table: str, columns: dict[str, str]) -> None:
    inspector = inspect(engine)
    if table not in inspector.get_table_names():
        return
    existing = {column["name"] for column in inspector.get_columns(table)}
    dialect = engine.dialect.name
    with engine.begin() as connection:
        for name, column_type in columns.items():
            if name in existing:
                continue
            if dialect == "sqlite":
                sql_type = column_type.replace("BOOLEAN", "INTEGER")
                connection.execute(text(f"ALTER TABLE {table} ADD COLUMN {name} {sql_type}"))
            else:
                connection.execute(text(f"ALTER TABLE {table} ADD COLUMN {name} {column_type}"))


def run_migrations(engine: Engine) -> None:
    _add_columns(engine, "categories", CATEGORY_COLUMNS)
    _add_columns(engine, "banners", BANNER_COLUMNS)
    _add_columns(engine, "products", PRODUCT_COLUMNS)
    _add_columns(engine, "product_variants", VARIANT_COLUMNS)
    _add_columns(engine, "product_images", IMAGE_COLUMNS)
    _add_columns(engine, "order_items", ORDER_ITEM_COLUMNS)
    _add_columns(engine, "orders", ORDER_COLUMNS)
