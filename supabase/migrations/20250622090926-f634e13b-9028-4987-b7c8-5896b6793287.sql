
-- Make the price column nullable in the products table
ALTER TABLE public.products 
ALTER COLUMN price DROP NOT NULL;

-- Optional: Update existing products to populate sell_price from price if sell_price is null
UPDATE public.products 
SET sell_price = price 
WHERE sell_price IS NULL AND price IS NOT NULL;
