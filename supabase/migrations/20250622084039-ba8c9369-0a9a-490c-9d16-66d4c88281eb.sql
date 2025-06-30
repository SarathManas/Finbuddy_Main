
-- Add missing columns to products table for inventory management
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS hsn_code TEXT,
ADD COLUMN IF NOT EXISTS buy_price NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS sell_price NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS last_restocked TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS reorder_level INTEGER DEFAULT 10,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS supplier TEXT;

-- Update existing price column to be sell_price if buy_price is null
UPDATE public.products 
SET sell_price = price 
WHERE sell_price IS NULL;

-- Create inventory_movements table for tracking stock changes
CREATE TABLE IF NOT EXISTS public.inventory_movements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  movement_type TEXT NOT NULL CHECK (movement_type IN ('purchase', 'sale', 'adjustment', 'return')),
  quantity INTEGER NOT NULL,
  reference_number TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id)
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_inventory_movements_product_id ON public.inventory_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_created_at ON public.inventory_movements(created_at);

-- Add RLS policies for inventory_movements
ALTER TABLE public.inventory_movements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to view inventory movements" 
  ON public.inventory_movements 
  FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Allow authenticated users to insert inventory movements" 
  ON public.inventory_movements 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

-- Add trigger to update products stock_quantity when inventory movements are added
CREATE OR REPLACE FUNCTION update_product_stock()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Update stock based on movement type
    IF NEW.movement_type IN ('purchase', 'return') THEN
      UPDATE public.products 
      SET stock_quantity = COALESCE(stock_quantity, 0) + NEW.quantity,
          last_restocked = CASE WHEN NEW.movement_type = 'purchase' THEN NEW.created_at ELSE last_restocked END
      WHERE id = NEW.product_id;
    ELSIF NEW.movement_type IN ('sale', 'adjustment') THEN
      UPDATE public.products 
      SET stock_quantity = GREATEST(COALESCE(stock_quantity, 0) - ABS(NEW.quantity), 0)
      WHERE id = NEW.product_id;
    END IF;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_update_product_stock ON public.inventory_movements;
CREATE TRIGGER trigger_update_product_stock
  AFTER INSERT ON public.inventory_movements
  FOR EACH ROW
  EXECUTE FUNCTION update_product_stock();
