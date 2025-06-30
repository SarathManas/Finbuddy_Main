
-- Remove the company column from the customers table
ALTER TABLE public.customers DROP COLUMN IF EXISTS company;
