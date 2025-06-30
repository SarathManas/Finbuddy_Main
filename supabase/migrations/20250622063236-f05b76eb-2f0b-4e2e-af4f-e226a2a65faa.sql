
-- Create customers table
CREATE TABLE public.customers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  address TEXT,
  company TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category TEXT,
  stock_quantity INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create invoices table
CREATE TABLE public.invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_number TEXT UNIQUE NOT NULL,
  customer_id UUID REFERENCES public.customers(id) NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
  tax_rate DECIMAL(4,2) DEFAULT 0,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create invoice_items table
CREATE TABLE public.invoice_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id UUID REFERENCES public.invoices(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id),
  description TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create transactions table for financial tracking
CREATE TABLE public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  category TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  invoice_id UUID REFERENCES public.invoices(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for all tables
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Customers policies
CREATE POLICY "Users can view all customers" ON public.customers FOR SELECT USING (true);
CREATE POLICY "Users can create customers" ON public.customers FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update customers" ON public.customers FOR UPDATE USING (true);
CREATE POLICY "Users can delete customers" ON public.customers FOR DELETE USING (true);

-- Products policies
CREATE POLICY "Users can view all products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Users can create products" ON public.products FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update products" ON public.products FOR UPDATE USING (true);
CREATE POLICY "Users can delete products" ON public.products FOR DELETE USING (true);

-- Invoices policies
CREATE POLICY "Users can view all invoices" ON public.invoices FOR SELECT USING (true);
CREATE POLICY "Users can create invoices" ON public.invoices FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update invoices" ON public.invoices FOR UPDATE USING (true);
CREATE POLICY "Users can delete invoices" ON public.invoices FOR DELETE USING (true);

-- Invoice items policies
CREATE POLICY "Users can view all invoice items" ON public.invoice_items FOR SELECT USING (true);
CREATE POLICY "Users can create invoice items" ON public.invoice_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update invoice items" ON public.invoice_items FOR UPDATE USING (true);
CREATE POLICY "Users can delete invoice items" ON public.invoice_items FOR DELETE USING (true);

-- Transactions policies
CREATE POLICY "Users can view all transactions" ON public.transactions FOR SELECT USING (true);
CREATE POLICY "Users can create transactions" ON public.transactions FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update transactions" ON public.transactions FOR UPDATE USING (true);
CREATE POLICY "Users can delete transactions" ON public.transactions FOR DELETE USING (true);

-- Add updated_at triggers
CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample data for demonstration
INSERT INTO public.customers (name, email, phone, company) VALUES
('John Smith', 'john@acmecorp.com', '+1-555-0123', 'Acme Corporation'),
('Sarah Johnson', 'sarah@techstart.com', '+1-555-0124', 'TechStart Inc'),
('Mike Brown', 'mike@designstudio.com', '+1-555-0125', 'Design Studio'),
('Emily Davis', 'emily@consulting.com', '+1-555-0126', 'Davis Consulting'),
('Robert Wilson', 'robert@manufacturing.com', '+1-555-0127', 'Wilson Manufacturing');

INSERT INTO public.products (name, description, price, category, stock_quantity) VALUES
('Web Development', 'Complete website development service', 2500.00, 'Services', 999),
('Logo Design', 'Professional logo design package', 500.00, 'Design', 999),
('SEO Consultation', 'Monthly SEO optimization service', 300.00, 'Marketing', 999),
('Mobile App Development', 'iOS and Android app development', 5000.00, 'Services', 999),
('Brand Identity Package', 'Complete brand identity design', 1200.00, 'Design', 999);

INSERT INTO public.invoices (invoice_number, customer_id, status, issue_date, due_date, subtotal, tax_rate, tax_amount, total) VALUES
('INV-2024-001', (SELECT id FROM public.customers WHERE email = 'john@acmecorp.com'), 'paid', '2024-01-15', '2024-02-15', 2500.00, 8.25, 206.25, 2706.25),
('INV-2024-002', (SELECT id FROM public.customers WHERE email = 'sarah@techstart.com'), 'sent', '2024-02-01', '2024-03-01', 800.00, 8.25, 66.00, 866.00),
('INV-2024-003', (SELECT id FROM public.customers WHERE email = 'mike@designstudio.com'), 'overdue', '2024-01-20', '2024-02-20', 1200.00, 8.25, 99.00, 1299.00),
('INV-2024-004', (SELECT id FROM public.customers WHERE email = 'emily@consulting.com'), 'draft', '2024-02-15', '2024-03-15', 5000.00, 8.25, 412.50, 5412.50),
('INV-2024-005', (SELECT id FROM public.customers WHERE email = 'robert@manufacturing.com'), 'paid', '2024-02-10', '2024-03-10', 300.00, 8.25, 24.75, 324.75);

-- Insert sample transactions
INSERT INTO public.transactions (type, category, amount, description, date, invoice_id) VALUES
('income', 'Web Development', 2706.25, 'Payment for Invoice INV-2024-001', '2024-02-14', (SELECT id FROM public.invoices WHERE invoice_number = 'INV-2024-001')),
('income', 'Design', 324.75, 'Payment for Invoice INV-2024-005', '2024-03-08', (SELECT id FROM public.invoices WHERE invoice_number = 'INV-2024-005')),
('expense', 'Software', 99.00, 'Monthly software subscription', '2024-02-01', NULL),
('expense', 'Marketing', 250.00, 'Google Ads campaign', '2024-02-05', NULL),
('expense', 'Office', 150.00, 'Office supplies', '2024-02-10', NULL);
