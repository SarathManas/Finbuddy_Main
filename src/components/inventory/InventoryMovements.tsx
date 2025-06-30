
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TrendingUp, TrendingDown, RotateCcw, ArrowUpDown } from 'lucide-react';
import { useInventoryMovements } from '@/hooks/useInventory';
import AddMovementDialog from './AddMovementDialog';

const InventoryMovements = () => {
  const { data: movements, isLoading } = useInventoryMovements();

  const getMovementIcon = (type: string) => {
    switch (type) {
      case 'purchase':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'sale':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      case 'return':
        return <RotateCcw className="h-4 w-4 text-blue-600" />;
      case 'adjustment':
        return <ArrowUpDown className="h-4 w-4 text-orange-600" />;
      default:
        return <ArrowUpDown className="h-4 w-4" />;
    }
  };

  const getMovementColor = (type: string) => {
    switch (type) {
      case 'purchase':
        return 'bg-green-100 text-green-800 hover:bg-green-100';
      case 'sale':
        return 'bg-red-100 text-red-800 hover:bg-red-100';
      case 'return':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
      case 'adjustment':
        return 'bg-orange-100 text-orange-800 hover:bg-orange-100';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading movements...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Stock Movements</CardTitle>
        <AddMovementDialog />
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {movements?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <ArrowUpDown className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">No stock movements found</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                movements?.map((movement) => (
                  <TableRow key={movement.id}>
                    <TableCell className="font-medium">
                      {movement.products?.name || 'Unknown Product'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getMovementIcon(movement.movement_type)}
                        <Badge className={getMovementColor(movement.movement_type)}>
                          {movement.movement_type.charAt(0).toUpperCase() + movement.movement_type.slice(1)}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={movement.movement_type === 'sale' || movement.movement_type === 'adjustment' ? 'text-red-600' : 'text-green-600'}>
                        {movement.movement_type === 'sale' || movement.movement_type === 'adjustment' ? '-' : '+'}
                        {movement.quantity}
                      </span>
                    </TableCell>
                    <TableCell>{movement.reference_number || '-'}</TableCell>
                    <TableCell>
                      {new Date(movement.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="max-w-48 truncate">
                      {movement.notes || '-'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default InventoryMovements;
