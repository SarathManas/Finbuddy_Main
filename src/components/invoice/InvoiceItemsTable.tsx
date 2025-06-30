
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2, Package, ShoppingCart } from 'lucide-react';
import { useProducts } from '@/hooks/useInventory';

interface InvoiceItem {
  id: string;
  description: string;
  hsnCode: string;
  price: number;
  qty: number;
  discPercent: number;
  assessableValue: number;
  gstRate: number;
  igst: number;
  cgst: number;
  sgst: number;
}

interface NewItem {
  description: string;
  hsnCode: string;
  price: number;
  qty: number;
  discPercent: number;
  gstRate: number;
}

interface InvoiceItemsTableProps {
  items: InvoiceItem[];
  newItem: NewItem;
  isSameState: boolean;
  onNewItemChange: (item: NewItem) => void;
  onAddItem: () => void;
  onRemoveItem: (id: string) => void;
  onClearAllItems: () => void;
}

const InvoiceItemsTable = ({
  items,
  newItem,
  isSameState,
  onNewItemChange,
  onAddItem,
  onRemoveItem,
  onClearAllItems
}: InvoiceItemsTableProps) => {
  const { data: products = [], isLoading } = useProducts();

  const handleProductSelect = (productId: string) => {
    const selectedProduct = products.find(p => p.id === productId);
    if (selectedProduct) {
      onNewItemChange({
        ...newItem,
        description: selectedProduct.name,
        hsnCode: selectedProduct.hsn_code || '',
        price: selectedProduct.sell_price || 0
      });
    }
  };

  return (
    <div className="space-y-3">
      {/* Add New Item */}
      <Card className="border-2 border-dashed border-primary/20 bg-primary/5">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Plus className="h-4 w-4 text-primary" />
            <CardTitle className="text-base text-primary">Add Invoice Item</CardTitle>
          </div>
          <CardDescription className="text-xs">Add products/services to this invoice</CardDescription>
        </CardHeader>
        <CardContent className="pt-0 space-y-4">
          {/* Product Selection Dropdown */}
          <div>
            <Label className="text-xs font-medium">Select from Inventory</Label>
            <Select onValueChange={handleProductSelect}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="Choose from existing products..." />
              </SelectTrigger>
              <SelectContent className="bg-white z-50">
                {isLoading ? (
                  <SelectItem value="loading" disabled>Loading products...</SelectItem>
                ) : products.length === 0 ? (
                  <SelectItem value="empty" disabled>No products found</SelectItem>
                ) : (
                  products.map(product => (
                    <SelectItem key={product.id} value={product.id}>
                      <div className="flex items-center gap-2">
                        <Package className="h-3 w-3" />
                        <div className="flex flex-col">
                          <span className="font-medium">{product.name}</span>
                          {product.stock_quantity !== null && (
                            <span className="text-xs text-muted-foreground">
                              Stock: {product.stock_quantity} | Price: ₹{product.sell_price || 0}
                            </span>
                          )}
                        </div>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-6 gap-2">
            <div className="col-span-2">
              <Label className="text-xs font-medium">Description *</Label>
              <Input
                value={newItem.description}
                onChange={(e) => onNewItemChange({ ...newItem, description: e.target.value })}
                className="h-9 text-sm"
                placeholder="Item description"
              />
            </div>
            <div>
              <Label className="text-xs font-medium">HSN Code</Label>
              <Input
                value={newItem.hsnCode}
                onChange={(e) => onNewItemChange({ ...newItem, hsnCode: e.target.value })}
                className="h-9 text-sm"
                placeholder="HSN"
              />
            </div>
            <div>
              <Label className="text-xs font-medium">Price</Label>
              <Input
                type="number"
                value={newItem.price}
                onChange={(e) => onNewItemChange({ ...newItem, price: parseFloat(e.target.value) || 0 })}
                className="h-9 text-sm"
                placeholder="0.00"
              />
            </div>
            <div>
              <Label className="text-xs font-medium">Qty</Label>
              <Input
                type="number"
                value={newItem.qty}
                onChange={(e) => onNewItemChange({ ...newItem, qty: parseInt(e.target.value) || 1 })}
                className="h-9 text-sm"
                placeholder="1"
              />
            </div>
            <div>
              <Label className="text-xs font-medium">Disc%</Label>
              <Input
                type="number"
                value={newItem.discPercent}
                onChange={(e) => onNewItemChange({ ...newItem, discPercent: parseFloat(e.target.value) || 0 })}
                className="h-9 text-sm"
                placeholder="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2">
            <div>
              <Label className="text-xs font-medium">GST Rate (%)</Label>
              <Select
                value={newItem.gstRate.toString()}
                onValueChange={(value) => onNewItemChange({ ...newItem, gstRate: parseFloat(value) })}
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white z-50">
                  <SelectItem value="0">0%</SelectItem>
                  <SelectItem value="5">5%</SelectItem>
                  <SelectItem value="12">12%</SelectItem>
                  <SelectItem value="18">18%</SelectItem>
                  <SelectItem value="28">28%</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-3 flex items-end">
              <Button onClick={onAddItem} className="h-9 w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Items List */}
      <Card className="border-2 border-dashed border-primary/20 bg-primary/5">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4 text-primary" />
                <CardTitle className="text-base text-primary">Invoice Items</CardTitle>
              </div>
              <CardDescription className="text-xs">
                {items.length} item{items.length !== 1 ? 's' : ''} added to invoice
              </CardDescription>
            </div>
            {items.length > 0 && (
              <Button variant="outline" size="sm" onClick={onClearAllItems}>
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {items.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No items added yet</p>
              <p className="text-xs">Add items using the form above</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Description</TableHead>
                    <TableHead className="text-xs">HSN</TableHead>
                    <TableHead className="text-xs">Price</TableHead>
                    <TableHead className="text-xs">Qty</TableHead>
                    <TableHead className="text-xs">Disc%</TableHead>
                    <TableHead className="text-xs">Assessable Value</TableHead>
                    <TableHead className="text-xs">GST%</TableHead>
                    {isSameState ? (
                      <>
                        <TableHead className="text-xs">CGST</TableHead>
                        <TableHead className="text-xs">SGST</TableHead>
                      </>
                    ) : (
                      <TableHead className="text-xs">IGST</TableHead>
                    )}
                    <TableHead className="text-xs">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="text-xs">{item.description}</TableCell>
                      <TableCell className="text-xs">{item.hsnCode}</TableCell>
                      <TableCell className="text-xs">₹{item.price.toFixed(2)}</TableCell>
                      <TableCell className="text-xs">{item.qty}</TableCell>
                      <TableCell className="text-xs">{item.discPercent}%</TableCell>
                      <TableCell className="text-xs">₹{item.assessableValue.toFixed(2)}</TableCell>
                      <TableCell className="text-xs">{item.gstRate}%</TableCell>
                      {isSameState ? (
                        <>
                          <TableCell className="text-xs">₹{item.cgst.toFixed(2)}</TableCell>
                          <TableCell className="text-xs">₹{item.sgst.toFixed(2)}</TableCell>
                        </>
                      ) : (
                        <TableCell className="text-xs">₹{item.igst.toFixed(2)}</TableCell>
                      )}
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onRemoveItem(item.id)}
                          className="h-7 w-7 p-0"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default InvoiceItemsTable;
