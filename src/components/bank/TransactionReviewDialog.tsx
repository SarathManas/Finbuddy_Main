
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArrowUpCircle, ArrowDownCircle, Calendar, CreditCard, FileText } from 'lucide-react';
import { BankTransaction, TransactionCategory } from '@/hooks/useBankTransactions';
import { format } from 'date-fns';

interface TransactionReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: BankTransaction | null;
  categories: TransactionCategory[];
  onCategorize: (transactionId: string, category: string) => void;
}

const TransactionReviewDialog = ({ 
  open, 
  onOpenChange, 
  transaction, 
  categories, 
  onCategorize 
}: TransactionReviewDialogProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  useEffect(() => {
    if (transaction?.category) {
      setSelectedCategory(transaction.category);
    } else {
      setSelectedCategory('');
    }
  }, [transaction]);

  const handleCategorize = () => {
    if (transaction && selectedCategory) {
      onCategorize(transaction.id, selectedCategory);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setSelectedCategory('');
  };

  if (!transaction) return null;

  const transactionTypeCategories = categories.filter(cat => {
    if (transaction.transaction_type === 'credit') {
      return cat.type === 'income';
    } else {
      return cat.type === 'expense' || cat.type === 'transfer';
    }
  });

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Review Transaction</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Transaction Details */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {transaction.transaction_type === 'credit' ? (
                  <ArrowUpCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <ArrowDownCircle className="h-5 w-5 text-red-600" />
                )}
                <span className="font-medium">
                  {transaction.transaction_type === 'credit' ? 'Income' : 'Expense'}
                </span>
              </div>
              <span className={`text-lg font-bold ${
                transaction.transaction_type === 'credit' 
                  ? 'text-green-600' 
                  : 'text-red-600'
              }`}>
                {transaction.transaction_type === 'credit' ? '+' : '-'}
                ₹{Math.abs(transaction.amount).toLocaleString()}
              </span>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{format(new Date(transaction.transaction_date), 'MMMM dd, yyyy')}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <span>{transaction.bank_accounts?.account_name || 'Unknown Account'}</span>
              </div>

              {transaction.reference_number && (
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span>Ref: {transaction.reference_number}</span>
                </div>
              )}
            </div>

            <div>
              <Label className="text-xs text-muted-foreground">DESCRIPTION</Label>
              <p className="text-sm mt-1">{transaction.description}</p>
            </div>

            {transaction.ai_category_confidence && (
              <div className="flex items-center gap-2">
                <Label className="text-xs text-muted-foreground">AI CONFIDENCE</Label>
                <Badge variant="outline">
                  {Math.round(transaction.ai_category_confidence * 100)}%
                </Badge>
              </div>
            )}
          </div>

          {/* Category Selection */}
          <div className="space-y-2">
            <Label>Select Category</Label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a category" />
              </SelectTrigger>
              <SelectContent>
                {transactionTypeCategories.map((category) => (
                  <SelectItem key={category.id} value={category.name}>
                    <div className="flex items-center justify-between w-full">
                      <span>{category.name}</span>
                      <Badge variant="outline" className="ml-2 text-xs">
                        {category.type}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedCategory && (
              <p className="text-xs text-muted-foreground">
                {categories.find(c => c.name === selectedCategory)?.description}
              </p>
            )}
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleCategorize}
              disabled={!selectedCategory}
            >
              Categorize Transaction
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TransactionReviewDialog;
