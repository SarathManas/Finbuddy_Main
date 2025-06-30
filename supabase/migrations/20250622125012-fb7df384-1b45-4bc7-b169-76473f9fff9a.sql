
-- Update foreign key constraints to handle cascading deletes properly
ALTER TABLE invoices DROP CONSTRAINT IF EXISTS invoices_customer_id_fkey;
ALTER TABLE invoices ADD CONSTRAINT invoices_customer_id_fkey 
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT;

-- Add a policy to prevent deletion of customers with existing invoices
-- This is safer than cascade delete which could accidentally remove important invoice data

-- Also update other foreign key relationships for consistency
ALTER TABLE invoice_items DROP CONSTRAINT IF EXISTS invoice_items_invoice_id_fkey;
ALTER TABLE invoice_items ADD CONSTRAINT invoice_items_invoice_id_fkey 
  FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE;

ALTER TABLE invoice_items DROP CONSTRAINT IF EXISTS invoice_items_product_id_fkey;
ALTER TABLE invoice_items ADD CONSTRAINT invoice_items_product_id_fkey 
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL;

ALTER TABLE quotation_items DROP CONSTRAINT IF EXISTS quotation_items_quotation_id_fkey;
ALTER TABLE quotation_items ADD CONSTRAINT quotation_items_quotation_id_fkey 
  FOREIGN KEY (quotation_id) REFERENCES quotations(id) ON DELETE CASCADE;

ALTER TABLE quotation_items DROP CONSTRAINT IF EXISTS quotation_items_product_id_fkey;
ALTER TABLE quotation_items ADD CONSTRAINT quotation_items_product_id_fkey 
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL;

ALTER TABLE quotations DROP CONSTRAINT IF EXISTS quotations_customer_id_fkey;
ALTER TABLE quotations ADD CONSTRAINT quotations_customer_id_fkey 
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT;

ALTER TABLE inventory_movements DROP CONSTRAINT IF EXISTS inventory_movements_product_id_fkey;
ALTER TABLE inventory_movements ADD CONSTRAINT inventory_movements_product_id_fkey 
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;

ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_invoice_id_fkey;
ALTER TABLE transactions ADD CONSTRAINT transactions_invoice_id_fkey 
  FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE SET NULL;

-- Clear all existing mock/test data safely
DELETE FROM invoice_items;
DELETE FROM quotation_items; 
DELETE FROM transactions WHERE invoice_id IS NOT NULL;
DELETE FROM invoices;
DELETE FROM quotations;
DELETE FROM inventory_movements;
DELETE FROM products;
DELETE FROM customers;
DELETE FROM transactions;

-- Reset any sequences if they exist
SELECT setval(pg_get_serial_sequence('invoices', 'id'), 1, false) WHERE pg_get_serial_sequence('invoices', 'id') IS NOT NULL;
SELECT setval(pg_get_serial_sequence('quotations', 'id'), 1, false) WHERE pg_get_serial_sequence('quotations', 'id') IS NOT NULL;
