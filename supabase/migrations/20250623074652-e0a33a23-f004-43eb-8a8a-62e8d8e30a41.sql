
-- Add RLS policies for bank_transactions table to allow users to manage their own transactions
-- This will enable the delete functionality to work properly

-- Ensure RLS is enabled (it should already be enabled from the migration)
ALTER TABLE public.bank_transactions ENABLE ROW LEVEL SECURITY;

-- Create policy for users to delete their own bank transactions
CREATE POLICY "Users can delete their own bank transactions" 
  ON public.bank_transactions 
  FOR DELETE 
  TO authenticated 
  USING (auth.uid() = user_id);
