
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Download, Loader2, AlertTriangle, Info } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { DateRange, useReports } from '@/hooks/useReports';

interface ProfitLossReportProps {
  dateRange: DateRange;
}

const ProfitLossReport = ({ dateRange }: ProfitLossReportProps) => {
  const { useProfitLoss } = useReports();
  const { data: profitLossEntries = [], isLoading } = useProfitLoss(dateRange);

  // Separate entries by type and handle negative balances
  const incomeEntries = profitLossEntries
    .filter(entry => entry.account_type === 'income')
    .map(entry => ({
      ...entry,
      displayAmount: entry.amount,
      isContra: entry.amount < 0
    }));

  const expenseEntries = profitLossEntries
    .filter(entry => entry.account_type === 'expense')
    .map(entry => ({
      ...entry,
      displayAmount: entry.amount,
      isContra: entry.amount < 0
    }));

  // Calculate totals properly handling negative amounts
  const totalIncome = incomeEntries.reduce((sum, entry) => sum + entry.amount, 0);
  const totalExpense = expenseEntries.reduce((sum, entry) => sum + entry.amount, 0);
  const netProfit = totalIncome - totalExpense;

  // Check for unusual balances (contra accounts)
  const hasContraAccounts = [...incomeEntries, ...expenseEntries].some(entry => entry.isContra);

  const chartData = [
    { name: 'Income', amount: totalIncome },
    { name: 'Expenses', amount: totalExpense },
    { name: 'Net Profit', amount: netProfit }
  ];

  const exportToCSV = () => {
    const csvContent = [
      ['Category', 'Account Name', 'Amount', 'Notes'],
      ...incomeEntries.map(entry => [
        'Income', 
        entry.account_name, 
        entry.amount.toString(),
        entry.isContra ? 'Contra Income Account' : ''
      ]),
      ['', '', '', ''],
      ['Total Income', '', totalIncome.toString(), ''],
      ['', '', '', ''],
      ...expenseEntries.map(entry => [
        'Expense', 
        entry.account_name, 
        entry.amount.toString(),
        entry.isContra ? 'Contra Expense Account' : ''
      ]),
      ['', '', '', ''],
      ['Total Expenses', '', totalExpense.toString(), ''],
      ['', '', '', ''],
      ['Net Profit/Loss', '', netProfit.toString(), '']
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `profit-loss-${format(dateRange.from, 'yyyy-MM-dd')}-to-${format(dateRange.to, 'yyyy-MM-dd')}.csv`;
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
    <div className="space-y-4 w-full">
      <Card className="w-full">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="text-lg sm:text-xl">Profit & Loss Statement</CardTitle>
            <Button onClick={exportToCSV} size="sm" variant="outline" className="w-full sm:w-auto">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="space-y-6">
            {/* Warning for contra accounts */}
            {hasContraAccounts && (
              <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-amber-800">Contra Accounts Detected</p>
                  <p className="text-amber-700">Some accounts have negative balances, which may indicate contra accounts or adjustments.</p>
                </div>
              </div>
            )}

            {/* Income Section */}
            <div className="w-full">
              <h3 className="text-lg font-semibold mb-3">Income</h3>
              <div className="w-full overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[120px]">Account</TableHead>
                      <TableHead className="text-right min-w-[100px]">Amount</TableHead>
                      <TableHead className="min-w-[80px]">Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {incomeEntries.map((entry, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{entry.account_name}</TableCell>
                        <TableCell className={`text-right ${entry.isContra ? 'text-red-600' : ''}`}>
                          ₹{entry.amount.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {entry.isContra && 'Contra'}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="font-medium bg-muted/50">
                      <TableCell>Total Income</TableCell>
                      <TableCell className={`text-right ${totalIncome < 0 ? 'text-red-600' : ''}`}>
                        ₹{totalIncome.toFixed(2)}
                      </TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Expenses Section */}
            <div className="w-full">
              <h3 className="text-lg font-semibold mb-3">Expenses</h3>
              <div className="w-full overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[120px]">Account</TableHead>
                      <TableHead className="text-right min-w-[100px]">Amount</TableHead>
                      <TableHead className="min-w-[80px]">Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expenseEntries.map((entry, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{entry.account_name}</TableCell>
                        <TableCell className={`text-right ${entry.isContra ? 'text-red-600' : ''}`}>
                          ₹{entry.amount.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {entry.isContra && 'Contra'}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="font-medium bg-muted/50">
                      <TableCell>Total Expenses</TableCell>
                      <TableCell className={`text-right ${totalExpense < 0 ? 'text-red-600' : ''}`}>
                        ₹{totalExpense.toFixed(2)}
                      </TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Net Profit/Loss Summary */}
            <div className="w-full p-4 bg-muted/50 rounded-lg">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <span className="text-base sm:text-lg font-bold">Net Profit/Loss:</span>
                <span className={`text-base sm:text-lg font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ₹{netProfit.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chart Section */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Financial Overview</CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="w-full h-[250px] sm:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip formatter={(value) => [`₹${Number(value).toFixed(2)}`, 'Amount']} />
                <Bar dataKey="amount" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfitLossReport;
