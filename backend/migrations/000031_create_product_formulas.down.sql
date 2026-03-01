DROP TRIGGER IF EXISTS trg_product_formula_items_updated_at ON product_formula_items;
DROP TRIGGER IF EXISTS trg_product_formulas_updated_at ON product_formulas;
DROP FUNCTION IF EXISTS update_product_formulas_updated_at();
DROP TABLE IF EXISTS product_formula_items;
DROP TABLE IF EXISTS product_formulas;
