
-- Add GSTIN and Balance columns to the customers table
ALTER TABLE public.customers 
ADD COLUMN gstin TEXT,
ADD COLUMN balance NUMERIC DEFAULT 0;

-- Add a comment to document the GSTIN field
COMMENT ON COLUMN public.customers.gstin IS 'GST Identification Number for the customer';
COMMENT ON COLUMN public.customers.balance IS 'Current balance amount for the customer';
