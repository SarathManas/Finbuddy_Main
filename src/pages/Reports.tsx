
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, TrendingUp, PieChart, BookOpen, Scale, DollarSign } from 'lucide-react';
import { startOfMonth, endOfMonth } from 'date-fns';
import DateRangePicker from '@/components/reports/DateRangePicker';
import DayBookReport from '@/components/reports/DayBookReport';
import TrialBalanceReport from '@/components/reports/TrialBalanceReport';
import ProfitLossReport from '@/components/reports/ProfitLossReport';
import BalanceSheetReport from '@/components/reports/BalanceSheetReport';
import { DateRange } from '@/hooks/useReports';

const Reports = () => {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date())
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Financial Reports</h1>
        <p className="text-muted-foreground">
          Comprehensive financial reporting and analysis
        </p>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <DateRangePicker 
          dateRange={dateRange} 
          onDateRangeChange={setDateRange} 
        />
      </div>

      <Tabs defaultValue="daybook" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
          <TabsTrigger value="daybook" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Day Book
          </TabsTrigger>
          <TabsTrigger value="trial-balance" className="flex items-center gap-2">
            <Scale className="h-4 w-4" />
            Trial Balance
          </TabsTrigger>
          <TabsTrigger value="profit-loss" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            P&L Statement
          </TabsTrigger>
          <TabsTrigger value="balance-sheet" className="flex items-center gap-2">
            <PieChart className="h-4 w-4" />
            Balance Sheet
          </TabsTrigger>
        </TabsList>

        <TabsContent value="daybook">
          <DayBookReport dateRange={dateRange} />
        </TabsContent>

        <TabsContent value="trial-balance">
          <TrialBalanceReport dateRange={dateRange} />
        </TabsContent>

        <TabsContent value="profit-loss">
          <ProfitLossReport dateRange={dateRange} />
        </TabsContent>

        <TabsContent value="balance-sheet">
          <BalanceSheetReport dateRange={dateRange} />
        </TabsContent>
      </Tabs>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Cash Flow Statement
            </CardTitle>
            <CardDescription>
              Monitor cash inflows and outflows
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4 text-muted-foreground">
              Cash flow analysis coming soon
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Bank Reconciliation
            </CardTitle>
            <CardDescription>
              Reconcile bank statements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4 text-muted-foreground">
              Bank reconciliation coming soon
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Custom Reports
            </CardTitle>
            <CardDescription>
              Create custom financial reports
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4 text-muted-foreground">
              Custom reports coming soon
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Reports;
