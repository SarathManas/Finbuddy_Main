
-- Create bank_accounts table
CREATE TABLE IF NOT EXISTS public.bank_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  account_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  bank_name TEXT NOT NULL,
  account_type TEXT NOT NULL DEFAULT 'checking',
  opening_balance NUMERIC(12,2) DEFAULT 0,
  current_balance NUMERIC(12,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create bank_transactions table
CREATE TABLE IF NOT EXISTS public.bank_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  bank_account_id UUID REFERENCES public.bank_accounts(id) ON DELETE CASCADE,
  transaction_date DATE NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('debit', 'credit')),
  reference_number TEXT,
  balance_after NUMERIC(12,2),
  category TEXT,
  ai_category_confidence NUMERIC(3,2),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'categorized', 'posted', 'uncategorized')),
  is_reviewed BOOLEAN DEFAULT false,
  statement_id UUID REFERENCES public.documents(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create transaction_categories table for predefined categories
CREATE TABLE IF NOT EXISTS public.transaction_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense', 'transfer')),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default transaction categories
INSERT INTO public.transaction_categories (name, type, description) VALUES
('Salary', 'income', 'Salary payments'),
('Business Income', 'income', 'Revenue from business operations'),
('Interest Income', 'income', 'Interest earned from bank accounts'),
('Office Rent', 'expense', 'Office rental payments'),
('Utilities', 'expense', 'Electricity, water, internet bills'),
('Office Supplies', 'expense', 'Stationery and office equipment'),
('Travel & Transportation', 'expense', 'Travel and commuting expenses'),
('Marketing & Advertising', 'expense', 'Marketing and promotional expenses'),
('Professional Services', 'expense', 'Legal, accounting, consulting fees'),
('Bank Charges', 'expense', 'Bank fees and charges'),
('Equipment Purchase', 'expense', 'Equipment and machinery purchases'),
('Insurance', 'expense', 'Insurance premiums'),
('Loan Payment', 'expense', 'Loan repayments'),
('Tax Payment', 'expense', 'Tax payments'),
('Bank Transfer', 'transfer', 'Transfers between bank accounts'),
('Cash Withdrawal', 'transfer', 'ATM withdrawals'),
('Petty Cash', 'transfer', 'Cash for small expenses')
ON CONFLICT (name) DO NOTHING;

-- Add RLS policies for bank_accounts
ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own bank accounts" 
  ON public.bank_accounts 
  FOR SELECT 
  TO authenticated 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bank accounts" 
  ON public.bank_accounts 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bank accounts" 
  ON public.bank_accounts 
  FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = user_id);

-- Add RLS policies for bank_transactions
ALTER TABLE public.bank_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own bank transactions" 
  ON public.bank_transactions 
  FOR SELECT 
  TO authenticated 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bank transactions" 
  ON public.bank_transactions 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bank transactions" 
  ON public.bank_transactions 
  FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = user_id);

-- Add RLS policies for transaction_categories (read-only for all authenticated users)
ALTER TABLE public.transaction_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view transaction categories" 
  ON public.transaction_categories 
  FOR SELECT 
  TO authenticated 
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bank_transactions_user_id ON public.bank_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_bank_transactions_account_id ON public.bank_transactions(bank_account_id);
CREATE INDEX IF NOT EXISTS idx_bank_transactions_date ON public.bank_transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_bank_transactions_status ON public.bank_transactions(status);
CREATE INDEX IF NOT EXISTS idx_bank_accounts_user_id ON public.bank_accounts(user_id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_bank_transactions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_bank_transactions_updated_at ON public.bank_transactions;
CREATE TRIGGER trigger_update_bank_transactions_updated_at
  BEFORE UPDATE ON public.bank_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_bank_transactions_updated_at();

DROP TRIGGER IF EXISTS trigger_update_bank_accounts_updated_at ON public.bank_accounts;
CREATE TRIGGER trigger_update_bank_accounts_updated_at
  BEFORE UPDATE ON public.bank_accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
