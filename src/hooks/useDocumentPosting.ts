
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Document } from '@/hooks/useDocuments';

export const useDocumentPosting = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const postSalesDocument = useMutation({
    mutationFn: async (document: Document) => {
      console.log('Posting sales document:', document.id);
      
      const data = document.extracted_data;
      if (!data) throw new Error('No extracted data found');

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // First, try to find or create customer
      let customerId: string | null = null;
      if (data.customer_name) {
        const { data: existingCustomer } = await supabase
          .from('customers')
          .select('id')
          .ilike('name', data.customer_name)
          .single();

        if (existingCustomer) {
          customerId = existingCustomer.id;
        } else {
          // Create new customer
          const { data: newCustomer, error: customerError } = await supabase
            .from('customers')
            .insert({
              name: data.customer_name,
              legal_name: data.customer_name,
              email: `${data.customer_name.toLowerCase().replace(/\s+/g, '')}@example.com`,
              phone: '0000000000',
              address: 'Address not provided',
              state: 'Not specified',
              place: 'Not specified',
              pincode: '000000'
            })
            .select('id')
            .single();

          if (customerError) throw customerError;
          customerId = newCustomer.id;
        }
      }

      // Create invoice
      const invoiceData = {
        customer_id: customerId,
        invoice_number: data.invoice_number || `INV-${Date.now()}`,
        invoice_date: data.invoice_date || new Date().toISOString().split('T')[0],
        due_date: data.due_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        subtotal: Number(data.total_amount) || 0,
        tax_amount: Number(data.tax_amount) || 0,
        total_amount: Number(data.total_amount) || 0,
        status: 'draft',
        notes: `Generated from document: ${document.file_name}`,
        terms_conditions: 'Standard terms and conditions apply'
      };

      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert(invoiceData)
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      // Update document as posted
      const { error: updateError } = await supabase
        .from('documents')
        .update({
          extracted_data: {
            ...data,
            posted: true,
            posted_at: new Date().toISOString(),
            posted_reference_id: invoice.id,
            posted_reference_type: 'invoice'
          }
        })
        .eq('id', document.id);

      if (updateError) throw updateError;

      return { invoice, document };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['invoices-with-customers'] });
      toast({
        title: "Sales document posted",
        description: "Invoice has been created successfully."
      });
    },
    onError: (error: Error) => {
      console.error('Error posting sales document:', error);
      toast({
        title: "Posting failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const postPurchaseDocument = useMutation({
    mutationFn: async (document: Document) => {
      console.log('Posting purchase document:', document.id);
      
      const data = document.extracted_data;
      if (!data) throw new Error('No extracted data found');

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Create journal entry for purchase
      const journalData = {
        entry_number: `PUR-${Date.now()}`,
        entry_date: data.order_date || new Date().toISOString().split('T')[0],
        description: `Purchase from ${data.vendor_name || 'Unknown vendor'} - PO: ${data.po_number || 'N/A'}`,
        reference_id: data.po_number || null,
        reference_type: 'purchase_order',
        total_debit: Number(data.total_amount) || 0,
        total_credit: Number(data.total_amount) || 0,
        status: 'posted' as const,
        user_id: user.id
      };

      const { data: journalEntry, error: journalError } = await supabase
        .from('journal_entries')
        .insert(journalData)
        .select()
        .single();

      if (journalError) throw journalError;

      // Update document as posted
      const { error: updateError } = await supabase
        .from('documents')
        .update({
          extracted_data: {
            ...data,
            posted: true,
            posted_at: new Date().toISOString(),
            posted_reference_id: journalEntry.id,
            posted_reference_type: 'journal_entry'
          }
        })
        .eq('id', document.id);

      if (updateError) throw updateError;

      return { journalEntry, document };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['journal-entries'] });
      toast({
        title: "Purchase document posted",
        description: "Journal entry has been created successfully."
      });
    },
    onError: (error: Error) => {
      console.error('Error posting purchase document:', error);
      toast({
        title: "Posting failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const postExpenseDocument = useMutation({
    mutationFn: async (document: Document) => {
      console.log('Posting expense document:', document.id);
      
      const data = document.extracted_data;
      if (!data) throw new Error('No extracted data found');

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Create journal entry for expense
      const journalData = {
        entry_number: `EXP-${Date.now()}`,
        entry_date: data.expense_date || new Date().toISOString().split('T')[0],
        description: `${data.expense_category || 'Expense'} - ${data.merchant_name || 'Unknown merchant'}`,
        reference_id: data.receipt_number || null,
        reference_type: 'expense_receipt',
        total_debit: Number(data.total_amount) || 0,
        total_credit: Number(data.total_amount) || 0,
        status: 'posted' as const,
        user_id: user.id
      };

      const { data: journalEntry, error: journalError } = await supabase
        .from('journal_entries')
        .insert(journalData)
        .select()
        .single();

      if (journalError) throw journalError;

      // Update document as posted
      const { error: updateError } = await supabase
        .from('documents')
        .update({
          extracted_data: {
            ...data,
            posted: true,
            posted_at: new Date().toISOString(),
            posted_reference_id: journalEntry.id,
            posted_reference_type: 'journal_entry'
          }
        })
        .eq('id', document.id);

      if (updateError) throw updateError;

      return { journalEntry, document };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['journal-entries'] });
      toast({
        title: "Expense document posted",
        description: "Journal entry has been created successfully."
      });
    },
    onError: (error: Error) => {
      console.error('Error posting expense document:', error);
      toast({
        title: "Posting failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  return {
    postSalesDocument: postSalesDocument.mutate,
    postPurchaseDocument: postPurchaseDocument.mutate,
    postExpenseDocument: postExpenseDocument.mutate,
    isPostingSales: postSalesDocument.isPending,
    isPostingPurchase: postPurchaseDocument.isPending,
    isPostingExpense: postExpenseDocument.isPending
  };
};
