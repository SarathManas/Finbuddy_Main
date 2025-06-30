
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, MoreHorizontal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface RecentInvoicesProps {
  invoices: any[];
}

const RecentInvoices = ({ invoices }: RecentInvoicesProps) => {
  const navigate = useNavigate();
  
  const recentInvoices = invoices
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Recent Invoices</CardTitle>
          <CardDescription>Latest invoice activity</CardDescription>
        </div>
        <Button variant="outline" onClick={() => navigate('/invoices')}>
          View All
        </Button>
      </CardHeader>
      <CardContent>
        <div className="spacing-comfortable">
          {recentInvoices.map((invoice) => (
            <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <div>
                    <p className="font-medium text-data">{invoice.invoice_number}</p>
                    <p className="text-sm text-muted-foreground text-medium-contrast">
                      Due: {new Date(invoice.due_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Badge className={getStatusColor(invoice.status)}>
                  {invoice.status}
                </Badge>
                <div className="text-right">
                  <p className="font-semibold text-data-large">${parseFloat(invoice.total).toFixed(2)}</p>
                </div>
                <Button variant="ghost" size="sm">
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          
          {recentInvoices.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-body">
              No invoices found. Create your first invoice to get started.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentInvoices;
