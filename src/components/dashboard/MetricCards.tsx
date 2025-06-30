
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Users, FileText, TrendingUp } from 'lucide-react';

interface MetricCardsProps {
  data: {
    invoices: any[];
    customers: any[];
    transactions: any[];
  } | undefined;
}

const MetricCards = ({ data }: MetricCardsProps) => {
  if (!data) return null;

  const totalRevenue = data.transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const totalExpenses = data.transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const paidInvoices = data.invoices.filter(i => i.status === 'paid');
  const pendingInvoices = data.invoices.filter(i => ['sent', 'overdue'].includes(i.status));

  const metrics = [
    {
      title: 'Total Revenue',
      value: `$${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      description: 'From paid invoices',
      trend: '+12.5%'
    },
    {
      title: 'Active Customers',
      value: data.customers.length.toString(),
      icon: Users,
      description: 'Total customers',
      trend: '+3.2%'
    },
    {
      title: 'Paid Invoices',
      value: paidInvoices.length.toString(),
      icon: FileText,
      description: `${pendingInvoices.length} pending`,
      trend: '+8.1%'
    },
    {
      title: 'Net Profit',
      value: `$${(totalRevenue - totalExpenses).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      icon: TrendingUp,
      description: 'Revenue - Expenses',
      trend: '+15.3%'
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{metric.title}</CardTitle>
            <metric.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="spacing-compact">
            <div className="text-2xl font-bold text-data-large">{metric.value}</div>
            <p className="text-sm text-muted-foreground text-medium-contrast">
              {metric.description}
            </p>
            <div className="text-sm text-green-600 font-medium mt-1">
              {metric.trend} from last month
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default MetricCards;
