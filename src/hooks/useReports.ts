import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';

export interface DateRange {
  from: Date;
  to: Date;
}

export interface DayBookEntry {
  id: string;
  entry_date: string;
  account_name: string;
  description: string;
  debit_amount: number;
  credit_amount: number;
  reference_number: string;
}

export interface TrialBalanceEntry {
  account_name: string;
  account_type: string;
  debit_balance: number;
  credit_balance: number;
}

export interface ProfitLossEntry {
  account_name: string;
  account_type: string;
  amount: number;
}

export interface BalanceSheetEntry {
  account_name: string;
  account_type: string;
  amount: number;
}

export const useReports = () => {
  const { toast } = useToast();

  // Fetch day book entries
  const useDayBook = (dateRange: DateRange) => {
    return useQuery({
      queryKey: ['dayBook', dateRange],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('day_book_entries')
          .select('*')
          .gte('entry_date', format(dateRange.from, 'yyyy-MM-dd'))
          .lte('entry_date', format(dateRange.to, 'yyyy-MM-dd'))
          .order('entry_date', { ascending: false });

        if (error) throw error;
        return data as DayBookEntry[];
      },
      enabled: !!dateRange.from && !!dateRange.to
    });
  };

  // Fetch trial balance data - return raw account data for proper processing
  const useTrialBalance = (dateRange: DateRange) => {
    return useQuery({
      queryKey: ['trialBalance', dateRange],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('chart_of_accounts')
          .select('account_name, account_type, current_balance')
          .eq('is_active', true)
          .order('account_name');

        if (error) throw error;
        return data;
      },
      enabled: !!dateRange.from && !!dateRange.to
    });
  };

  // Fetch profit & loss data - handle negative balances properly
  const useProfitLoss = (dateRange: DateRange) => {
    return useQuery({
      queryKey: ['profitLoss', dateRange],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('chart_of_accounts')
          .select('account_name, account_type, current_balance')
          .in('account_type', ['income', 'expense'])
          .eq('is_active', true)
          .order('account_name');

        if (error) throw error;

        const profitLossData: ProfitLossEntry[] = data.map(account => ({
          account_name: account.account_name,
          account_type: account.account_type,
          amount: account.current_balance
        }));

        return profitLossData;
      },
      enabled: !!dateRange.from && !!dateRange.to
    });
  };

  // Fetch balance sheet data - handle negative balances properly
  const useBalanceSheet = (dateRange: DateRange) => {
    return useQuery({
      queryKey: ['balanceSheet', dateRange],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('chart_of_accounts')
          .select('account_name, account_type, current_balance')
          .in('account_type', ['asset', 'liability', 'equity'])
          .eq('is_active', true)
          .order('account_name');

        if (error) throw error;

        const balanceSheetData: BalanceSheetEntry[] = data.map(account => ({
          account_name: account.account_name,
          account_type: account.account_type,
          amount: account.current_balance
        }));

        return balanceSheetData;
      },
      enabled: !!dateRange.from && !!dateRange.to
    });
  };

  // Fetch bank transactions for cash flow
  const useCashFlow = (dateRange: DateRange) => {
    return useQuery({
      queryKey: ['cashFlow', dateRange],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('bank_transactions')
          .select(`
            *,
            bank_accounts!inner(account_name, bank_name)
          `)
          .gte('transaction_date', format(dateRange.from, 'yyyy-MM-dd'))
          .lte('transaction_date', format(dateRange.to, 'yyyy-MM-dd'))
          .order('transaction_date', { ascending: false });

        if (error) throw error;
        return data;
      },
      enabled: !!dateRange.from && !!dateRange.to
    });
  };

  return {
    useDayBook,
    useTrialBalance,
    useProfitLoss,
    useBalanceSheet,
    useCashFlow
  };
};
