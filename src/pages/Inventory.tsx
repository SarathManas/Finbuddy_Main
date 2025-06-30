
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import InventoryStats from '@/components/inventory/InventoryStats';
import ProductTable from '@/components/inventory/ProductTable';
import InventoryMovements from '@/components/inventory/InventoryMovements';
import StockAlerts from '@/components/inventory/StockAlerts';

const Inventory = () => {
  const [activeTab, setActiveTab] = useState('products');
  const queryClient = useQueryClient();

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['products'] });
    queryClient.invalidateQueries({ queryKey: ['inventory-movements'] });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Inventory Management</h1>
          <p className="text-muted-foreground">
            Monitor stock levels, track movements, and manage your inventory
          </p>
        </div>
        <Button onClick={handleRefresh} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Summary Statistics */}
      <InventoryStats />

      {/* Tabbed Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="movements">Movements</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-6">
          <ProductTable />
        </TabsContent>

        <TabsContent value="movements" className="space-y-6">
          <InventoryMovements />
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <StockAlerts />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Inventory;
