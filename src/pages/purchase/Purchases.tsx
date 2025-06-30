
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Package } from 'lucide-react';

const Purchases = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Purchases</h1>
        <p className="text-muted-foreground">
          View and manage all your purchases
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Purchase Management
          </CardTitle>
          <CardDescription>
            Track all your business purchases and orders
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Purchase management features will be implemented here
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Purchases;
