
-- Create account type enum
CREATE TYPE public.account_type AS ENUM ('asset', 'liability', 'equity', 'income', 'expense');

-- Create journal entry status enum
CREATE TYPE public.journal_entry_status AS ENUM ('draft', 'posted', 'cancelled');

-- Create chart of accounts table
CREATE TABLE public.chart_of_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  account_code TEXT NOT NULL,
  account_name TEXT NOT NULL,
  account_type account_type NOT NULL,
  account_subtype TEXT,
  parent_account_id UUID REFERENCES public.chart_of_accounts(id),
  is_active BOOLEAN DEFAULT true,
  opening_balance NUMERIC(12,2) DEFAULT 0,
  current_balance NUMERIC(12,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, account_code)
);

-- Create journal entries table
CREATE TABLE public.journal_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  entry_number TEXT NOT NULL UNIQUE,
  entry_date DATE NOT NULL,
  description TEXT NOT NULL,
  reference_type TEXT CHECK (reference_type IN ('bank_transaction', 'manual', 'invoice', 'purchase')),
  reference_id UUID,
  total_debit NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_credit NUMERIC(12,2) NOT NULL DEFAULT 0,
  status journal_entry_status NOT NULL DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  posted_at TIMESTAMP WITH TIME ZONE,
  posted_by UUID REFERENCES auth.users
);

-- Create journal entry lines table
CREATE TABLE public.journal_entry_lines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  journal_entry_id UUID REFERENCES public.journal_entries(id) ON DELETE CASCADE NOT NULL,
  account_code TEXT NOT NULL,
  account_name TEXT NOT NULL,
  description TEXT,
  debit_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  credit_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  line_order INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create day book entries table for audit trail
CREATE TABLE public.day_book_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  journal_entry_id UUID REFERENCES public.journal_entries(id) ON DELETE CASCADE,
  entry_date DATE NOT NULL,
  account_code TEXT NOT NULL,
  account_name TEXT NOT NULL,
  description TEXT NOT NULL,
  debit_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  credit_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  reference_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add journal_entry_id column to bank_transactions for linking
ALTER TABLE public.bank_transactions 
ADD COLUMN journal_entry_id UUID REFERENCES public.journal_entries(id);

-- Create indexes for better performance
CREATE INDEX idx_chart_of_accounts_user_id ON public.chart_of_accounts(user_id);
CREATE INDEX idx_chart_of_accounts_code ON public.chart_of_accounts(account_code);
CREATE INDEX idx_journal_entries_user_id ON public.journal_entries(user_id);
CREATE INDEX idx_journal_entries_date ON public.journal_entries(entry_date);
CREATE INDEX idx_journal_entries_status ON public.journal_entries(status);
CREATE INDEX idx_journal_entry_lines_journal_id ON public.journal_entry_lines(journal_entry_id);
CREATE INDEX idx_day_book_entries_user_id ON public.day_book_entries(user_id);
CREATE INDEX idx_day_book_entries_date ON public.day_book_entries(entry_date);

-- Enable RLS on all tables
ALTER TABLE public.chart_of_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entry_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.day_book_entries ENABLE ROW LEVEL SECURITY;

-- RLS policies for chart_of_accounts
CREATE POLICY "Users can view their own chart of accounts" 
  ON public.chart_of_accounts FOR SELECT 
  TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own chart of accounts" 
  ON public.chart_of_accounts FOR INSERT 
  TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own chart of accounts" 
  ON public.chart_of_accounts FOR UPDATE 
  TO authenticated USING (auth.uid() = user_id);

-- RLS policies for journal_entries
CREATE POLICY "Users can view their own journal entries" 
  ON public.journal_entries FOR SELECT 
  TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own journal entries" 
  ON public.journal_entries FOR INSERT 
  TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own journal entries" 
  ON public.journal_entries FOR UPDATE 
  TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own draft journal entries" 
  ON public.journal_entries FOR DELETE 
  TO authenticated USING (auth.uid() = user_id AND status = 'draft');

-- RLS policies for journal_entry_lines
CREATE POLICY "Users can view journal entry lines for their entries" 
  ON public.journal_entry_lines FOR SELECT 
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.journal_entries 
      WHERE journal_entries.id = journal_entry_lines.journal_entry_id 
      AND journal_entries.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create journal entry lines for their entries" 
  ON public.journal_entry_lines FOR INSERT 
  TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.journal_entries 
      WHERE journal_entries.id = journal_entry_lines.journal_entry_id 
      AND journal_entries.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update journal entry lines for their entries" 
  ON public.journal_entry_lines FOR UPDATE 
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.journal_entries 
      WHERE journal_entries.id = journal_entry_lines.journal_entry_id 
      AND journal_entries.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete journal entry lines for their entries" 
  ON public.journal_entry_lines FOR DELETE 
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.journal_entries 
      WHERE journal_entries.id = journal_entry_lines.journal_entry_id 
      AND journal_entries.user_id = auth.uid()
    )
  );

-- RLS policies for day_book_entries
CREATE POLICY "Users can view their own day book entries" 
  ON public.day_book_entries FOR SELECT 
  TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own day book entries" 
  ON public.day_book_entries FOR INSERT 
  TO authenticated WITH CHECK (auth.uid() = user_id);

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_chart_of_accounts_updated_at
  BEFORE UPDATE ON public.chart_of_accounts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_journal_entries_updated_at
  BEFORE UPDATE ON public.journal_entries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to create default chart of accounts for new users
CREATE OR REPLACE FUNCTION public.create_default_chart_of_accounts()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.chart_of_accounts (user_id, account_code, account_name, account_type, account_subtype) VALUES
    (NEW.id, '1000', 'Assets', 'asset', 'Current Assets'),
    (NEW.id, '1100', 'Cash and Cash Equivalents', 'asset', 'Current Assets'),
    (NEW.id, '1110', 'Cash in Hand', 'asset', 'Current Assets'),
    (NEW.id, '1120', 'Bank Account - Current', 'asset', 'Current Assets'),
    (NEW.id, '1130', 'Bank Account - Savings', 'asset', 'Current Assets'),
    (NEW.id, '1200', 'Accounts Receivable', 'asset', 'Current Assets'),
    (NEW.id, '1210', 'Trade Debtors', 'asset', 'Current Assets'),
    (NEW.id, '1300', 'Inventory', 'asset', 'Current Assets'),
    (NEW.id, '1310', 'Raw Materials', 'asset', 'Current Assets'),
    (NEW.id, '1320', 'Finished Goods', 'asset', 'Current Assets'),
    (NEW.id, '1400', 'Prepaid Expenses', 'asset', 'Current Assets'),
    (NEW.id, '1500', 'Fixed Assets', 'asset', 'Non-Current Assets'),
    (NEW.id, '1510', 'Plant and Machinery', 'asset', 'Non-Current Assets'),
    (NEW.id, '1520', 'Furniture and Fixtures', 'asset', 'Non-Current Assets'),
    (NEW.id, '1530', 'Computer Equipment', 'asset', 'Non-Current Assets'),
    (NEW.id, '2000', 'Liabilities', 'liability', 'Current Liabilities'),
    (NEW.id, '2100', 'Accounts Payable', 'liability', 'Current Liabilities'),
    (NEW.id, '2110', 'Trade Creditors', 'liability', 'Current Liabilities'),
    (NEW.id, '2200', 'Tax Liabilities', 'liability', 'Current Liabilities'),
    (NEW.id, '2210', 'GST Payable', 'liability', 'Current Liabilities'),
    (NEW.id, '2220', 'TDS Payable', 'liability', 'Current Liabilities'),
    (NEW.id, '2230', 'Income Tax Payable', 'liability', 'Current Liabilities'),
    (NEW.id, '2300', 'Long-term Liabilities', 'liability', 'Non-Current Liabilities'),
    (NEW.id, '2310', 'Bank Loan', 'liability', 'Non-Current Liabilities'),
    (NEW.id, '3000', 'Equity', 'equity', 'Capital'),
    (NEW.id, '3100', 'Share Capital', 'equity', 'Capital'),
    (NEW.id, '3200', 'Retained Earnings', 'equity', 'Capital'),
    (NEW.id, '4000', 'Income', 'income', 'Operating Income'),
    (NEW.id, '4100', 'Sales Revenue', 'income', 'Operating Income'),
    (NEW.id, '4200', 'Service Revenue', 'income', 'Operating Income'),
    (NEW.id, '4300', 'Other Income', 'income', 'Non-Operating Income'),
    (NEW.id, '4310', 'Interest Income', 'income', 'Non-Operating Income'),
    (NEW.id, '5000', 'Expenses', 'expense', 'Operating Expenses'),
    (NEW.id, '5100', 'Cost of Goods Sold', 'expense', 'Operating Expenses'),
    (NEW.id, '5200', 'Salaries and Wages', 'expense', 'Operating Expenses'),
    (NEW.id, '5300', 'Rent Expense', 'expense', 'Operating Expenses'),
    (NEW.id, '5400', 'Utilities Expense', 'expense', 'Operating Expenses'),
    (NEW.id, '5500', 'Professional Fees', 'expense', 'Operating Expenses'),
    (NEW.id, '5600', 'Marketing Expenses', 'expense', 'Operating Expenses'),
    (NEW.id, '5700', 'Travel Expenses', 'expense', 'Operating Expenses'),
    (NEW.id, '5800', 'Depreciation Expense', 'expense', 'Operating Expenses'),
    (NEW.id, '5900', 'Interest Expense', 'expense', 'Non-Operating Expenses');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create chart of accounts for new users
CREATE TRIGGER trigger_create_default_chart_of_accounts
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.create_default_chart_of_accounts();
