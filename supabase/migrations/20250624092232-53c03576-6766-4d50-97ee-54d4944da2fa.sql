
-- Create the missing RPC function to update account balances
CREATE OR REPLACE FUNCTION public.update_account_balance(
  account_code TEXT,
  balance_change NUMERIC
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update the current balance for the specified account
  UPDATE public.chart_of_accounts 
  SET current_balance = COALESCE(current_balance, 0) + balance_change,
      updated_at = now()
  WHERE account_code = update_account_balance.account_code
    AND user_id = auth.uid();
  
  -- Check if the account was found and updated
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Account with code % not found or access denied', account_code;
  END IF;
END;
$$;
