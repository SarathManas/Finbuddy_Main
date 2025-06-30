
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, XCircle, RefreshCw } from 'lucide-react';
import { useProducts } from '@/hooks/useInventory';

const StockAlerts = () => {
  const { data: products, isLoading } = useProducts();

  const lowStockProducts = products?.filter(p => 
    (p.stock_quantity || 0) > 0 && (p.stock_quantity || 0) <= (p.reorder_level || 0)
  ) || [];

  const outOfStockProducts = products?.filter(p => (p.stock_quantity || 0) === 0) || [];

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading alerts...</div>
        </CardContent>
      </Card>
    );
  }

  if (lowStockProducts.length === 0 && outOfStockProducts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Stock Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <p>All products are well stocked!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Stock Alerts
        </CardTitle>
        <Button variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {outOfStockProducts.length > 0 && (
            <div>
              <h4 className="font-medium text-red-600 mb-3 flex items-center gap-2">
                <XCircle className="h-4 w-4" />
                Out of Stock ({outOfStockProducts.length})
              </h4>
              <div className="space-y-2">
                {outOfStockProducts.map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-3 border border-red-200 rounded-lg bg-red-50">
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-muted-foreground">{product.category || 'No category'}</p>
                    </div>
                    <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
                      0 in stock
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {lowStockProducts.length > 0 && (
            <div>
              <h4 className="font-medium text-yellow-600 mb-3 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Low Stock ({lowStockProducts.length})
              </h4>
              <div className="space-y-2">
                {lowStockProducts.map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-3 border border-yellow-200 rounded-lg bg-yellow-50">
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-muted-foreground">{product.category || 'No category'}</p>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                        {product.stock_quantity} left
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        Reorder at {product.reorder_level}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StockAlerts;
