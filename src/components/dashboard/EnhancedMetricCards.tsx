
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Users, FileText, TrendingUp, TrendingDown, AlertCircle, Package } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface EnhancedMetricCardsProps {
  dashboardData: {
    invoices: any[];
    customers: any[];
    transactions: any[];
    bankAccounts: any[];
    products: any[];
    documents: any[];
    quotations: any[];
    journalEntries: any[];
  } | undefined;
}

const EnhancedMetricCards = ({ dashboardData }: EnhancedMetricCardsProps) => {
  if (!dashboardData) return null;

  const { invoices, customers, transactions, bankAccounts, products, documents, quotations } = dashboardData;

  // Financial metrics
  const totalCashPosition = bankAccounts.reduce((sum, account) => sum + (account.current_balance || 0), 0);
  
  const paidInvoices = invoices.filter(i => i.status === 'paid');
  const totalRevenue = paidInvoices.reduce((sum, i) => sum + parseFloat(i.total || 0), 0);
  
  const overdueInvoices = invoices.filter(i => i.status === 'overdue');
  const overdueAmount = overdueInvoices.reduce((sum, i) => sum + parseFloat(i.total || 0), 0);

  // Operational metrics
  const lowStockItems = products.filter(p => (p.stock_quantity || 0) <= (p.reorder_level || 0));
  const uncategorizedTransactions = transactions.filter(t => !t.category || t.category === 'uncategorized');
  
  // Sales metrics
  const activeQuotations = quotations.filter(q => q.status === 'sent' || q.status === 'pending');
  const convertedQuotations = quotations.filter(q => q.status === 'converted');
  const conversionRate = quotations.length > 0 ? (convertedQuotations.length / quotations.length) * 100 : 0;

  // Document processing
  const processingDocuments = documents.filter(d => d.status === 'processing');
  const failedDocuments = documents.filter(d => d.status === 'failed');

  const metrics = [
    {
      title: 'Cash Position',
      value: `₹${totalCashPosition.toLocaleString()}`,
      icon: DollarSign,
      description: `Across ${bankAccounts.length} accounts`,
      trend: totalCashPosition > 0 ? '+' : '',
      trendColor: totalCashPosition > 0 ? 'text-green-600' : 'text-red-600',
      alert: totalCashPosition < 10000 ? 'Low cash position' : null
    },
    {
      title: 'Revenue This Month',
      value: `₹${totalRevenue.toLocaleString()}`,
      icon: TrendingUp,
      description: `${paidInvoices.length} paid invoices`,
      trend: '+12.5%',
      trendColor: 'text-green-600',
      alert: null
    },
    {
      title: 'Outstanding Amount',
      value: `₹${overdueAmount.toLocaleString()}`,
      icon: AlertCircle,
      description: `${overdueInvoices.length} overdue invoices`,
      trend: overdueInvoices.length > 0 ? 'Needs attention' : 'All clear',
      trendColor: overdueInvoices.length > 0 ? 'text-red-600' : 'text-green-600',
      alert: overdueInvoices.length > 0 ? 'Overdue payments' : null
    },
    {
      title: 'Active Customers',
      value: customers.length.toString(),
      icon: Users,
      description: `${activeQuotations.length} pending quotes`,
      trend: `${conversionRate.toFixed(1)}% conversion`,
      trendColor: conversionRate > 20 ? 'text-green-600' : 'text-orange-600',
      alert: null
    },
    {
      title: 'Stock Alerts',
      value: lowStockItems.length.toString(),
      icon: Package,
      description: `${products.length} total products`,
      trend: lowStockItems.length > 0 ? 'Reorder needed' : 'Stock healthy',
      trendColor: lowStockItems.length > 0 ? 'text-red-600' : 'text-green-600',
      alert: lowStockItems.length > 0 ? 'Low stock items' : null
    },
    {
      title: 'Pending Actions',
      value: (uncategorizedTransactions.length + processingDocuments.length + failedDocuments.length).toString(),
      icon: FileText,
      description: 'Transactions & documents',
      trend: uncategorizedTransactions.length > 0 ? 'Categorization needed' : 'Up to date',
      trendColor: uncategorizedTransactions.length > 0 ? 'text-orange-600' : 'text-green-600',
      alert: uncategorizedTransactions.length > 5 ? 'Many uncategorized items' : null
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {metrics.map((metric, index) => (
        <Card key={index} className="relative">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              {metric.title}
              {metric.alert && (
                <Badge variant="destructive" className="text-xs px-1.5 py-0.5">
                  !
                </Badge>
              )}
            </CardTitle>
            <metric.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-2xl font-bold">{metric.value}</div>
            <p className="text-sm text-muted-foreground">
              {metric.description}
            </p>
            <div className={`text-sm font-medium ${metric.trendColor}`}>
              {metric.trend}
            </div>
            {metric.alert && (
              <div className="text-xs text-red-600 font-medium bg-red-50 px-2 py-1 rounded">
                {metric.alert}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default EnhancedMetricCards;
