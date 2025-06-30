
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { documentId } = await req.json();
    console.log('Processing document:', documentId);

    // Get the document
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single();

    if (docError || !document) {
      throw new Error(`Document not found: ${docError?.message}`);
    }

    console.log(`Document found: ${document.file_name}, type: ${document.file_type}`);

    // Generate mock bank transactions with a mix of categorized and uncategorized
    const mockTransactions = [
      {
        description: "ATM Withdrawal - Main Street Branch",
        amount: -500.00,
        transaction_type: 'debit',
        transaction_date: '2024-12-20',
        reference_number: 'ATM001234',
        balance_after: 15234.50,
        category: null, // Uncategorized
        status: 'uncategorized',
        ai_category_confidence: null
      },
      {
        description: "Salary Credit - ABC Corp",
        amount: 50000.00,
        transaction_type: 'credit',
        transaction_date: '2024-12-18',
        reference_number: 'SAL001',
        balance_after: 15734.50,
        category: 'Salary',
        status: 'categorized',
        ai_category_confidence: 0.95
      },
      {
        description: "Online Purchase - Amazon India",
        amount: -1299.00,
        transaction_type: 'debit',
        transaction_date: '2024-12-17',
        reference_number: 'AMZ789456',
        balance_after: 14435.50,
        category: null, // Uncategorized
        status: 'uncategorized',
        ai_category_confidence: null
      },
      {
        description: "Mobile Recharge - Airtel",
        amount: -399.00,
        transaction_type: 'debit',
        transaction_date: '2024-12-16',
        reference_number: 'MOB123',
        balance_after: 14834.50,
        category: null, // Uncategorized
        status: 'uncategorized',
        ai_category_confidence: null
      },
      {
        description: "Restaurant Payment - Zomato",
        amount: -850.00,
        transaction_type: 'debit',
        transaction_date: '2024-12-15',
        reference_number: 'ZOM456',
        balance_after: 15233.50,
        category: 'Food & Dining',
        status: 'categorized',
        ai_category_confidence: 0.88
      },
      {
        description: "Unknown Transfer from NEFT",
        amount: 2500.00,
        transaction_type: 'credit',
        transaction_date: '2024-12-14',
        reference_number: 'NEFT789',
        balance_after: 16083.50,
        category: null, // Uncategorized
        status: 'uncategorized',
        ai_category_confidence: null
      },
      {
        description: "Fuel Payment - BPCL Pump",
        amount: -2800.00,
        transaction_type: 'debit',
        transaction_date: '2024-12-13',
        reference_number: 'FUEL123',
        balance_after: 13583.50,
        category: null, // Uncategorized
        status: 'uncategorized',
        ai_category_confidence: null
      },
      {
        description: "Internet Bill - Jio Fiber",
        amount: -799.00,
        transaction_type: 'debit',
        transaction_date: '2024-12-12',
        reference_number: 'JIO456',
        balance_after: 14382.50,
        category: 'Utilities',
        status: 'categorized',
        ai_category_confidence: 0.92
      }
    ];

    console.log('Generated mock transactions:', mockTransactions.length);

    // Get the first active bank account for this user
    const { data: bankAccounts, error: accountError } = await supabase
      .from('bank_accounts')
      .select('*')
      .eq('user_id', document.user_id)
      .eq('is_active', true)
      .limit(1);

    if (accountError || !bankAccounts || bankAccounts.length === 0) {
      throw new Error('No active bank account found for user');
    }

    const bankAccount = bankAccounts[0];
    console.log('Using bank account:', bankAccount.account_name);

    // Insert the mock transactions into the database
    const transactionsToInsert = mockTransactions.map(transaction => ({
      ...transaction,
      user_id: document.user_id,
      bank_account_id: bankAccount.id,
      statement_id: documentId,
      is_reviewed: transaction.status === 'categorized'
    }));

    const { data: insertedTransactions, error: insertError } = await supabase
      .from('bank_transactions')
      .insert(transactionsToInsert)
      .select();

    if (insertError) {
      console.error('Error inserting transactions:', insertError);
      throw new Error(`Failed to insert transactions: ${insertError.message}`);
    }

    console.log('Inserted transactions:', insertedTransactions?.length);

    // Update the document status
    const { error: updateError } = await supabase
      .from('documents')
      .update({
        status: 'completed',
        processed_at: new Date().toISOString(),
        extracted_data: {
          total_transactions: mockTransactions.length,
          categorized_count: mockTransactions.filter(t => t.status === 'categorized').length,
          uncategorized_count: mockTransactions.filter(t => t.status === 'uncategorized').length,
          mock_data: true
        }
      })
      .eq('id', documentId);

    if (updateError) {
      console.error('Error updating document:', updateError);
    }

    console.log(`Document ${documentId} processed successfully with ${mockTransactions.length} transactions`);

    return new Response(JSON.stringify({
      success: true,
      document_id: documentId,
      transactions_created: insertedTransactions?.length || 0,
      categorized: mockTransactions.filter(t => t.status === 'categorized').length,
      uncategorized: mockTransactions.filter(t => t.status === 'uncategorized').length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Processing error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
