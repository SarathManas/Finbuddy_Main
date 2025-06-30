
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';

const PurchaseEntry = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Purchase Entry</h1>
        <p className="text-muted-foreground">
          Record your business purchases
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Purchase Recording
          </CardTitle>
          <CardDescription>
            Track and manage your purchase transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Purchase entry features will be implemented here
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PurchaseEntry;
