
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowUpCircle, ArrowDownCircle, Eye } from 'lucide-react';
import { BankTransaction, TransactionCategory } from '@/hooks/useBankTransactions';
import { format } from 'date-fns';

interface TransactionsListProps {
  transactions: BankTransaction[];
  categories: TransactionCategory[];
  isLoading: boolean;
  onTransactionClick: (transaction: BankTransaction) => void;
  showStatus: boolean;
}

const TransactionsList = ({ 
  transactions, 
  categories, 
  isLoading, 
  onTransactionClick, 
  showStatus 
}: TransactionsListProps) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
      case 'uncategorized':
        return <Badge variant="destructive">Needs Review</Badge>;
      case 'categorized':
        return <Badge variant="default">Categorized</Badge>;
      case 'posted':
        return <Badge variant="secondary">Posted</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId || c.name === categoryId);
    return category?.name || categoryId || 'Uncategorized';
  };

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
          <ArrowUpCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No transactions found</h3>
          <p className="text-muted-foreground">
            Upload a bank statement to import your transactions
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Transactions ({transactions.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Account</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Amount</TableHead>
              {showStatus && <TableHead>Status</TableHead>}
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>
                  {format(new Date(transaction.transaction_date), 'MMM dd, yyyy')}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {transaction.transaction_type === 'credit' ? (
                      <ArrowUpCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <ArrowDownCircle className="h-4 w-4 text-red-600" />
                    )}
                    <span className="truncate max-w-[200px]" title={transaction.description}>
                      {transaction.description}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {transaction.bank_accounts?.account_name || 'Unknown Account'}
                  </div>
                </TableCell>
                <TableCell>
                  {transaction.category ? (
                    <Badge variant="outline">
                      {getCategoryName(transaction.category)}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground text-sm">Uncategorized</span>
                  )}
                </TableCell>
                <TableCell>
                  <span className={`font-medium ${
                    transaction.transaction_type === 'credit' 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    {transaction.transaction_type === 'credit' ? '+' : '-'}
                    ₹{Math.abs(transaction.amount).toLocaleString()}
                  </span>
                </TableCell>
                {showStatus && (
                  <TableCell>
                    {getStatusBadge(transaction.status)}
                  </TableCell>
                )}
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onTransactionClick(transaction)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default TransactionsList;
