
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from 'lucide-react';

interface BusinessHealthOverviewProps {
  dashboardData: {
    invoices: any[];
    transactions: any[];
    products: any[];
    documents: any[];
    quotations: any[];
  } | undefined;
}

const BusinessHealthOverview = ({ dashboardData }: BusinessHealthOverviewProps) => {
  if (!dashboardData) return null;

  const { invoices, transactions, products, documents, quotations } = dashboardData;

  // Calculate health metrics
  const totalInvoices = invoices.length;
  const paidInvoices = invoices.filter(i => i.status === 'paid').length;
  const paymentRate = totalInvoices > 0 ? (paidInvoices / totalInvoices) * 100 : 0;

  const totalTransactions = transactions.length;
  const categorizedTransactions = transactions.filter(t => t.category && t.category !== 'uncategorized').length;
  const categorizationRate = totalTransactions > 0 ? (categorizedTransactions / totalTransactions) * 100 : 0;

  const totalDocuments = documents.length;
  const processedDocuments = documents.filter(d => d.status === 'completed').length;
  const processingRate = totalDocuments > 0 ? (processedDocuments / totalDocuments) * 100 : 0;

  const outOfStockItems = products.filter(p => (p.stock_quantity || 0) === 0).length;
  const inventoryHealth = products.length > 0 ? ((products.length - outOfStockItems) / products.length) * 100 : 100;

  const convertedQuotations = quotations.filter(q => q.status === 'converted').length;
  const salesConversion = quotations.length > 0 ? (convertedQuotations / quotations.length) * 100 : 0;

  const healthMetrics = [
    {
      name: 'Payment Collection',
      value: paymentRate,
      description: `${paidInvoices}/${totalInvoices} invoices paid`,
      status: paymentRate >= 80 ? 'excellent' : paymentRate >= 60 ? 'good' : 'needs-attention'
    },
    {
      name: 'Transaction Organization',
      value: categorizationRate,
      description: `${categorizedTransactions}/${totalTransactions} categorized`,
      status: categorizationRate >= 90 ? 'excellent' : categorizationRate >= 70 ? 'good' : 'needs-attention'
    },
    {
      name: 'Document Processing',
      value: processingRate,
      description: `${processedDocuments}/${totalDocuments} processed`,
      status: processingRate >= 85 ? 'excellent' : processingRate >= 65 ? 'good' : 'needs-attention'
    },
    {
      name: 'Inventory Management',
      value: inventoryHealth,
      description: `${outOfStockItems} items out of stock`,
      status: inventoryHealth >= 95 ? 'excellent' : inventoryHealth >= 85 ? 'good' : 'needs-attention'
    },
    {
      name: 'Sales Conversion',
      value: salesConversion,
      description: `${convertedQuotations}/${quotations.length} quotes converted`,
      status: salesConversion >= 25 ? 'excellent' : salesConversion >= 15 ? 'good' : 'needs-attention'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'needs-attention': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'good': return <TrendingUp className="h-4 w-4 text-blue-600" />;
      case 'needs-attention': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'excellent': return <Badge className="bg-green-100 text-green-800">Excellent</Badge>;
      case 'good': return <Badge className="bg-blue-100 text-blue-800">Good</Badge>;
      case 'needs-attention': return <Badge className="bg-red-100 text-red-800">Needs Attention</Badge>;
      default: return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Business Health Overview
          <TrendingUp className="h-5 w-5 text-blue-600" />
        </CardTitle>
        <CardDescription>
          Key performance indicators across your business operations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {healthMetrics.map((metric, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-medium">{metric.name}</span>
                {getStatusIcon(metric.status)}
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-medium ${getStatusColor(metric.status)}`}>
                  {metric.value.toFixed(0)}%
                </span>
                {getStatusBadge(metric.status)}
              </div>
            </div>
            <Progress value={metric.value} className="h-2" />
            <p className="text-sm text-muted-foreground">{metric.description}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default BusinessHealthOverview;
