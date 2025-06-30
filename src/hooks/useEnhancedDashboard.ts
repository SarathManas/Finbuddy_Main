
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useEnhancedDashboard = () => {
  return useQuery({
    queryKey: ['enhanced-dashboard-data'],
    queryFn: async () => {
      console.log('Fetching enhanced dashboard data...');
      
      const [
        invoicesResult,
        customersResult,
        transactionsResult,
        bankAccountsResult,
        productsResult,
        documentsResult,
        quotationsResult,
        journalEntriesResult
      ] = await Promise.all([
        supabase.from('invoices').select('*'),
        supabase.from('customers').select('*'),
        supabase.from('transactions').select('*'),
        supabase.from('bank_accounts').select('*'),
        supabase.from('products').select('*'),
        supabase.from('documents').select('*'),
        supabase.from('quotations').select('*'),
        supabase.from('journal_entries').select('*')
      ]);

      // Log any errors for debugging
      [invoicesResult, customersResult, transactionsResult, bankAccountsResult, 
       productsResult, documentsResult, quotationsResult, journalEntriesResult].forEach((result, index) => {
        const names = ['invoices', 'customers', 'transactions', 'bank_accounts', 'products', 'documents', 'quotations', 'journal_entries'];
        if (result.error) {
          console.error(`Error fetching ${names[index]}:`, result.error);
        } else {
          console.log(`Successfully fetched ${result.data?.length || 0} ${names[index]}`);
        }
      });

      return {
        invoices: invoicesResult.data || [],
        customers: customersResult.data || [],
        transactions: transactionsResult.data || [],
        bankAccounts: bankAccountsResult.data || [],
        products: productsResult.data || [],
        documents: documentsResult.data || [],
        quotations: quotationsResult.data || [],
        journalEntries: journalEntriesResult.data || []
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 10, // 10 minutes
  });
};
