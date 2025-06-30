
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Product } from '@/hooks/useInventory';

const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  category: z.string().optional(),
  description: z.string().optional(),
  buy_price: z.number().min(0, 'Buy price must be positive').optional(),
  sell_price: z.number().min(0, 'Sell price must be positive').optional(),
  stock_quantity: z.number().int().min(0, 'Stock quantity must be non-negative').optional(),
  reorder_level: z.number().int().min(0, 'Reorder level must be non-negative').optional(),
  hsn_code: z.string().optional(),
  location: z.string().optional(),
  supplier: z.string().optional(),
}).refine((data) => data.buy_price || data.sell_price, {
  message: "Either buy price or sell price must be provided",
  path: ["sell_price"],
});

type ProductFormData = z.infer<typeof productSchema>;

interface EditProductDialogProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (productId: string, data: ProductFormData) => void;
}

const EditProductDialog = ({ product, open, onOpenChange, onSave }: EditProductDialogProps) => {
  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
  });

  React.useEffect(() => {
    if (product) {
      form.reset({
        name: product.name,
        category: product.category || '',
        description: product.description || '',
        buy_price: product.buy_price || 0,
        sell_price: product.sell_price || 0,
        stock_quantity: product.stock_quantity || 0,
        reorder_level: product.reorder_level || 10,
        hsn_code: product.hsn_code || '',
        location: product.location || '',
        supplier: product.supplier || '',
      });
    }
  }, [product, form]);

  const onSubmit = async (data: ProductFormData) => {
    if (product) {
      onSave(product.id, data);
    }
  };

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Product Name *</Label>
              <Input
                id="edit-name"
                {...form.register('name')}
                placeholder="Enter product name"
              />
              {form.formState.errors.name && (
                <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-category">Category</Label>
              <Input
                id="edit-category"
                {...form.register('category')}
                placeholder="Enter category"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-hsn_code">HSN Code</Label>
              <Input
                id="edit-hsn_code"
                {...form.register('hsn_code')}
                placeholder="Enter HSN code"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-supplier">Supplier</Label>
              <Input
                id="edit-supplier"
                {...form.register('supplier')}
                placeholder="Enter supplier name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-buy_price">Buy Price</Label>
              <Input
                id="edit-buy_price"
                type="number"
                step="0.01"
                {...form.register('buy_price', { valueAsNumber: true })}
                placeholder="0.00"
              />
              {form.formState.errors.buy_price && (
                <p className="text-sm text-red-600">{form.formState.errors.buy_price.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-sell_price">Sell Price *</Label>
              <Input
                id="edit-sell_price"
                type="number"
                step="0.01"
                {...form.register('sell_price', { valueAsNumber: true })}
                placeholder="0.00"
              />
              {form.formState.errors.sell_price && (
                <p className="text-sm text-red-600">{form.formState.errors.sell_price.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-stock_quantity">Stock Quantity</Label>
              <Input
                id="edit-stock_quantity"
                type="number"
                {...form.register('stock_quantity', { valueAsNumber: true })}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-reorder_level">Reorder Level</Label>
              <Input
                id="edit-reorder_level"
                type="number"
                {...form.register('reorder_level', { valueAsNumber: true })}
                placeholder="10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-location">Location</Label>
              <Input
                id="edit-location"
                {...form.register('location')}
                placeholder="Enter storage location"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              {...form.register('description')}
              placeholder="Enter product description"
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditProductDialog;
