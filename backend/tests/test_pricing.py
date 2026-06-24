import unittest

from backend.app.services.pricing import calculate_discounted_price, calculate_line_total


class CalculateDiscountedPriceTest(unittest.TestCase):
    def test_no_discount_returns_base_price(self):
        self.assertEqual(calculate_discounted_price(4999, None, None), 4999.0)

    def test_no_discount_type_returns_base_price(self):
        self.assertEqual(calculate_discounted_price(4999, None, 1000), 4999.0)

    def test_no_discount_value_returns_base_price(self):
        self.assertEqual(calculate_discounted_price(4999, "fixed", None), 4999.0)

    def test_zero_discount_value_returns_base_price(self):
        self.assertEqual(calculate_discounted_price(4999, "fixed", 0), 4999.0)

    def test_fixed_discount(self):
        self.assertEqual(calculate_discounted_price(4999, "fixed", 1000), 3999.0)

    def test_percent_discount(self):
        self.assertEqual(calculate_discounted_price(1000, "percent", 20), 800.0)

    def test_percent_discount_rounds_to_two_decimals(self):
        result = calculate_discounted_price(99.99, "percent", 33)
        self.assertEqual(result, round(99.99 - 99.99 * 33 / 100, 2))

    def test_fixed_discount_does_not_go_negative(self):
        self.assertEqual(calculate_discounted_price(500, "fixed", 1000), 0.0)

    def test_percent_discount_100_returns_zero(self):
        self.assertEqual(calculate_discounted_price(4999, "percent", 100), 0.0)

    def test_unknown_discount_type_returns_base_price(self):
        self.assertEqual(calculate_discounted_price(4999, "bogo", 500), 4999.0)

    def test_float_precision(self):
        self.assertEqual(calculate_discounted_price(19.99, "percent", 15), round(19.99 - 19.99 * 15 / 100, 2))


class CalculateLineTotalTest(unittest.TestCase):
    def test_single_unit(self):
        self.assertEqual(calculate_line_total(3999.0, 1), 3999.0)

    def test_multiple_units(self):
        self.assertEqual(calculate_line_total(3999.0, 3), 11997.0)

    def test_zero_quantity(self):
        self.assertEqual(calculate_line_total(3999.0, 0), 0.0)

    def test_fractional_price(self):
        self.assertEqual(calculate_line_total(19.99, 2), 39.98)


if __name__ == "__main__":
    unittest.main()
