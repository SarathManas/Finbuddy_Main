
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Edit, FileText, CheckCircle, XCircle } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Quotation } from '@/hooks/useQuotations';

interface QuotationTableProps {
  quotations: Quotation[];
  isLoading: boolean;
  onConvertToInvoice: (quotationId: string) => void;
  onUpdateStatus: (id: string, status: string) => void;
  isConverting: boolean;
}

const QuotationTable = ({ quotations, isLoading, onConvertToInvoice, onUpdateStatus, isConverting }: QuotationTableProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'expired': return 'bg-orange-100 text-orange-800';
      case 'converted': return 'bg-purple-100 text-purple-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isExpired = (validUntil: string) => {
    return new Date(validUntil) < new Date();
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  if (quotations.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">No quotations found.</p>
        <Button>
          <FileText className="mr-2 h-4 w-4" />
          Create your first quotation
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="font-semibold">Quotation</TableHead>
            <TableHead className="font-semibold">Customer</TableHead>
            <TableHead className="font-semibold">Status</TableHead>
            <TableHead className="font-semibold">Issue Date</TableHead>
            <TableHead className="font-semibold">Valid Until</TableHead>
            <TableHead className="text-right font-semibold">Amount</TableHead>
            <TableHead className="text-right font-semibold">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {quotations.map((quotation) => (
            <TableRow key={quotation.id}>
              <TableCell className="font-medium">
                {quotation.quotation_number}
              </TableCell>
              <TableCell>
                <div>
                  <p className="font-medium">{quotation.customers?.name}</p>
                  {quotation.customers?.legal_name && (
                    <p className="text-sm text-muted-foreground">{quotation.customers.legal_name}</p>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Badge className={getStatusColor(quotation.status)}>
                  {quotation.status}
                </Badge>
                {isExpired(quotation.valid_until) && quotation.status !== 'converted' && quotation.status !== 'rejected' && (
                  <Badge className="ml-2 bg-red-100 text-red-800">Expired</Badge>
                )}
              </TableCell>
              <TableCell>
                {new Date(quotation.issue_date).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <span className={isExpired(quotation.valid_until) ? 'text-red-600 font-medium' : ''}>
                  {new Date(quotation.valid_until).toLocaleDateString()}
                </span>
              </TableCell>
              <TableCell className="text-right font-medium">
                ${parseFloat(quotation.total.toString()).toFixed(2)}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    {quotation.status === 'accepted' && (
                      <DropdownMenuItem 
                        onClick={() => onConvertToInvoice(quotation.id)}
                        disabled={isConverting}
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        Convert to Invoice
                      </DropdownMenuItem>
                    )}
                    {quotation.status === 'sent' && (
                      <>
                        <DropdownMenuItem 
                          onClick={() => onUpdateStatus(quotation.id, 'accepted')}
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Mark as Accepted
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => onUpdateStatus(quotation.id, 'rejected')}
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Mark as Rejected
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default QuotationTable;
