
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, FileText, Package, DollarSign, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ActionItemsWidgetProps {
  dashboardData: {
    invoices: any[];
    transactions: any[];
    products: any[];
    documents: any[];
    quotations: any[];
  } | undefined;
}

const ActionItemsWidget = ({ dashboardData }: ActionItemsWidgetProps) => {
  const navigate = useNavigate();

  if (!dashboardData) return null;

  const { invoices, transactions, products, documents, quotations } = dashboardData;

  // Calculate action items
  const overdueInvoices = invoices.filter(i => i.status === 'overdue');
  const uncategorizedTransactions = transactions.filter(t => !t.category || t.category === 'uncategorized');
  const lowStockItems = products.filter(p => (p.stock_quantity || 0) <= (p.reorder_level || 0));
  const outOfStockItems = products.filter(p => (p.stock_quantity || 0) === 0);
  const failedDocuments = documents.filter(d => d.status === 'failed');
  const processingDocuments = documents.filter(d => d.status === 'processing');
  const pendingQuotations = quotations.filter(q => q.status === 'sent' || q.status === 'pending');

  const actionItems = [
    {
      title: 'Overdue Invoices',
      count: overdueInvoices.length,
      description: 'Follow up on payment collection',
      icon: DollarSign,
      priority: 'high',
      action: () => navigate('/invoices'),
      actionText: 'View Invoices'
    },
    {
      title: 'Uncategorized Transactions',
      count: uncategorizedTransactions.length,
      description: 'Categorize for better tracking',
      icon: FileText,
      priority: uncategorizedTransactions.length > 10 ? 'high' : 'medium',
      action: () => navigate('/bank-cash'),
      actionText: 'Categorize'
    },
    {
      title: 'Out of Stock Items',
      count: outOfStockItems.length,
      description: 'Restock immediately',
      icon: Package,
      priority: 'high',
      action: () => navigate('/inventory'),
      actionText: 'View Inventory'
    },
    {
      title: 'Low Stock Alerts',
      count: lowStockItems.length - outOfStockItems.length,
      description: 'Consider reordering soon',
      icon: AlertCircle,
      priority: 'medium',
      action: () => navigate('/inventory'),
      actionText: 'Check Stock'
    },
    {
      title: 'Document Processing Issues',
      count: failedDocuments.length,
      description: 'Review failed uploads',
      icon: FileText,
      priority: 'medium',
      action: () => navigate('/document-upload'),
      actionText: 'Review Documents'
    },
    {
      title: 'Pending Quotations',
      count: pendingQuotations.length,
      description: 'Follow up on quotes',
      icon: Clock,
      priority: 'low',
      action: () => navigate('/sales/quotation'),
      actionText: 'View Quotations'
    }
  ].filter(item => item.count > 0);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-orange-100 text-orange-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-orange-600';
      case 'low': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  if (actionItems.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Action Items
            <Badge className="bg-green-100 text-green-800">All Clear</Badge>
          </CardTitle>
          <CardDescription>No immediate actions required</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-muted-foreground">
            <AlertCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
            <p>Great job! Everything is up to date.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Action Items
          <Badge className="bg-red-100 text-red-800">{actionItems.length}</Badge>
        </CardTitle>
        <CardDescription>Tasks requiring your attention</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {actionItems.map((item, index) => (
          <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              <item.icon className={`h-5 w-5 ${getPriorityIcon(item.priority)}`} />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{item.title}</span>
                  <Badge className={getPriorityColor(item.priority)}>
                    {item.count}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={item.action}>
              {item.actionText}
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default ActionItemsWidget;
