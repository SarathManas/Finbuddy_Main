
-- Create quotations table
CREATE TABLE public.quotations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quotation_number TEXT UNIQUE NOT NULL,
  customer_id UUID REFERENCES public.customers(id) NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'accepted', 'rejected', 'expired', 'converted')),
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  valid_until DATE NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
  tax_rate DECIMAL(4,2) DEFAULT 0,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL DEFAULT 0,
  notes TEXT,
  terms_conditions TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create quotation_items table
CREATE TABLE public.quotation_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quotation_id UUID REFERENCES public.quotations(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id),
  description TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add quotation_id column to invoices table to track converted quotations
ALTER TABLE public.invoices ADD COLUMN quotation_id UUID REFERENCES public.quotations(id);

-- Add invoice_type column to distinguish between direct and converted invoices
ALTER TABLE public.invoices ADD COLUMN invoice_type TEXT NOT NULL DEFAULT 'direct' CHECK (invoice_type IN ('direct', 'converted'));

-- Enable RLS for quotations
ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotation_items ENABLE ROW LEVEL SECURITY;

-- RLS policies for quotations
CREATE POLICY "Users can view all quotations" ON public.quotations FOR SELECT USING (true);
CREATE POLICY "Users can create quotations" ON public.quotations FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update quotations" ON public.quotations FOR UPDATE USING (true);
CREATE POLICY "Users can delete quotations" ON public.quotations FOR DELETE USING (true);

-- RLS policies for quotation items
CREATE POLICY "Users can view all quotation items" ON public.quotation_items FOR SELECT USING (true);
CREATE POLICY "Users can create quotation items" ON public.quotation_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update quotation items" ON public.quotation_items FOR UPDATE USING (true);
CREATE POLICY "Users can delete quotation items" ON public.quotation_items FOR DELETE USING (true);

-- Add updated_at triggers
CREATE TRIGGER update_quotations_updated_at
  BEFORE UPDATE ON public.quotations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample quotations data
INSERT INTO public.quotations (quotation_number, customer_id, status, issue_date, valid_until, subtotal, tax_rate, tax_amount, total, terms_conditions) VALUES
('QUO-2024-001', (SELECT id FROM public.customers WHERE email = 'john@acmecorp.com'), 'sent', '2024-06-15', '2024-07-15', 2500.00, 8.25, 206.25, 2706.25, 'Payment due within 30 days of acceptance'),
('QUO-2024-002', (SELECT id FROM public.customers WHERE email = 'sarah@techstart.com'), 'accepted', '2024-06-20', '2024-07-20', 800.00, 8.25, 66.00, 866.00, 'Valid for 30 days from issue date'),
('QUO-2024-003', (SELECT id FROM public.customers WHERE email = 'mike@designstudio.com'), 'draft', '2024-06-22', '2024-07-22', 1200.00, 8.25, 99.00, 1299.00, 'Subject to availability');

-- Insert sample quotation items
INSERT INTO public.quotation_items (quotation_id, product_id, description, quantity, unit_price, total) VALUES
((SELECT id FROM public.quotations WHERE quotation_number = 'QUO-2024-001'), (SELECT id FROM public.products WHERE name = 'Web Development'), 'Complete website development service', 1, 2500.00, 2500.00),
((SELECT id FROM public.quotations WHERE quotation_number = 'QUO-2024-002'), (SELECT id FROM public.products WHERE name = 'Logo Design'), 'Professional logo design package', 1, 500.00, 500.00),
((SELECT id FROM public.quotations WHERE quotation_number = 'QUO-2024-002'), (SELECT id FROM public.products WHERE name = 'SEO Consultation'), 'Monthly SEO optimization service', 1, 300.00, 300.00),
((SELECT id FROM public.quotations WHERE quotation_number = 'QUO-2024-003'), (SELECT id FROM public.products WHERE name = 'Brand Identity Package'), 'Complete brand identity design', 1, 1200.00, 1200.00);
