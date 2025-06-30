import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Tables } from '@/integrations/supabase/types';

// Use the Supabase-generated types directly
export type BankAccount = Tables<'bank_accounts'>;
export type BankTransaction = Tables<'bank_transactions'> & {
  bank_accounts?: Pick<BankAccount, 'account_name' | 'bank_name'>;
};
export type TransactionCategory = Tables<'transaction_categories'>;
export type ChartOfAccount = Tables<'chart_of_accounts'>;

export const useBankTransactions = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch bank accounts
  const {
    data: bankAccounts = [],
    isLoading: isLoadingAccounts
  } = useQuery({
    queryKey: ['bankAccounts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bank_accounts')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  // Fetch bank transactions
  const {
    data: transactions = [],
    isLoading: isLoadingTransactions
  } = useQuery({
    queryKey: ['bankTransactions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bank_transactions')
        .select(`
          *,
          bank_accounts!inner(account_name, bank_name)
        `)
        .order('transaction_date', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  // Fetch transaction categories (keeping for backward compatibility)
  const {
    data: categories = [],
    isLoading: isLoadingCategories
  } = useQuery({
    queryKey: ['transactionCategories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transaction_categories')
        .select('*')
        .order('name');

      if (error) throw error;
      return data;
    }
  });

  // Fetch chart of accounts
  const {
    data: chartOfAccounts = [],
    isLoading: isLoadingChartOfAccounts
  } = useQuery({
    queryKey: ['chartOfAccounts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chart_of_accounts')
        .select('*')
        .eq('is_active', true)
        .order('account_name');

      if (error) throw error;
      return data;
    }
  });

  // Create bank account mutation
  const createAccountMutation = useMutation({
    mutationFn: async (accountData: Omit<BankAccount, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('bank_accounts')
        .insert({
          ...accountData,
          user_id: user.id,
          current_balance: accountData.opening_balance
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bankAccounts'] });
      toast({
        title: "Bank account added",
        description: "Your bank account has been successfully added."
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add account",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Create chart of accounts entry mutation
  const createChartAccountMutation = useMutation({
    mutationFn: async (accountData: {
      account_name: string;
      account_type: 'asset' | 'liability' | 'equity' | 'income' | 'expense';
      account_subtype?: string;
      opening_balance?: number;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('chart_of_accounts')
        .insert({
          ...accountData,
          user_id: user.id,
          current_balance: accountData.opening_balance || 0,
          opening_balance: accountData.opening_balance || 0
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chartOfAccounts'] });
      toast({
        title: "Account created",
        description: "New account has been successfully created."
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create account",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Update transaction mutation
  const updateTransactionMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<BankTransaction> }) => {
      const { data, error } = await supabase
        .from('bank_transactions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bankTransactions'] });
      toast({
        title: "Transaction updated",
        description: "The transaction has been successfully updated."
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update transaction",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Categorize transaction mutation
  const categorizeTransactionMutation = useMutation({
    mutationFn: async ({ id, category }: { id: string; category: string }) => {
      const { data, error } = await supabase
        .from('bank_transactions')
        .update({
          category,
          status: 'categorized',
          is_reviewed: true
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bankTransactions'] });
      toast({
        title: "Transaction categorized",
        description: "The transaction has been categorized successfully."
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to categorize transaction",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Bulk categorize transactions mutation
  const bulkCategorizeTransactionsMutation = useMutation({
    mutationFn: async ({ ids, category }: { ids: string[]; category: string }) => {
      const { data, error } = await supabase
        .from('bank_transactions')
        .update({
          category,
          status: 'categorized',
          is_reviewed: true
        })
        .in('id', ids)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['bankTransactions'] });
      toast({
        title: "Transactions categorized",
        description: `${data?.length || 0} transactions have been categorized successfully.`
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to categorize transactions",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Enhanced post transaction mutation with journal entry creation
  const postTransactionMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get the transaction details first
      const { data: transaction, error: fetchError } = await supabase
        .from('bank_transactions')
        .select(`
          *,
          bank_accounts!inner(account_name, bank_name)
        `)
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;
      if (!transaction) throw new Error('Transaction not found');
      if (!transaction.category) throw new Error('Transaction must be categorized before posting');

      // Get the bank account from chart of accounts
      const { data: bankAccount, error: bankAccountError } = await supabase
        .from('chart_of_accounts')
        .select('id')
        .eq('account_name', transaction.bank_accounts?.account_name || 'Bank Account - Current')
        .eq('user_id', user.id)
        .single();

      if (bankAccountError || !bankAccount) {
        throw new Error('Bank account not found in chart of accounts');
      }

      // Get category account from chart of accounts
      const { data: categoryAccount, error: categoryAccountError } = await supabase
        .from('chart_of_accounts')
        .select('id')
        .eq('account_name', transaction.category)
        .eq('user_id', user.id)
        .single();

      if (categoryAccountError || !categoryAccount) {
        throw new Error('Category account not found in chart of accounts');
      }

      // Generate journal entry number
      const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const { data: existingEntries } = await supabase
        .from('journal_entries')
        .select('entry_number')
        .like('entry_number', `JE${today}%`)
        .order('entry_number', { ascending: false })
        .limit(1);

      let sequence = 1;
      if (existingEntries && existingEntries.length > 0) {
        const lastNumber = existingEntries[0].entry_number;
        const lastSequence = parseInt(lastNumber.slice(-3));
        sequence = lastSequence + 1;
      }

      const entryNumber = `JE${today}${sequence.toString().padStart(3, '0')}`;

      // Create journal entry
      const { data: journalEntry, error: entryError } = await supabase
        .from('journal_entries')
        .insert({
          user_id: user.id,
          entry_number: entryNumber,
          entry_date: transaction.transaction_date,
          description: `Bank transaction: ${transaction.description}`,
          reference_type: 'bank_transaction',
          reference_id: transaction.id,
          total_debit: transaction.amount,
          total_credit: transaction.amount,
          status: 'posted'
        })
        .select()
        .single();

      if (entryError) throw entryError;

      // Create journal entry lines
      const isCredit = transaction.transaction_type === 'credit';
      const lines = [
        {
          journal_entry_id: journalEntry.id,
          account_id: bankAccount.id,
          account_name: transaction.bank_accounts?.account_name || 'Bank Account',
          description: transaction.description,
          debit_amount: isCredit ? transaction.amount : 0,
          credit_amount: isCredit ? 0 : transaction.amount,
          line_order: 1
        },
        {
          journal_entry_id: journalEntry.id,
          account_id: categoryAccount.id,
          account_name: transaction.category,
          description: transaction.description,
          debit_amount: isCredit ? 0 : transaction.amount,
          credit_amount: isCredit ? transaction.amount : 0,
          line_order: 2
        }
      ];

      const { error: linesError } = await supabase
        .from('journal_entry_lines')
        .insert(lines);

      if (linesError) throw linesError;

      // Update account balances using the new function signature
      for (const line of lines) {
        const balanceChange = line.debit_amount - line.credit_amount;
        
        try {
          const { error: rpcError } = await supabase
            .rpc('update_account_balance', {
              account_id_param: line.account_id,
              balance_change: balanceChange
            });

          if (rpcError) {
            console.warn('RPC function failed, using fallback:', rpcError);
            throw rpcError;
          }
        } catch (rpcError) {
          // Fallback to direct update
          const { data: accountData } = await supabase
            .from('chart_of_accounts')
            .select('current_balance')
            .eq('id', line.account_id)
            .eq('user_id', user.id)
            .single();

          const currentBalance = accountData?.current_balance || 0;
          const newBalance = currentBalance + balanceChange;

          const { error: directError } = await supabase
            .from('chart_of_accounts')
            .update({
              current_balance: newBalance,
              updated_at: new Date().toISOString()
            })
            .eq('id', line.account_id)
            .eq('user_id', user.id);

          if (directError) throw directError;
        }
      }

      // Create day book entries
      const dayBookEntries = lines.map((line) => ({
        user_id: user.id,
        journal_entry_id: journalEntry.id,
        entry_date: transaction.transaction_date,
        account_id: line.account_id,
        account_name: line.account_name,
        description: line.description,
        debit_amount: line.debit_amount,
        credit_amount: line.credit_amount,
        reference_number: entryNumber
      }));

      const { error: dayBookError } = await supabase
        .from('day_book_entries')
        .insert(dayBookEntries);

      if (dayBookError) throw dayBookError;

      // Update bank transaction status and link to journal entry
      const { data, error } = await supabase
        .from('bank_transactions')
        .update({
          status: 'posted',
          journal_entry_id: journalEntry.id
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bankTransactions'] });
      queryClient.invalidateQueries({ queryKey: ['journalEntries'] });
      queryClient.invalidateQueries({ queryKey: ['chartOfAccounts'] });
      toast({
        title: "Transaction posted",
        description: "Transaction has been posted and journal entry created successfully."
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to post transaction",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Enhanced bulk post transactions mutation
  const bulkPostTransactionsMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const results = [];
      for (const id of ids) {
        try {
          await postTransactionMutation.mutateAsync(id);
          results.push({ id, success: true });
        } catch (error) {
          console.error(`Failed to post transaction ${id}:`, error);
          results.push({ id, success: false, error });
        }
      }
      return results;
    },
    onSuccess: (results) => {
      const successCount = results.filter(r => r.success).length;
      const failureCount = results.filter(r => !r.success).length;
      
      queryClient.invalidateQueries({ queryKey: ['bankTransactions'] });
      queryClient.invalidateQueries({ queryKey: ['journalEntries'] });
      queryClient.invalidateQueries({ queryKey: ['chartOfAccounts'] });
      
      if (failureCount === 0) {
        toast({
          title: "Transactions posted",
          description: `${successCount} transactions have been posted successfully.`
        });
      } else {
        toast({
          title: "Partial success",
          description: `${successCount} transactions posted, ${failureCount} failed.`,
          variant: "destructive"
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to post transactions",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Process statement for AI categorization
  const processStatementMutation = useMutation({
    mutationFn: async (documentId: string) => {
      const { error } = await supabase.functions.invoke('ai-categorization', {
        body: { documentId }
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bankTransactions'] });
      toast({
        title: "Statement processed",
        description: "Bank statement has been processed and transactions categorized."
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Processing failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Delete transaction mutation
  const deleteTransactionMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log('Attempting to delete transaction:', id);
      const { error } = await supabase
        .from('bank_transactions')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Delete transaction error:', error);
        throw error;
      }
      console.log('Transaction deleted successfully:', id);
    },
    onSuccess: (_, deletedId) => {
      console.log('Delete transaction success callback triggered for:', deletedId);
      queryClient.invalidateQueries({ queryKey: ['bankTransactions'] });
      toast({
        title: "Transaction deleted",
        description: "The transaction has been deleted successfully."
      });
    },
    onError: (error: Error) => {
      console.error('Delete transaction mutation error:', error);
      toast({
        title: "Failed to delete transaction",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Bulk delete transactions mutation
  const bulkDeleteTransactionsMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      console.log('Attempting to bulk delete transactions:', ids);
      const { error } = await supabase
        .from('bank_transactions')
        .delete()
        .in('id', ids);

      if (error) {
        console.error('Bulk delete transactions error:', error);
        throw error;
      }
      console.log('Transactions bulk deleted successfully:', ids);
      return ids;
    },
    onSuccess: (deletedIds) => {
      console.log('Bulk delete transactions success callback triggered for:', deletedIds);
      queryClient.invalidateQueries({ queryKey: ['bankTransactions'] });
      toast({
        title: "Transactions deleted",
        description: `${deletedIds.length} transactions have been deleted successfully.`
      });
    },
    onError: (error: Error) => {
      console.error('Bulk delete transactions mutation error:', error);
      toast({
        title: "Failed to delete transactions",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  return {
    // Data
    bankAccounts,
    transactions,
    categories,
    chartOfAccounts,
    
    // Loading states
    isLoadingAccounts,
    isLoadingTransactions,
    isLoadingCategories,
    isLoadingChartOfAccounts,
    
    // Actions
    createAccount: createAccountMutation.mutate,
    createChartAccount: createChartAccountMutation.mutate,
    updateTransaction: updateTransactionMutation.mutate,
    categorizeTransaction: categorizeTransactionMutation.mutate,
    bulkCategorizeTransactions: bulkCategorizeTransactionsMutation.mutate,
    postTransaction: postTransactionMutation.mutate,
    bulkPostTransactions: bulkPostTransactionsMutation.mutate,
    processStatement: processStatementMutation.mutate,
    deleteTransaction: deleteTransactionMutation.mutate,
    bulkDeleteTransactions: bulkDeleteTransactionsMutation.mutate,
    
    // Loading states for mutations
    isCreatingAccount: createAccountMutation.isPending,
    isCreatingChartAccount: createChartAccountMutation.isPending,
    isUpdatingTransaction: updateTransactionMutation.isPending,
    isCategorizing: categorizeTransactionMutation.isPending,
    isBulkCategorizing: bulkCategorizeTransactionsMutation.isPending,
    isPosting: postTransactionMutation.isPending,
    isBulkPosting: bulkPostTransactionsMutation.isPending,
    isProcessing: processStatementMutation.isPending,
    isDeleting: deleteTransactionMutation.isPending,
    isBulkDeleting: bulkDeleteTransactionsMutation.isPending
  };
};
