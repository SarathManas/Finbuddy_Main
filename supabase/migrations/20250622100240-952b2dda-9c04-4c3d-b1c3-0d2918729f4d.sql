
-- Add new fields to customers table for better address structure and legal name
ALTER TABLE public.customers 
ADD COLUMN legal_name text,
ADD COLUMN state text,
ADD COLUMN place text,
ADD COLUMN pincode text,
ADD COLUMN phone_number text;

-- Update existing customers to migrate address data
-- This is a simple migration that sets legal_name to name for existing records
-- and keeps the original address in the address field for now
UPDATE public.customers 
SET legal_name = name 
WHERE legal_name IS NULL;

-- Add a comment to document the new fields
COMMENT ON COLUMN public.customers.legal_name IS 'Legal name as registered for GSTIN, used for invoices';
COMMENT ON COLUMN public.customers.state IS 'State for GST calculations';
COMMENT ON COLUMN public.customers.place IS 'City/Place';
COMMENT ON COLUMN public.customers.pincode IS 'PIN code';
COMMENT ON COLUMN public.customers.phone_number IS 'Phone number for invoices';
