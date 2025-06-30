
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, Trash2, Tag } from 'lucide-react';
import { BankTransaction, TransactionCategory } from '@/hooks/useBankTransactions';
import { format } from 'date-fns';
import DeleteTransactionDialog from './DeleteTransactionDialog';
import InlineCategorySelect from './InlineCategorySelect';
import InlineTextEdit from '@/components/shared/InlineTextEdit';
import InlineNumberEdit from '@/components/shared/InlineNumberEdit';
import InlineDateEdit from '@/components/shared/InlineDateEdit';

interface AllTransactionsListProps {
  transactions: BankTransaction[];
  categories: TransactionCategory[];
  isLoading: boolean;
  onTransactionClick: (transaction: BankTransaction) => void;
  onDeleteTransaction: (transactionId: string) => void;
  onBulkDeleteTransactions: (transactionIds: string[]) => void;
  onCategorizeTransaction: (transactionId: string, category: string) => void;
  onBulkCategorize: (transactionIds: string[], category: string) => void;
  onUpdateTransaction?: (transactionId: string, updates: any) => void;
  isDeleting: boolean;
  isProcessing?: boolean;
}

const AllTransactionsList = ({ 
  transactions, 
  categories, 
  isLoading, 
  onTransactionClick,
  onDeleteTransaction,
  onBulkDeleteTransactions,
  onCategorizeTransaction,
  onBulkCategorize,
  onUpdateTransaction,
  isDeleting,
  isProcessing = false
}: AllTransactionsListProps) => {
  const [selectedTransactions, setSelectedTransactions] = useState<Set<string>>(new Set());
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);
  const [bulkCategory, setBulkCategory] = useState('');

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId || c.name === categoryId);
    return category?.name || categoryId || 'Uncategorized';
  };

  const handleSelectTransaction = (transactionId: string, checked: boolean) => {
    const newSelected = new Set(selectedTransactions);
    if (checked) {
      newSelected.add(transactionId);
    } else {
      newSelected.delete(transactionId);
    }
    setSelectedTransactions(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTransactions(new Set(transactions.map(t => t.id)));
    } else {
      setSelectedTransactions(new Set());
    }
  };

  const handleDeleteSingle = (transactionId: string) => {
    setTransactionToDelete(transactionId);
    setShowDeleteDialog(true);
  };

  const handleBulkDelete = () => {
    if (selectedTransactions.size > 0) {
      setTransactionToDelete(null);
      setShowDeleteDialog(true);
    }
  };

  const handleConfirmDelete = () => {
    if (transactionToDelete) {
      onDeleteTransaction(transactionToDelete);
    } else if (selectedTransactions.size > 0) {
      onBulkDeleteTransactions(Array.from(selectedTransactions));
      setSelectedTransactions(new Set());
    }
    setShowDeleteDialog(false);
    setTransactionToDelete(null);
  };

  const handleBulkCategorize = () => {
    if (selectedTransactions.size > 0 && bulkCategory) {
      onBulkCategorize(Array.from(selectedTransactions), bulkCategory);
      setSelectedTransactions(new Set());
      setBulkCategory('');
    }
  };

  const handleCategoryChange = (transactionId: string, category: string) => {
    onCategorizeTransaction(transactionId, category);
  };

  const handleUpdateDescription = (transactionId: string, description: string) => {
    if (onUpdateTransaction) {
      onUpdateTransaction(transactionId, { description });
    }
  };

  const handleUpdateAmount = (transactionId: string, amount: number) => {
    if (onUpdateTransaction) {
      onUpdateTransaction(transactionId, { amount });
    }
  };

  const handleUpdateDate = (transactionId: string, date: string) => {
    if (onUpdateTransaction) {
      onUpdateTransaction(transactionId, { transaction_date: date });
    }
  };

  const isAllSelected = transactions.length > 0 && selectedTransactions.size === transactions.length;
  const isIndeterminate = selectedTransactions.size > 0 && selectedTransactions.size < transactions.length;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading transactions...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-muted rounded animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (transactions.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <h3 className="text-lg font-semibold mb-2">No transactions found</h3>
          <p className="text-muted-foreground text-sm">
            Upload a bank statement to import your transactions
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4 w-full max-w-full">
        {selectedTransactions.size > 0 && (
          <Card className="w-full">
            <CardContent className="py-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                <Badge variant="secondary" className="text-xs w-fit">
                  {selectedTransactions.size} selected
                </Badge>
                <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                  <div className="flex gap-2 items-center">
                    <Select value={bulkCategory} onValueChange={setBulkCategory}>
                      <SelectTrigger className="w-[150px] sm:w-[200px]">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.name}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      onClick={handleBulkCategorize}
                      disabled={!bulkCategory || isProcessing}
                      size="sm"
                      className="w-full sm:w-auto"
                    >
                      <Tag className="h-4 w-4 mr-2" />
                      {isProcessing ? 'Categorizing...' : 'Categorize'}
                    </Button>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleBulkDelete}
                    disabled={isDeleting}
                    className="w-full sm:w-auto"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete ({selectedTransactions.size})
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">All Transactions ({transactions.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0 w-full">
            {/* Mobile Card View */}
            <div className="block sm:hidden">
              <div className="p-4 border-b">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={isAllSelected}
                    onCheckedChange={handleSelectAll}
                    {...(isIndeterminate && { 'data-state': 'indeterminate' } as any)}
                  />
                  <span className="text-sm font-medium">Select All</span>
                </div>
              </div>
              <ScrollArea className="h-[600px] w-full">
                <div className="space-y-3 p-4">
                  {transactions.map((transaction) => (
                    <Card key={transaction.id} className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <Checkbox
                              checked={selectedTransactions.has(transaction.id)}
                              onCheckedChange={(checked) => 
                                handleSelectTransaction(transaction.id, checked as boolean)
                              }
                            />
                            <div className="min-w-0 flex-1">
                              <div className="mb-1">
                                <InlineTextEdit
                                  value={transaction.description}
                                  onSave={(value) => handleUpdateDescription(transaction.id, value)}
                                  placeholder="Enter description"
                                  className="text-sm font-medium"
                                />
                              </div>
                              <div className="text-xs text-muted-foreground">
                                <InlineDateEdit
                                  value={transaction.transaction_date}
                                  onSave={(value) => handleUpdateDate(transaction.id, value)}
                                />
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <InlineNumberEdit
                              value={Math.abs(transaction.amount)}
                              onSave={(value) => handleUpdateAmount(transaction.id, transaction.transaction_type === 'credit' ? value : -value)}
                              formatDisplay={(value) => `${transaction.transaction_type === 'credit' ? '+' : '-'}₹${value.toLocaleString()}`}
                              className={`text-sm font-medium ${
                                transaction.transaction_type === 'credit' 
                                  ? 'text-green-600' 
                                  : 'text-red-600'
                              }`}
                            />
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between gap-2 text-xs">
                          <div className="min-w-0 flex-1">
                            <InlineCategorySelect
                              currentCategory={transaction.category}
                              categories={categories}
                              onCategoryChange={(category) => handleCategoryChange(transaction.id, category)}
                              disabled={isProcessing}
                              showSelectOption={true}
                            />
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onTransactionClick(transaction)}
                              className="h-8 w-8 p-0 flex-shrink-0"
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteSingle(transaction.id)}
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive flex-shrink-0"
                              disabled={isDeleting}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="text-xs text-muted-foreground break-words">
                          {transaction.bank_accounts?.account_name || 'Unknown Account'}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Desktop Table View */}
            <div className="hidden sm:block w-full">
              <ScrollArea className="w-full">
                <div className="w-full overflow-x-auto">
                  <Table className="w-full min-w-[900px]">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[40px]">
                          <Checkbox
                            checked={isAllSelected}
                            onCheckedChange={handleSelectAll}
                            {...(isIndeterminate && { 'data-state': 'indeterminate' } as any)}
                          />
                        </TableHead>
                        <TableHead className="w-[100px]">Date</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="w-[100px]">Account</TableHead>
                        <TableHead className="w-[130px]">Category</TableHead>
                        <TableHead className="w-[100px]">Amount</TableHead>
                        <TableHead className="w-[100px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedTransactions.has(transaction.id)}
                              onCheckedChange={(checked) => 
                                handleSelectTransaction(transaction.id, checked as boolean)
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <InlineDateEdit
                              value={transaction.transaction_date}
                              onSave={(value) => handleUpdateDate(transaction.id, value)}
                            />
                          </TableCell>
                          <TableCell>
                            <InlineTextEdit
                              value={transaction.description}
                              onSave={(value) => handleUpdateDescription(transaction.id, value)}
                              placeholder="Enter description"
                              className="text-sm"
                            />
                          </TableCell>
                          <TableCell>
                            <div className="text-sm break-words" title={transaction.bank_accounts?.account_name || 'Unknown Account'}>
                              {transaction.bank_accounts?.account_name || 'Unknown Account'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <InlineCategorySelect
                              currentCategory={transaction.category}
                              categories={categories}
                              onCategoryChange={(category) => handleCategoryChange(transaction.id, category)}
                              disabled={isProcessing}
                              showSelectOption={true}
                            />
                          </TableCell>
                          <TableCell>
                            <InlineNumberEdit
                              value={Math.abs(transaction.amount)}
                              onSave={(value) => handleUpdateAmount(transaction.id, transaction.transaction_type === 'credit' ? value : -value)}
                              formatDisplay={(value) => `${transaction.transaction_type === 'credit' ? '+' : '-'}₹${value.toLocaleString()}`}
                              className={`font-medium text-sm ${
                                transaction.transaction_type === 'credit' 
                                  ? 'text-green-600' 
                                  : 'text-red-600'
                              }`}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onTransactionClick(transaction)}
                                className="h-8 w-8 p-0"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteSingle(transaction.id)}
                                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                disabled={isDeleting}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </ScrollArea>
            </div>
          </CardContent>
        </Card>
      </div>

      <DeleteTransactionDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleConfirmDelete}
        transactionCount={transactionToDelete ? 1 : selectedTransactions.size}
        isDeleting={isDeleting}
      />
    </>
  );
};

export default AllTransactionsList;
