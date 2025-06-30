
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { DateRange, useReports } from '@/hooks/useReports';

interface DayBookReportProps {
  dateRange: DateRange;
}

const DayBookReport = ({ dateRange }: DayBookReportProps) => {
  const { useDayBook } = useReports();
  const { data: dayBookEntries = [], isLoading } = useDayBook(dateRange);

  const totalDebit = dayBookEntries.reduce((sum, entry) => sum + entry.debit_amount, 0);
  const totalCredit = dayBookEntries.reduce((sum, entry) => sum + entry.credit_amount, 0);

  const exportToCSV = () => {
    const csvContent = [
      ['Date', 'Account', 'Description', 'Reference', 'Debit', 'Credit'],
      ...dayBookEntries.map(entry => [
        format(new Date(entry.entry_date), 'dd/MM/yyyy'),
        entry.account_name,
        entry.description,
        entry.reference_number || '',
        entry.debit_amount.toString(),
        entry.credit_amount.toString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `day-book-${format(dateRange.from, 'yyyy-MM-dd')}-to-${format(dateRange.to, 'yyyy-MM-dd')}.csv`;
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
          <CardTitle className="text-lg sm:text-xl">Day Book Report</CardTitle>
          <Button onClick={exportToCSV} size="sm" variant="outline" className="w-full sm:w-auto">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        <div className="w-full overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[80px]">Date</TableHead>
                <TableHead className="min-w-[120px]">Account</TableHead>
                <TableHead className="min-w-[150px]">Description</TableHead>
                <TableHead className="min-w-[100px]">Reference</TableHead>
                <TableHead className="text-right min-w-[80px]">Debit</TableHead>
                <TableHead className="text-right min-w-[80px]">Credit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dayBookEntries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="whitespace-nowrap">
                    {format(new Date(entry.entry_date), 'dd MMM yyyy')}
                  </TableCell>
                  <TableCell className="font-medium">{entry.account_name}</TableCell>
                  <TableCell>{entry.description}</TableCell>
                  <TableCell>{entry.reference_number || '-'}</TableCell>
                  <TableCell className="text-right">
                    {entry.debit_amount > 0 ? `₹${entry.debit_amount.toFixed(2)}` : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    {entry.credit_amount > 0 ? `₹${entry.credit_amount.toFixed(2)}` : '-'}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="font-medium bg-muted/50">
                <TableCell colSpan={4}>Total</TableCell>
                <TableCell className="text-right">₹{totalDebit.toFixed(2)}</TableCell>
                <TableCell className="text-right">₹{totalCredit.toFixed(2)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default DayBookReport;
