
-- Add unique constraint for account code per user to prevent duplicates
ALTER TABLE public.chart_of_accounts 
ADD CONSTRAINT unique_account_code_per_user UNIQUE (user_id, account_code);

-- Add index for better performance on account lookups
CREATE INDEX IF NOT EXISTS idx_chart_of_accounts_user_account_code 
ON public.chart_of_accounts(user_id, account_code);

-- Add index for parent_account_id for hierarchy queries
CREATE INDEX IF NOT EXISTS idx_chart_of_accounts_parent_id 
ON public.chart_of_accounts(parent_account_id);

-- Create function to check if account is used in journal entries
CREATE OR REPLACE FUNCTION public.is_account_used_in_entries(account_code_param TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.journal_entry_lines 
    WHERE account_code = account_code_param
    LIMIT 1
  );
END;
$$;

-- Create function to get account hierarchy
CREATE OR REPLACE FUNCTION public.get_account_hierarchy(user_id_param UUID)
RETURNS TABLE (
  id UUID,
  account_code TEXT,
  account_name TEXT,
  account_type TEXT,
  account_subtype TEXT,
  parent_account_id UUID,
  level INTEGER,
  path TEXT[]
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH RECURSIVE account_tree AS (
    -- Base case: root accounts (no parent)
    SELECT 
      a.id,
      a.account_code,
      a.account_name,
      a.account_type::TEXT,
      a.account_subtype,
      a.parent_account_id,
      0 as level,
      ARRAY[a.account_code] as path
    FROM public.chart_of_accounts a
    WHERE a.user_id = user_id_param 
      AND a.parent_account_id IS NULL
      AND a.is_active = true
    
    UNION ALL
    
    -- Recursive case: child accounts
    SELECT 
      a.id,
      a.account_code,
      a.account_name,
      a.account_type::TEXT,
      a.account_subtype,
      a.parent_account_id,
      at.level + 1,
      at.path || a.account_code
    FROM public.chart_of_accounts a
    INNER JOIN account_tree at ON a.parent_account_id = at.id
    WHERE a.user_id = user_id_param 
      AND a.is_active = true
  )
  SELECT * FROM account_tree
  ORDER BY path;
END;
$$;

-- Update the existing update_account_balance function to handle account updates
CREATE OR REPLACE FUNCTION public.update_chart_of_account(
  account_id_param UUID,
  updates JSONB
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  old_account_code TEXT;
  new_account_code TEXT;
BEGIN
  -- Get the current account code
  SELECT account_code INTO old_account_code
  FROM public.chart_of_accounts
  WHERE id = account_id_param AND user_id = auth.uid();
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Account not found or access denied';
  END IF;
  
  -- Extract new account code if being updated
  new_account_code := updates->>'account_code';
  
  -- Update the account
  UPDATE public.chart_of_accounts
  SET 
    account_code = COALESCE(new_account_code, account_code),
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
  
  -- If account code changed, update journal entry lines
  IF new_account_code IS NOT NULL AND new_account_code != old_account_code THEN
    UPDATE public.journal_entry_lines
    SET account_code = new_account_code
    WHERE account_code = old_account_code;
  END IF;
END;
$$;
