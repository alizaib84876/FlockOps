-- Weighbridge sales: net chicken kg = loaded vehicle - empty vehicle.
-- Bird headcount is not recorded.

ALTER TABLE sales DROP CONSTRAINT IF EXISTS sales_birds_sold_check;
ALTER TABLE sales ALTER COLUMN birds_sold SET DEFAULT 0;
ALTER TABLE sales ADD CONSTRAINT sales_birds_sold_nonnegative CHECK (birds_sold >= 0);

ALTER TABLE sales ADD COLUMN IF NOT EXISTS empty_weight_kg NUMERIC(10, 2);
ALTER TABLE sales ADD COLUMN IF NOT EXISTS loaded_weight_kg NUMERIC(10, 2);
ALTER TABLE sales ADD COLUMN IF NOT EXISTS driver_name VARCHAR(100);
ALTER TABLE sales ADD COLUMN IF NOT EXISTS notes TEXT;

ALTER TABLE sales DROP CONSTRAINT IF EXISTS sales_weighbridge_check;
ALTER TABLE sales ADD CONSTRAINT sales_weighbridge_check CHECK (
  empty_weight_kg IS NULL
  OR loaded_weight_kg IS NULL
  OR loaded_weight_kg > empty_weight_kg
);
