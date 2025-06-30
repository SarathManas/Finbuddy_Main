
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Download, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { DateRange, useReports } from '@/hooks/useReports';

interface TrialBalanceReportProps {
  dateRange: DateRange;
}

const TrialBalanceReport = ({ dateRange }: TrialBalanceReportProps) => {
  const { useTrialBalance } = useReports();
  const { data: accounts = [], isLoading } = useTrialBalance(dateRange);

  // Calculate trial balance entries with proper debit/credit logic
  const trialBalanceEntries = accounts.map(account => {
    const balance = account.current_balance;
    let debitBalance = 0;
    let creditBalance = 0;

    // Determine debit/credit based on account type and balance sign
    switch (account.account_type) {
      case 'asset':
      case 'expense':
        // Assets and expenses have debit normal balances
        if (balance >= 0) {
          debitBalance = balance;
        } else {
          creditBalance = Math.abs(balance); // Contra asset/expense
        }
        break;
      case 'liability':
      case 'equity':
      case 'income':
        // Liabilities, equity, and income have credit normal balances
        if (balance >= 0) {
          creditBalance = balance;
        } else {
          debitBalance = Math.abs(balance); // Contra liability/equity/income
        }
        break;
      default:
        // For unknown types, treat positive as debit, negative as credit
        if (balance >= 0) {
          debitBalance = balance;
        } else {
          creditBalance = Math.abs(balance);
        }
    }

    return {
      account_name: account.account_name,
      account_type: account.account_type,
      debit_balance: debitBalance,
      credit_balance: creditBalance,
      original_balance: balance
    };
  });

  const totalDebit = trialBalanceEntries.reduce((sum, entry) => sum + entry.debit_balance, 0);
  const totalCredit = trialBalanceEntries.reduce((sum, entry) => sum + entry.credit_balance, 0);
  const balanceDifference = totalDebit - totalCredit;
  const isBalanced = Math.abs(balanceDifference) < 0.01; // Allow for minor rounding differences

  const exportToCSV = () => {
    const csvContent = [
      ['Account Name', 'Account Type', 'Original Balance', 'Debit Balance', 'Credit Balance'],
      ...trialBalanceEntries.map(entry => [
        entry.account_name,
        entry.account_type,
        entry.original_balance.toString(),
        entry.debit_balance.toString(),
        entry.credit_balance.toString()
      ]),
      ['', '', '', '', ''],
      ['Total', '', '', totalDebit.toString(), totalCredit.toString()],
      ['Balance Difference', '', '', balanceDifference.toString(), ''],
      ['Status', '', '', isBalanced ? 'Balanced' : 'Not Balanced', '']
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trial-balance-${format(dateRange.from, 'yyyy-MM-dd')}-to-${format(dateRange.to, 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle className="text-lg sm:text-xl">Trial Balance</CardTitle>
          <Button onClick={exportToCSV} size="sm" variant="outline" className="w-full sm:w-auto">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        <div className="space-y-4">
          {/* Balance Status Indicator */}
          <div className={`flex items-center justify-between p-3 rounded-lg border ${
            isBalanced ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center gap-2">
              {isBalanced ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-red-600" />
              )}
              <span className={`font-medium ${isBalanced ? 'text-green-700' : 'text-red-700'}`}>
                {isBalanced ? 'Trial Balance is Balanced ✓' : 'Trial Balance is Not Balanced ✗'}
              </span>
            </div>
            {!isBalanced && (
              <span className="text-sm text-red-600">
                Difference: ₹{balanceDifference.toFixed(2)}
              </span>
            )}
          </div>

          {/* Trial Balance Table */}
          <div className="w-full overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[120px]">Account Name</TableHead>
                  <TableHead className="min-w-[100px]">Account Type</TableHead>
                  <TableHead className="text-right min-w-[100px]">Original Balance</TableHead>
                  <TableHead className="text-right min-w-[100px]">Debit Balance</TableHead>
                  <TableHead className="text-right min-w-[100px]">Credit Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trialBalanceEntries.map((entry, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{entry.account_name}</TableCell>
                    <TableCell className="capitalize">{entry.account_type}</TableCell>
                    <TableCell className="text-right">
                      <span className={entry.original_balance < 0 ? 'text-red-600' : ''}>
                        ₹{entry.original_balance.toFixed(2)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      {entry.debit_balance > 0 ? `₹${entry.debit_balance.toFixed(2)}` : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      {entry.credit_balance > 0 ? `₹${entry.credit_balance.toFixed(2)}` : '-'}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="font-medium bg-muted/50">
                  <TableCell colSpan={3}>Total</TableCell>
                  <TableCell className="text-right">₹{totalDebit.toFixed(2)}</TableCell>
                  <TableCell className="text-right">₹{totalCredit.toFixed(2)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TrialBalanceReport;
