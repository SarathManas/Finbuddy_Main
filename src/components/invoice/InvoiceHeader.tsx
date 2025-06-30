
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileText } from 'lucide-react';

interface InvoiceHeaderProps {
  invoiceNumber: string;
  date: string;
  onInvoiceNumberChange: (value: string) => void;
  onDateChange: (value: string) => void;
}

const InvoiceHeader = ({
  invoiceNumber,
  date,
  onInvoiceNumberChange,
  onDateChange
}: InvoiceHeaderProps) => {
  return (
    <Card className="border-2 border-dashed border-primary/20 bg-primary/5">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          <CardTitle className="text-base text-primary">Invoice Details</CardTitle>
        </div>
        <CardDescription className="text-xs">Enter invoice number and date</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="invoice-number" className="text-xs font-medium">Invoice Number *</Label>
            <Input
              id="invoice-number"
              value={invoiceNumber}
              onChange={(e) => onInvoiceNumberChange(e.target.value)}
              className="h-9 text-sm"
            />
          </div>
          <div>
            <Label htmlFor="date" className="text-xs font-medium">Date *</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => onDateChange(e.target.value)}
              className="h-9 text-sm"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InvoiceHeader;
