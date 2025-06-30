
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { PiggyBank, Plus, Upload, FileText, List, AlertCircle } from 'lucide-react';
import { useBankTransactions } from '@/hooks/useBankTransactions';
import AddBankAccountDialog from '@/components/bank/AddBankAccountDialog';
import StatementUploadDialog from '@/components/bank/StatementUploadDialog';
import TransactionReviewDialog from '@/components/bank/TransactionReviewDialog';
import BankSummaryCards from '@/components/bank/BankSummaryCards';
import BankAccountsSection from '@/components/bank/BankAccountsSection';
import AllTransactionsList from '@/components/bank/AllTransactionsList';
import UncategorizedTransactionsList from '@/components/bank/UncategorizedTransactionsList';
import CategorizedTransactionsList from '@/components/bank/CategorizedTransactionsList';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const BankCash = () => {
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [showUploadStatement, setShowUploadStatement] = useState(false);
  const [showTransactionReview, setShowTransactionReview] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const {
    bankAccounts,
    transactions,
    categories,
    chartOfAccounts,
    isLoadingAccounts,
    isLoadingTransactions,
    isLoadingChartOfAccounts,
    createAccount,
    createChartAccount,
    updateTransaction,
    categorizeTransaction,
    bulkCategorizeTransactions,
    postTransaction,
    bulkPostTransactions,
    deleteTransaction,
    bulkDeleteTransactions,
    isCreatingAccount,
    isCreatingChartAccount,
    isProcessing,
    isBulkCategorizing,
    isBulkPosting,
    isPosting,
    isDeleting,
    isBulkDeleting
  } = useBankTransactions();

  // Simplified logic: use only category field as source of truth
  // Uncategorized: category is NULL or empty string
  const uncategorizedTransactions = transactions.filter(t => {
    return !t.category || t.category.trim() === '';
  });
  
  // Categorized: category has a value AND status is not 'posted'
  const categorizedTransactions = transactions.filter(t => {
    return t.category && t.category.trim() !== '' && t.status !== 'posted';
  });

  console.log('All transactions:', transactions);
  console.log('Chart of accounts available:', chartOfAccounts);
  console.log('Uncategorized transactions (no category):', uncategorizedTransactions);
  console.log('Categorized transactions (has category, not posted):', categorizedTransactions);

  const handleTransactionClick = (transaction) => {
    setSelectedTransaction(transaction);
    setShowTransactionReview(true);
  };

  const handleCategorizeTransaction = (transactionId: string, category: string) => {
    // If empty category is selected, move transaction back to uncategorized
    if (category === '') {
      updateTransactionStatus(transactionId, 'uncategorized', null);
    } else {
      categorizeTransaction({ id: transactionId, category });
    }
    setShowTransactionReview(false);
    setSelectedTransaction(null);
  };

  const handleCreateAccount = (accountData: {
    account_name: string;
    account_type: 'asset' | 'liability' | 'equity' | 'income' | 'expense';
    account_subtype?: string;
    opening_balance?: number;
  }) => {
    createChartAccount(accountData);
  };

  const updateTransactionStatus = async (transactionId: string, status: string, category: string | null) => {
    try {
      const updates: any = { status, is_reviewed: false };
      if (category !== null) {
        updates.category = category;
      }

      const { error } = await supabase
        .from('bank_transactions')
        .update(updates)
        .eq('id', transactionId);

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ['bankTransactions'] });
      
      toast({
        title: "Transaction updated",
        description: `Transaction moved to ${status} status.`
      });
    } catch (error) {
      console.error('Error updating transaction status:', error);
      toast({
        title: "Update failed",
        description: "Failed to update transaction status. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleBulkCategorize = (transactionIds: string[], category: string) => {
    bulkCategorizeTransactions({ ids: transactionIds, category });
  };

  const handlePostTransaction = (transactionId: string) => {
    postTransaction(transactionId);
  };

  const handleBulkPost = (transactionIds: string[]) => {
    bulkPostTransactions(transactionIds);
  };

  const handleDeleteTransaction = (transactionId: string) => {
    deleteTransaction(transactionId);
  };

  const handleBulkDeleteTransactions = (transactionIds: string[]) => {
    bulkDeleteTransactions(transactionIds);
  };

  const handleUpdateTransaction = async (transactionId: string, updates: any) => {
    try {
      const { error } = await supabase
        .from('bank_transactions')
        .update(updates)
        .eq('id', transactionId);

      if (error) throw error;

      // Refresh the transactions data
      await queryClient.invalidateQueries({ queryKey: ['bankTransactions'] });
      
      toast({
        title: "Transaction updated",
        description: "Transaction has been updated successfully."
      });
    } catch (error) {
      console.error('Error updating transaction:', error);
      toast({
        title: "Update failed",
        description: "Failed to update transaction. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleStatementProcessed = async (documentId: string) => {
    console.log('Statement processed, refreshing transactions data...');
    // Force refresh of transactions data
    await queryClient.invalidateQueries({ queryKey: ['bankTransactions'] });
    await queryClient.invalidateQueries({ queryKey: ['bankAccounts'] });
    setShowUploadStatement(false);
  };

  return (
    <div className="space-y-4 sm:space-y-6 w-full max-w-full overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-page-title">Bank & Cash</h1>
          <p className="text-helper">
            Manage your bank accounts and transactions with AI-powered categorization
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:shrink-0">
          <Button onClick={() => setShowUploadStatement(true)} variant="outline" size="sm" className="w-full sm:w-auto">
            <Upload className="h-4 w-4 mr-2" />
            <span className="text-button sm:inline">Upload Statement</span>
          </Button>
          <Button onClick={() => setShowAddAccount(true)} size="sm" className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            <span className="text-button sm:inline">Add Account</span>
          </Button>
        </div>
      </div>

      <BankSummaryCards 
        accounts={bankAccounts}
        transactions={transactions}
        uncategorizedCount={uncategorizedTransactions.length}
      />

      <BankAccountsSection
        accounts={bankAccounts}
        isLoading={isLoadingAccounts}
        onAddAccount={() => setShowAddAccount(true)}
      />

      <Tabs defaultValue="all" className="space-y-4 w-full">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 h-auto">
          <TabsTrigger value="all" className="flex items-center gap-2 text-button p-2 sm:p-3">
            <List className="h-4 w-4" />
            <span className="hidden sm:inline">All Transactions</span>
            <span className="sm:hidden">All</span>
          </TabsTrigger>
          <TabsTrigger value="uncategorized" className="flex items-center gap-2 text-button p-2 sm:p-3">
            <AlertCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Uncategorized</span>
            <span className="sm:hidden">Uncat.</span>
            {uncategorizedTransactions.length > 0 && (
              <span className="ml-1 bg-destructive text-destructive-foreground rounded-full px-1.5 py-0.5 text-badge">
                {uncategorizedTransactions.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="categorized" className="flex items-center gap-2 text-button p-2 sm:p-3">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Ready to Post</span>
            <span className="sm:hidden">Ready</span>
            {categorizedTransactions.length > 0 && (
              <span className="ml-1 bg-blue-500 text-white rounded-full px-1.5 py-0.5 text-badge">
                {categorizedTransactions.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="w-full">
          <AllTransactionsList 
            transactions={transactions}
            categories={categories}
            isLoading={isLoadingTransactions}
            onTransactionClick={handleTransactionClick}
            onDeleteTransaction={handleDeleteTransaction}
            onBulkDeleteTransactions={handleBulkDeleteTransactions}
            onCategorizeTransaction={handleCategorizeTransaction}
            onBulkCategorize={handleBulkCategorize}
            onUpdateTransaction={handleUpdateTransaction}
            isDeleting={isDeleting || isBulkDeleting}
            isProcessing={isBulkCategorizing}
          />
        </TabsContent>

        <TabsContent value="uncategorized" className="w-full">
          <UncategorizedTransactionsList 
            transactions={uncategorizedTransactions}
            categories={categories}
            isLoading={isLoadingTransactions}
            onTransactionClick={handleTransactionClick}
            onCategorizeTransaction={handleCategorizeTransaction}
            onBulkCategorize={handleBulkCategorize}
            onDeleteTransaction={handleDeleteTransaction}
            onBulkDeleteTransactions={handleBulkDeleteTransactions}
            onUpdateTransaction={handleUpdateTransaction}
            isProcessing={isBulkCategorizing}
            isDeleting={isDeleting || isBulkDeleting}
          />
        </TabsContent>

        <TabsContent value="categorized" className="w-full">
          <CategorizedTransactionsList 
            transactions={categorizedTransactions}
            accounts={chartOfAccounts}
            isLoading={isLoadingTransactions}
            onTransactionClick={handleTransactionClick}
            onPostTransaction={handlePostTransaction}
            onBulkPost={handleBulkPost}
            onCategorizeTransaction={handleCategorizeTransaction}
            onCreateAccount={handleCreateAccount}
            onUpdateTransaction={handleUpdateTransaction}
            onDeleteTransaction={handleDeleteTransaction}
            onBulkDeleteTransactions={handleBulkDeleteTransactions}
            isProcessing={isBulkPosting || isPosting}
            isDeleting={isDeleting || isBulkDeleting}
            isCreatingAccount={isCreatingChartAccount}
          />
        </TabsContent>
      </Tabs>

      <AddBankAccountDialog
        open={showAddAccount}
        onOpenChange={setShowAddAccount}
        onSubmit={createAccount}
        isLoading={isCreatingAccount}
      />

      <StatementUploadDialog
        open={showUploadStatement}
        onOpenChange={setShowUploadStatement}
        onProcess={handleStatementProcessed}
        isProcessing={isProcessing}
        bankAccounts={bankAccounts}
      />

      <TransactionReviewDialog
        open={showTransactionReview}
        onOpenChange={setShowTransactionReview}
        transaction={selectedTransaction}
        categories={categories}
        onCategorize={handleCategorizeTransaction}
      />
    </div>
  );
};

export default BankCash;
