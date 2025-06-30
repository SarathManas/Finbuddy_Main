
-- Remove account_code column from chart_of_accounts table
ALTER TABLE public.chart_of_accounts DROP COLUMN IF EXISTS account_code;

-- Remove account_code column from journal_entry_lines table
ALTER TABLE public.journal_entry_lines DROP COLUMN IF EXISTS account_code;

-- Remove account_code column from day_book_entries table
ALTER TABLE public.day_book_entries DROP COLUMN IF EXISTS account_code;

-- Add account_id foreign key to journal_entry_lines table
ALTER TABLE public.journal_entry_lines 
ADD COLUMN account_id UUID REFERENCES public.chart_of_accounts(id);

-- Add account_id foreign key to day_book_entries table
ALTER TABLE public.day_book_entries 
ADD COLUMN account_id UUID REFERENCES public.chart_of_accounts(id);

-- Update the update_account_balance function to use account_id instead of account_code
CREATE OR REPLACE FUNCTION public.update_account_balance(account_id_param UUID, balance_change numeric)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- Update the current balance for the specified account
  UPDATE public.chart_of_accounts 
  SET current_balance = COALESCE(current_balance, 0) + balance_change,
      updated_at = now()
  WHERE id = account_id_param
    AND user_id = auth.uid();
  
  -- Check if the account was found and updated
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Account with id % not found or access denied', account_id_param;
  END IF;
END;
$function$;

-- Update the update_chart_of_account function to remove account_code handling
CREATE OR REPLACE FUNCTION public.update_chart_of_account(account_id_param uuid, updates jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- Update the account (removed account_code handling)
  UPDATE public.chart_of_accounts
  SET 
    account_name = COALESCE(updates->>'account_name', account_name),
    account_type = COALESCE((updates->>'account_type')::account_type, account_type),
    account_subtype = COALESCE(updates->>'account_subtype', account_subtype),
    opening_balance = COALESCE((updates->>'opening_balance')::NUMERIC, opening_balance),
    parent_account_id = CASE 
      WHEN updates ? 'parent_account_id' THEN 
        CASE WHEN updates->>'parent_account_id' = 'null' THEN NULL 
             ELSE (updates->>'parent_account_id')::UUID 
        END
      ELSE parent_account_id 
    END,
    updated_at = now()
  WHERE id = account_id_param AND user_id = auth.uid();
END;
$function$;

-- Update the create_default_chart_of_accounts function to remove account codes
CREATE OR REPLACE FUNCTION public.create_default_chart_of_accounts()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO public.chart_of_accounts (user_id, account_name, account_type, account_subtype) VALUES
    (NEW.id, 'Assets', 'asset', 'Current Assets'),
    (NEW.id, 'Cash and Cash Equivalents', 'asset', 'Current Assets'),
    (NEW.id, 'Cash in Hand', 'asset', 'Current Assets'),
    (NEW.id, 'Bank Account - Current', 'asset', 'Current Assets'),
    (NEW.id, 'Bank Account - Savings', 'asset', 'Current Assets'),
    (NEW.id, 'Accounts Receivable', 'asset', 'Current Assets'),
    (NEW.id, 'Trade Debtors', 'asset', 'Current Assets'),
    (NEW.id, 'Inventory', 'asset', 'Current Assets'),
    (NEW.id, 'Raw Materials', 'asset', 'Current Assets'),
    (NEW.id, 'Finished Goods', 'asset', 'Current Assets'),
    (NEW.id, 'Prepaid Expenses', 'asset', 'Current Assets'),
    (NEW.id, 'Fixed Assets', 'asset', 'Non-Current Assets'),
    (NEW.id, 'Plant and Machinery', 'asset', 'Non-Current Assets'),
    (NEW.id, 'Furniture and Fixtures', 'asset', 'Non-Current Assets'),
    (NEW.id, 'Computer Equipment', 'asset', 'Non-Current Assets'),
    (NEW.id, 'Liabilities', 'liability', 'Current Liabilities'),
    (NEW.id, 'Accounts Payable', 'liability', 'Current Liabilities'),
    (NEW.id, 'Trade Creditors', 'liability', 'Current Liabilities'),
    (NEW.id, 'Tax Liabilities', 'liability', 'Current Liabilities'),
    (NEW.id, 'GST Payable', 'liability', 'Current Liabilities'),
    (NEW.id, 'TDS Payable', 'liability', 'Current Liabilities'),
    (NEW.id, 'Income Tax Payable', 'liability', 'Current Liabilities'),
    (NEW.id, 'Long-term Liabilities', 'liability', 'Non-Current Liabilities'),
    (NEW.id, 'Bank Loan', 'liability', 'Non-Current Liabilities'),
    (NEW.id, 'Equity', 'equity', 'Capital'),
    (NEW.id, 'Share Capital', 'equity', 'Capital'),
    (NEW.id, 'Retained Earnings', 'equity', 'Capital'),
    (NEW.id, 'Income', 'income', 'Operating Income'),
    (NEW.id, 'Sales Revenue', 'income', 'Operating Income'),
    (NEW.id, 'Service Revenue', 'income', 'Operating Income'),
    (NEW.id, 'Other Income', 'income', 'Non-Operating Income'),
    (NEW.id, 'Interest Income', 'income', 'Non-Operating Income'),
    (NEW.id, 'Expenses', 'expense', 'Operating Expenses'),
    (NEW.id, 'Cost of Goods Sold', 'expense', 'Operating Expenses'),
    (NEW.id, 'Salaries and Wages', 'expense', 'Operating Expenses'),
    (NEW.id, 'Rent Expense', 'expense', 'Operating Expenses'),
    (NEW.id, 'Utilities Expense', 'expense', 'Operating Expenses'),
    (NEW.id, 'Professional Fees', 'expense', 'Operating Expenses'),
    (NEW.id, 'Marketing Expenses', 'expense', 'Operating Expenses'),
    (NEW.id, 'Travel Expenses', 'expense', 'Operating Expenses'),
    (NEW.id, 'Depreciation Expense', 'expense', 'Operating Expenses'),
    (NEW.id, 'Interest Expense', 'expense', 'Non-Operating Expenses');
  
  RETURN NEW;
END;
$function$;

-- Remove the is_account_used_in_entries function as it's no longer needed
DROP FUNCTION IF EXISTS public.is_account_used_in_entries(text);
