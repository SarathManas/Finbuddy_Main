
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from 'recharts';
import { Badge } from '@/components/ui/badge';

interface EnhancedDashboardChartsProps {
  dashboardData: {
    invoices: any[];
    transactions: any[];
    products: any[];
    quotations: any[];
    bankAccounts: any[];
  } | undefined;
}

const EnhancedDashboardCharts = ({ dashboardData }: EnhancedDashboardChartsProps) => {
  if (!dashboardData) return null;

  const { invoices, transactions, products, quotations, bankAccounts } = dashboardData;

  // Real cash flow data from bank accounts
  const cashFlowData = React.useMemo(() => {
    const last6Months = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('en-US', { month: 'short' });
      
      // Filter transactions for this month
      const monthTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.transaction_date || t.created_at);
        return transactionDate.getMonth() === date.getMonth() && 
               transactionDate.getFullYear() === date.getFullYear();
      });
      
      const income = monthTransactions
        .filter(t => t.transaction_type === 'credit' || t.type === 'income')
        .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
      
      const expenses = monthTransactions
        .filter(t => t.transaction_type === 'debit' || t.type === 'expense')
        .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
      
      last6Months.push({
        month: monthName,
        income: Math.round(income),
        expenses: Math.round(expenses),
        netFlow: Math.round(income - expenses)
      });
    }
    
    return last6Months;
  }, [transactions]);

  // Invoice status distribution
  const invoiceStatusData = React.useMemo(() => {
    const statusCounts = invoices.reduce((acc, invoice) => {
      acc[invoice.status] = (acc[invoice.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(statusCounts).map(([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: count,
      amount: invoices
        .filter(i => i.status === status)
        .reduce((sum, i) => sum + parseFloat(i.total || 0), 0)
    }));
  }, [invoices]);

  // Top product performance
  const productPerformanceData = React.useMemo(() => {
    return products
      .map(product => ({
        name: product.name,
        stock: product.stock_quantity || 0,
        value: (product.stock_quantity || 0) * (product.sell_price || 0),
        sellPrice: product.sell_price || 0
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [products]);

  // Sales conversion funnel
  const salesFunnelData = React.useMemo(() => {
    const totalQuotations = quotations.length;
    const sentQuotations = quotations.filter(q => q.status !== 'draft').length;
    const convertedQuotations = quotations.filter(q => q.status === 'converted').length;
    const paidInvoices = invoices.filter(i => i.status === 'paid').length;

    return [
      { stage: 'Quotations Created', count: totalQuotations, percentage: 100 },
      { stage: 'Quotations Sent', count: sentQuotations, percentage: totalQuotations > 0 ? (sentQuotations / totalQuotations) * 100 : 0 },
      { stage: 'Converted to Invoice', count: convertedQuotations, percentage: totalQuotations > 0 ? (convertedQuotations / totalQuotations) * 100 : 0 },
      { stage: 'Payments Received', count: paidInvoices, percentage: totalQuotations > 0 ? (paidInvoices / totalQuotations) * 100 : 0 }
    ];
  }, [quotations, invoices]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7c7c'];

  const formatCurrency = (value: number) => `₹${value.toLocaleString()}`;

  const formatYAxisValue = (value: any) => {
    const numValue = typeof value === 'number' ? value : parseFloat(value) || 0;
    return `₹${(numValue / 1000).toFixed(0)}K`;
  };

  const formatTooltipValue = (value: any, name: string) => {
    if (name === 'percentage') {
      const numValue = typeof value === 'number' ? value : parseFloat(value) || 0;
      return [`${numValue.toFixed(1)}%`, 'Conversion Rate'];
    }
    const numValue = typeof value === 'number' ? value : parseFloat(value) || 0;
    return [formatCurrency(numValue), name];
  };

  const formatTooltipValueForProducts = (value: any, name: string) => {
    const numValue = typeof value === 'number' ? value : parseFloat(value) || 0;
    if (name === 'value') {
      return [formatCurrency(numValue), 'Inventory Value'];
    } else if (name === 'stock') {
      return [numValue.toString(), 'Stock Quantity'];
    }
    return [numValue.toString(), 'Sell Price'];
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Cash Flow Chart */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Cash Flow Analysis
            <Badge className="bg-blue-100 text-blue-800">Last 6 Months</Badge>
          </CardTitle>
          <CardDescription>Income vs expenses trend with net cash flow</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={cashFlowData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={formatYAxisValue} />
              <Tooltip formatter={formatTooltipValue} />
              <Area dataKey="income" stackId="1" stroke="#00C49F" fill="#00C49F" fillOpacity={0.6} name="Income" />
              <Area dataKey="expenses" stackId="2" stroke="#FF8042" fill="#FF8042" fillOpacity={0.6} name="Expenses" />
              <Line dataKey="netFlow" stroke="#0088FE" strokeWidth={3} name="Net Flow" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Invoice Status Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice Status Overview</CardTitle>
          <CardDescription>Distribution of invoice statuses by count and value</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={invoiceStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {invoiceStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value, name, props) => [
                `${value} invoices`,
                `Total: ${formatCurrency(props.payload.amount)}`
              ]} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Sales Conversion Funnel */}
      <Card>
        <CardHeader>
          <CardTitle>Sales Conversion Funnel</CardTitle>
          <CardDescription>Track your sales process from quote to payment</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={salesFunnelData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 100]} />
              <YAxis dataKey="stage" type="category" width={120} />
              <Tooltip formatter={formatTooltipValue} />
              <Bar dataKey="percentage" fill="#0088FE" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top Products by Value */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Inventory Value Analysis</CardTitle>
          <CardDescription>Top products by total inventory value</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={productPerformanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                angle={-45}
                textAnchor="end"
                height={80}
                interval={0}
              />
              <YAxis tickFormatter={formatYAxisValue} />
              <Tooltip formatter={formatTooltipValueForProducts} />
              <Bar dataKey="value" fill="#00C49F" name="Inventory Value" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedDashboardCharts;
