
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { BankAccount, BankTransaction } from '@/hooks/useBankTransactions';

interface BankSummaryCardsProps {
  accounts: BankAccount[];
  transactions: BankTransaction[];
  uncategorizedCount: number;
}

const BankSummaryCards = ({ accounts, transactions, uncategorizedCount }: BankSummaryCardsProps) => {
  const totalBalance = accounts.reduce((sum, account) => sum + (account.current_balance || 0), 0);
  
  const thisMonthTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.transaction_date);
    const now = new Date();
    return transactionDate.getMonth() === now.getMonth() && 
           transactionDate.getFullYear() === now.getFullYear();
  });

  const monthlyIncome = thisMonthTransactions
    .filter(t => t.transaction_type === 'credit')
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyExpenses = thisMonthTransactions
    .filter(t => t.transaction_type === 'debit')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-label">Total Balance</CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-metric">₹{totalBalance.toLocaleString()}</div>
          <p className="text-helper">
            Across {accounts.length} account{accounts.length !== 1 ? 's' : ''}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-label">This Month Income</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-metric text-green-600">₹{monthlyIncome.toLocaleString()}</div>
          <p className="text-helper">
            {thisMonthTransactions.filter(t => t.transaction_type === 'credit').length} transactions
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-label">This Month Expenses</CardTitle>
          <TrendingDown className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-metric text-red-600">₹{monthlyExpenses.toLocaleString()}</div>
          <p className="text-helper">
            {thisMonthTransactions.filter(t => t.transaction_type === 'debit').length} transactions
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-label">Needs Review</CardTitle>
          <AlertCircle className={`h-4 w-4 ${uncategorizedCount > 0 ? 'text-orange-600' : 'text-muted-foreground'}`} />
        </CardHeader>
        <CardContent>
          <div className={`text-metric ${uncategorizedCount > 0 ? 'text-orange-600' : 'text-muted-foreground'}`}>
            {uncategorizedCount}
          </div>
          <p className="text-helper">
            {uncategorizedCount > 0 ? 'Transactions to categorize' : 'All up to date'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default BankSummaryCards;
