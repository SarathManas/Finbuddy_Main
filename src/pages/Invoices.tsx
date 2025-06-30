
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Filter, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import InvoiceTable from '@/components/invoices/InvoiceTable';
import InvoiceFilters from '@/components/invoices/InvoiceFilters';

const Invoices = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: invoicesData, isLoading } = useQuery({
    queryKey: ['invoices-with-customers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          customers (
            name,
            email,
            legal_name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  const filteredInvoices = React.useMemo(() => {
    if (!invoicesData) return [];
    
    return invoicesData.filter(invoice => {
      const customerName = invoice.customers?.name || '';
      const customerLegalName = invoice.customers?.legal_name || '';
      const searchText = searchTerm.toLowerCase();
      
      const matchesSearch = 
        invoice.invoice_number.toLowerCase().includes(searchText) ||
        customerName.toLowerCase().includes(searchText) ||
        customerLegalName.toLowerCase().includes(searchText);
      
      const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [invoicesData, searchTerm, statusFilter]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Invoices</h1>
          <p className="text-muted-foreground">
            Create and manage your invoices
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Invoice
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Invoice Management</CardTitle>
          <CardDescription>
            Track all your invoices and their payment status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search invoices, customers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <InvoiceFilters 
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
            />
          </div>

          <InvoiceTable 
            invoices={filteredInvoices}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default Invoices;
