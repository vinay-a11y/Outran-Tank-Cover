def calculate_discounted_price(price: float, discount_type: str | None, discount_value: float | None) -> float:
    base = float(price)
    if not discount_type or not discount_value:
        return round(base, 2)
    value = float(discount_value)
    if discount_type == "percent":
        return round(max(base - (base * value / 100), 0), 2)
    if discount_type == "fixed":
        return round(max(base - value, 0), 2)
    return round(base, 2)


def calculate_line_total(unit_price: float, quantity: int) -> float:
    return round(float(unit_price) * quantity, 2)
