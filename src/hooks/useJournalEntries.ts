
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Tables } from '@/integrations/supabase/types';

// Use the Supabase-generated types directly
export type ChartOfAccount = Tables<'chart_of_accounts'>;
export type JournalEntry = Tables<'journal_entries'> & {
  journal_entry_lines?: JournalEntryLine[];
};
export type JournalEntryLine = Tables<'journal_entry_lines'>;

export const useJournalEntries = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch chart of accounts
  const {
    data: chartOfAccounts = [],
    isLoading: isLoadingAccounts
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

  // Fetch journal entries
  const {
    data: journalEntries = [],
    isLoading: isLoadingEntries
  } = useQuery({
    queryKey: ['journalEntries'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('journal_entries')
        .select(`
          *,
          journal_entry_lines(*)
        `)
        .order('entry_date', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  // Create chart of account mutation
  const createChartOfAccountMutation = useMutation({
    mutationFn: async (accountData: {
      account_name: string;
      account_type: string;
      account_subtype?: string;
      parent_account_id?: string | null;
      opening_balance: number;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('chart_of_accounts')
        .insert({
          user_id: user.id,
          account_name: accountData.account_name,
          account_type: accountData.account_type as "asset" | "liability" | "equity" | "income" | "expense",
          account_subtype: accountData.account_subtype,
          parent_account_id: accountData.parent_account_id,
          opening_balance: accountData.opening_balance,
          current_balance: accountData.opening_balance
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chartOfAccounts'] });
      toast({
        title: "Account Created",
        description: "New account has been created successfully."
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Create Account",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Update chart of account mutation
  const updateChartOfAccountMutation = useMutation({
    mutationFn: async ({ accountId, updates }: { accountId: string; updates: any }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Use the new RPC function for updating accounts
      const { error } = await supabase.rpc('update_chart_of_account', {
        account_id_param: accountId,
        updates: updates
      });

      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chartOfAccounts'] });
      toast({
        title: "Account Updated",
        description: "Chart of account has been updated successfully."
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Update Account",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Create journal entry mutation
  const createJournalEntryMutation = useMutation({
    mutationFn: async (entryData: {
      description: string;
      entry_date: string;
      reference_type?: string;
      reference_id?: string;
      lines: Array<{
        account_id: string;
        account_name: string;
        description?: string;
        debit_amount: number;
        credit_amount: number;
      }>;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Generate entry number
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

      // Calculate totals
      const totalDebit = entryData.lines.reduce((sum, line) => sum + line.debit_amount, 0);
      const totalCredit = entryData.lines.reduce((sum, line) => sum + line.credit_amount, 0);

      if (Math.abs(totalDebit - totalCredit) > 0.01) {
        throw new Error('Journal entry is not balanced. Total debits must equal total credits.');
      }

      // Create journal entry
      const { data: journalEntry, error: entryError } = await supabase
        .from('journal_entries')
        .insert({
          user_id: user.id,
          entry_number: entryNumber,
          entry_date: entryData.entry_date,
          description: entryData.description,
          reference_type: entryData.reference_type,
          reference_id: entryData.reference_id,
          total_debit: totalDebit,
          total_credit: totalCredit,
          status: 'draft'
        })
        .select()
        .single();

      if (entryError) throw entryError;

      // Create journal entry lines
      const lines = entryData.lines.map((line, index) => ({
        journal_entry_id: journalEntry.id,
        account_id: line.account_id,
        account_name: line.account_name,
        description: line.description,
        debit_amount: line.debit_amount,
        credit_amount: line.credit_amount,
        line_order: index + 1
      }));

      const { error: linesError } = await supabase
        .from('journal_entry_lines')
        .insert(lines);

      if (linesError) throw linesError;

      return journalEntry;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journalEntries'] });
      queryClient.invalidateQueries({ queryKey: ['chartOfAccounts'] });
      toast({
        title: "Journal Entry Created",
        description: "Journal entry has been created successfully."
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Create Journal Entry",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Post journal entry mutation
  const postJournalEntryMutation = useMutation({
    mutationFn: async (entryId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Update journal entry status
      const { data, error } = await supabase
        .from('journal_entries')
        .update({
          status: 'posted',
          posted_at: new Date().toISOString(),
          posted_by: user.id
        })
        .eq('id', entryId)
        .select(`
          *,
          journal_entry_lines(*)
        `)
        .single();

      if (error) throw error;

      // Update account balances using account_id
      for (const line of data.journal_entry_lines) {
        const balanceChange = line.debit_amount - line.credit_amount;
        
        const { error: balanceError } = await supabase
          .rpc('update_account_balance', {
            account_id_param: line.account_id,
            balance_change: balanceChange
          });

        if (balanceError) throw balanceError;
      }

      // Create day book entries
      const dayBookEntries = data.journal_entry_lines.map((line: any) => ({
        user_id: user.id,
        journal_entry_id: entryId,
        entry_date: data.entry_date,
        account_id: line.account_id,
        account_name: line.account_name,
        description: line.description || data.description,
        debit_amount: line.debit_amount,
        credit_amount: line.credit_amount,
        reference_number: data.entry_number
      }));

      const { error: dayBookError } = await supabase
        .from('day_book_entries')
        .insert(dayBookEntries);

      if (dayBookError) throw dayBookError;

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journalEntries'] });
      queryClient.invalidateQueries({ queryKey: ['chartOfAccounts'] });
      toast({
        title: "Journal Entry Posted",
        description: "Journal entry has been posted successfully."
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Post Journal Entry",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Delete journal entry mutation
  const deleteJournalEntryMutation = useMutation({
    mutationFn: async (entryId: string) => {
      const { error } = await supabase
        .from('journal_entries')
        .delete()
        .eq('id', entryId)
        .eq('status', 'draft'); // Only allow deletion of draft entries

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journalEntries'] });
      toast({
        title: "Journal Entry Deleted",
        description: "Journal entry has been deleted successfully."
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Delete Journal Entry",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  return {
    // Data
    chartOfAccounts,
    journalEntries,
    
    // Loading states
    isLoadingAccounts,
    isLoadingEntries,
    
    // Actions
    createJournalEntry: createJournalEntryMutation.mutate,
    postJournalEntry: postJournalEntryMutation.mutate,
    deleteJournalEntry: deleteJournalEntryMutation.mutate,
    updateChartOfAccount: updateChartOfAccountMutation.mutate,
    createChartOfAccount: createChartOfAccountMutation.mutate,
    
    // Loading states for mutations
    isCreating: createJournalEntryMutation.isPending,
    isPosting: postJournalEntryMutation.isPending,
    isDeleting: deleteJournalEntryMutation.isPending,
    isUpdatingAccount: updateChartOfAccountMutation.isPending,
    isCreatingAccount: createChartOfAccountMutation.isPending
  };
};
