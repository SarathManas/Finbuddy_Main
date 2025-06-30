
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Download, Loader2, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { format } from 'date-fns';
import { DateRange, useReports } from '@/hooks/useReports';

interface BalanceSheetReportProps {
  dateRange: DateRange;
}

const BalanceSheetReport = ({ dateRange }: BalanceSheetReportProps) => {
  const { useBalanceSheet } = useReports();
  const { data: balanceSheetEntries = [], isLoading } = useBalanceSheet(dateRange);

  // Separate entries by type and handle negative balances
  const assetEntries = balanceSheetEntries
    .filter(entry => entry.account_type === 'asset')
    .map(entry => ({
      ...entry,
      isContra: entry.amount < 0
    }));

  const liabilityEntries = balanceSheetEntries
    .filter(entry => entry.account_type === 'liability')
    .map(entry => ({
      ...entry,
      isContra: entry.amount < 0
    }));

  const equityEntries = balanceSheetEntries
    .filter(entry => entry.account_type === 'equity')
    .map(entry => ({
      ...entry,
      isContra: entry.amount < 0
    }));

  const totalAssets = assetEntries.reduce((sum, entry) => sum + entry.amount, 0);
  const totalLiabilities = liabilityEntries.reduce((sum, entry) => sum + entry.amount, 0);
  const totalEquity = equityEntries.reduce((sum, entry) => sum + entry.amount, 0);

  // Calculate balance difference and validation
  const liabilitiesAndEquity = totalLiabilities + totalEquity;
  const balanceDifference = totalAssets - liabilitiesAndEquity;
  const isBalanced = Math.abs(balanceDifference) < 0.01; // Allow for minor rounding differences

  // Check for unusual balances (contra accounts)
  const hasContraAccounts = [...assetEntries, ...liabilityEntries, ...equityEntries].some(entry => entry.isContra);

  const chartData = [
    { name: 'Assets', value: Math.abs(totalAssets), color: '#3b82f6' },
    { name: 'Liabilities', value: Math.abs(totalLiabilities), color: '#ef4444' },
    { name: 'Equity', value: Math.abs(totalEquity), color: '#10b981' }
  ].filter(item => item.value > 0);

  const exportToCSV = () => {
    const csvContent = [
      ['Category', 'Account Name', 'Amount', 'Notes'],
      ...assetEntries.map(entry => [
        'Asset', 
        entry.account_name, 
        entry.amount.toString(),
        entry.isContra ? 'Contra Asset Account' : ''
      ]),
      ['', 'Total Assets', totalAssets.toString(), ''],
      ['', '', '', ''],
      ...liabilityEntries.map(entry => [
        'Liability', 
        entry.account_name, 
        entry.amount.toString(),
        entry.isContra ? 'Contra Liability Account' : ''
      ]),
      ['', 'Total Liabilities', totalLiabilities.toString(), ''],
      ['', '', '', ''],
      ...equityEntries.map(entry => [
        'Equity', 
        entry.account_name, 
        entry.amount.toString(),
        entry.isContra ? 'Contra Equity Account' : ''
      ]),
      ['', 'Total Equity', totalEquity.toString(), ''],
      ['', '', '', ''],
      ['Balance Difference', '', balanceDifference.toString(), ''],
      ['Status', '', '', isBalanced ? 'Balanced' : 'Not Balanced']
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `balance-sheet-${format(dateRange.from, 'yyyy-MM-dd')}-to-${format(dateRange.to, 'yyyy-MM-dd')}.csv`;
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
            <CardTitle className="text-lg sm:text-xl">Balance Sheet</CardTitle>
            <Button onClick={exportToCSV} size="sm" variant="outline" className="w-full sm:w-auto">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="space-y-6">
            {/* Balance Status and Warnings */}
            <div className="space-y-3">
              {/* Balance Status */}
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
                    {isBalanced ? 'Balance Sheet is Balanced ✓' : 'Balance Sheet is Not Balanced ✗'}
                  </span>
                </div>
                {!isBalanced && (
                  <span className="text-sm text-red-600">
                    Difference: ₹{balanceDifference.toFixed(2)}
                  </span>
                )}
              </div>

              {/* Contra Accounts Warning */}
              {hasContraAccounts && (
                <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-amber-800">Contra Accounts Detected</p>
                    <p className="text-amber-700">Some accounts have negative balances, which may indicate contra accounts or adjustments.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Assets Section */}
            <div className="w-full">
              <h3 className="text-lg font-semibold mb-3">Assets</h3>
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
                    {assetEntries.map((entry, index) => (
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
                      <TableCell>Total Assets</TableCell>
                      <TableCell className={`text-right ${totalAssets < 0 ? 'text-red-600' : ''}`}>
                        ₹{totalAssets.toFixed(2)}
                      </TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Liabilities Section */}
            <div className="w-full">
              <h3 className="text-lg font-semibold mb-3">Liabilities</h3>
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
                    {liabilityEntries.map((entry, index) => (
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
                      <TableCell>Total Liabilities</TableCell>
                      <TableCell className={`text-right ${totalLiabilities < 0 ? 'text-red-600' : ''}`}>
                        ₹{totalLiabilities.toFixed(2)}
                      </TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Equity Section */}
            <div className="w-full">
              <h3 className="text-lg font-semibold mb-3">Equity</h3>
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
                    {equityEntries.map((entry, index) => (
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
                      <TableCell>Total Equity</TableCell>
                      <TableCell className={`text-right ${totalEquity < 0 ? 'text-red-600' : ''}`}>
                        ₹{totalEquity.toFixed(2)}
                      </TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Balance Summary */}
            <div className="w-full p-4 bg-muted/50 rounded-lg">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Total Assets:</span>
                  <span className="font-medium">₹{totalAssets.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Liabilities & Equity:</span>
                  <span className="font-medium">₹{liabilitiesAndEquity.toFixed(2)}</span>
                </div>
                <div className={`flex justify-between font-bold ${balanceDifference !== 0 ? 'text-red-600' : 'text-green-600'}`}>
                  <span>Balance Difference:</span>
                  <span>₹{balanceDifference.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chart Section - only show if there's meaningful data */}
      {chartData.length > 0 && (
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Financial Position Overview</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="w-full h-[250px] sm:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`₹${Number(value).toFixed(2)}`, 'Amount']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BalanceSheetReport;
