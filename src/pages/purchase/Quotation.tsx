
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Receipt } from 'lucide-react';

const PurchaseQuotation = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Purchase Quotation</h1>
        <p className="text-muted-foreground">
          Manage purchase quotations and requests
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Purchase Quotation Management
          </CardTitle>
          <CardDescription>
            Request and manage quotes from suppliers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Purchase quotation features will be implemented here
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PurchaseQuotation;
