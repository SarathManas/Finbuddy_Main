
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Calculator, X } from 'lucide-react';

interface InvoiceSummaryProps {
  totalAssessableValue: number;
  totalIgst: number;
  totalCgst: number;
  totalSgst: number;
  grandTotal: number;
  isSameState: boolean;
  onGenerateInvoice: () => void;
  onCancel: () => void;
}

const InvoiceSummary = ({
  totalAssessableValue,
  totalIgst,
  totalCgst,
  totalSgst,
  grandTotal,
  isSameState,
  onGenerateInvoice,
  onCancel
}: InvoiceSummaryProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card className="border-2 border-dashed border-primary/20 bg-primary/5">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Calculator className="h-4 w-4 text-primary" />
            <CardTitle className="text-base text-primary">Invoice Summary</CardTitle>
          </div>
          <CardDescription className="text-xs">Total calculations for this invoice</CardDescription>
        </CardHeader>
        <CardContent className="pt-0 space-y-3">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Assessable Value:</span>
              <span className="font-medium">₹{totalAssessableValue.toFixed(2)}</span>
            </div>
            {isSameState ? (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total CGST:</span>
                  <span className="font-medium">₹{totalCgst.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total SGST:</span>
                  <span className="font-medium">₹{totalSgst.toFixed(2)}</span>
                </div>
              </>
            ) : (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total IGST:</span>
                <span className="font-medium">₹{totalIgst.toFixed(2)}</span>
              </div>
            )}
          </div>
          <div className="border-t pt-3">
            <div className="flex justify-between text-base font-bold">
              <span>Grand Total:</span>
              <span className="text-primary">₹{grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 border-dashed border-primary/20 bg-primary/5">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            <CardTitle className="text-base text-primary">Actions</CardTitle>
          </div>
          <CardDescription className="text-xs">Generate or cancel this invoice</CardDescription>
        </CardHeader>
        <CardContent className="pt-0 space-y-3">
          <Button 
            className="w-full h-10" 
            onClick={onGenerateInvoice}
          >
            <FileText className="mr-2 h-4 w-4" />
            Generate Tax Invoice
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full h-10"
            onClick={onCancel}
          >
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default InvoiceSummary;
