
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface Quotation {
  id: string;
  quotation_number: string;
  customer_id: string;
  status: string;
  issue_date: string;
  valid_until: string;
  subtotal: number;
  tax_rate: number | null;
  tax_amount: number | null;
  total: number;
  notes: string | null;
  terms_conditions: string | null;
  created_at: string;
  updated_at: string;
  customers?: {
    name: string;
    email: string;
    legal_name: string | null;
  };
  quotation_items?: QuotationItem[];
}

export interface QuotationItem {
  id: string;
  quotation_id: string;
  product_id: string | null;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
  created_at: string;
}

export const useQuotations = () => {
  const queryClient = useQueryClient();

  const { data: quotations, isLoading, error } = useQuery({
    queryKey: ['quotations-with-customers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quotations')
        .select(`
          *,
          customers (
            name,
            email,
            legal_name
          ),
          quotation_items (*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Quotation[];
    }
  });

  const convertToInvoiceMutation = useMutation({
    mutationFn: async (quotationId: string) => {
      // Get the quotation and its items
      const { data: quotation, error: quotationError } = await supabase
        .from('quotations')
        .select(`
          *,
          quotation_items (*)
        `)
        .eq('id', quotationId)
        .single();

      if (quotationError) throw quotationError;

      // Generate invoice number
      const invoiceNumber = `INV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;

      // Create invoice from quotation
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert({
          invoice_number: invoiceNumber,
          customer_id: quotation.customer_id,
          quotation_id: quotation.id,
          invoice_type: 'converted',
          issue_date: new Date().toISOString().split('T')[0],
          due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
          subtotal: quotation.subtotal,
          tax_rate: quotation.tax_rate,
          tax_amount: quotation.tax_amount,
          total: quotation.total,
          status: 'draft'
        })
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      // Create invoice items from quotation items
      const invoiceItems = quotation.quotation_items?.map(item => ({
        invoice_id: invoice.id,
        product_id: item.product_id,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total: item.total
      })) || [];

      if (invoiceItems.length > 0) {
        const { error: itemsError } = await supabase
          .from('invoice_items')
          .insert(invoiceItems);

        if (itemsError) throw itemsError;
      }

      // Update quotation status to converted
      const { error: updateError } = await supabase
        .from('quotations')
        .update({ status: 'converted' })
        .eq('id', quotationId);

      if (updateError) throw updateError;

      return invoice;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotations-with-customers'] });
      queryClient.invalidateQueries({ queryKey: ['invoices-with-customers'] });
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { data, error } = await supabase
        .from('quotations')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotations-with-customers'] });
    }
  });

  return {
    quotations,
    isLoading,
    error,
    convertToInvoice: convertToInvoiceMutation.mutateAsync,
    updateStatus: updateStatusMutation.mutateAsync,
    isConverting: convertToInvoiceMutation.isPending,
    isUpdatingStatus: updateStatusMutation.isPending
  };
};
