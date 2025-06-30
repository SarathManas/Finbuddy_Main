
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  CreditCard, 
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface FinancialHealthWidgetProps {
  dashboardData: {
    bankAccounts: any[];
    transactions: any[];
    journalEntries: any[];
    invoices: any[];
  } | undefined;
}

const FinancialHealthWidget = ({ dashboardData }: FinancialHealthWidgetProps) => {
  const navigate = useNavigate();

  if (!dashboardData) return null;

  const { bankAccounts, transactions, journalEntries, invoices } = dashboardData;

  // Calculate key financial metrics
  const totalCashPosition = bankAccounts.reduce((sum, account) => sum + (account.current_balance || 0), 0);
  const unpaidInvoices = invoices.filter(inv => inv.status !== 'paid');
  const totalReceivables = unpaidInvoices.reduce((sum, inv) => sum + parseFloat(inv.total || 0), 0);
  
  const recentTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.transaction_date);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return transactionDate >= weekAgo;
  });

  const weeklyInflow = recentTransactions
    .filter(t => t.transaction_type === 'credit')
    .reduce((sum, t) => sum + t.amount, 0);

  const weeklyOutflow = recentTransactions
    .filter(t => t.transaction_type === 'debit')
    .reduce((sum, t) => sum + t.amount, 0);

  const netCashFlow = weeklyInflow - weeklyOutflow;

  const healthScore = Math.min(100, Math.max(0, 
    (totalCashPosition > 0 ? 30 : 0) +
    (netCashFlow > 0 ? 25 : 0) +
    (totalReceivables < totalCashPosition * 2 ? 25 : 0) +
    (journalEntries.filter(je => je.status === 'posted').length / Math.max(1, journalEntries.length) * 20)
  ));

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getHealthBadge = (score: number) => {
    if (score >= 80) return <Badge className="bg-green-100 text-green-800">Excellent</Badge>;
    if (score >= 60) return <Badge className="bg-blue-100 text-blue-800">Good</Badge>;
    if (score >= 40) return <Badge className="bg-orange-100 text-orange-800">Fair</Badge>;
    return <Badge className="bg-red-100 text-red-800">Needs Attention</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              Financial Health Score
              <div className={`text-2xl font-bold ${getHealthColor(healthScore)}`}>
                {Math.round(healthScore)}%
              </div>
            </CardTitle>
            <CardDescription>
              Real-time overview of your financial position
            </CardDescription>
          </div>
          {getHealthBadge(healthScore)}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Cash Position</span>
            </div>
            <div className="text-xl font-bold">₹{totalCashPosition.toLocaleString()}</div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/bank-cash')}
              className="w-full"
            >
              Manage Accounts
            </Button>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Outstanding</span>
            </div>
            <div className="text-xl font-bold">₹{totalReceivables.toLocaleString()}</div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/invoices')}
              className="w-full"
            >
              View Invoices
            </Button>
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Weekly Cash Flow</span>
            {netCashFlow > 0 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
          </div>
          <div className={`text-lg font-bold ${netCashFlow > 0 ? 'text-green-600' : 'text-red-600'}`}>
            ₹{netCashFlow.toLocaleString()}
          </div>
          <div className="text-xs text-muted-foreground">
            In: ₹{weeklyInflow.toLocaleString()} | Out: ₹{weeklyOutflow.toLocaleString()}
          </div>
        </div>

        <div className="flex justify-between items-center pt-2 border-t">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('/accounts')}
          >
            Chart of Accounts
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('/journal-entry')}
          >
            Journal Entry
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('/reconciliation')}
          >
            Reconciliation
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default FinancialHealthWidget;
