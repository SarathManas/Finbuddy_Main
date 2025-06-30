
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAddProduct } from '@/hooks/useInventory';

const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  category: z.string().optional().or(z.literal('')),
  description: z.string().optional().or(z.literal('')),
  buy_price: z.number().min(0, 'Buy price must be positive').optional().or(z.literal('')),
  sell_price: z.number().min(0, 'Sell price must be positive').optional().or(z.literal('')),
  stock_quantity: z.number().int().min(0, 'Stock quantity must be non-negative').optional().or(z.literal('')),
  reorder_level: z.number().int().min(0, 'Reorder level must be non-negative').optional().or(z.literal('')),
  hsn_code: z.string().optional().or(z.literal('')),
  location: z.string().optional().or(z.literal('')),
  supplier: z.string().optional().or(z.literal('')),
}).refine((data) => data.buy_price || data.sell_price, {
  message: "Either buy price or sell price must be provided",
  path: ["sell_price"],
});

type ProductFormData = z.infer<typeof productSchema>;

interface AddProductDialogProps {
  children?: React.ReactNode;
}

const AddProductDialog = ({ children }: AddProductDialogProps) => {
  const [open, setOpen] = React.useState(false);
  const addProductMutation = useAddProduct();

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      category: '',
      description: '',
      buy_price: 0,
      sell_price: 0,
      stock_quantity: 0,
      reorder_level: 10,
      hsn_code: '',
      location: '',
      supplier: '',
    },
  });

  const onSubmit = async (data: ProductFormData) => {
    try {
      // Transform the data to match the expected Product type
      const productData = {
        name: data.name,
        category: data.category || null,
        description: data.description || null,
        price: null, // Set price to null since we're not using it
        buy_price: data.buy_price || null,
        sell_price: data.sell_price || null,
        stock_quantity: data.stock_quantity || null,
        reorder_level: data.reorder_level || null,
        hsn_code: data.hsn_code || null,
        location: data.location || null,
        supplier: data.supplier || null,
        last_restocked: null,
      };
      
      await addProductMutation.mutateAsync(productData);
      setOpen(false);
      form.reset();
    } catch (error) {
      console.error('Error adding product:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                {...form.register('name')}
                placeholder="Enter product name"
              />
              {form.formState.errors.name && (
                <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                {...form.register('category')}
                placeholder="Enter category"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hsn_code">HSN Code</Label>
              <Input
                id="hsn_code"
                {...form.register('hsn_code')}
                placeholder="Enter HSN code"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="supplier">Supplier</Label>
              <Input
                id="supplier"
                {...form.register('supplier')}
                placeholder="Enter supplier name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="buy_price">Buy Price</Label>
              <Input
                id="buy_price"
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
              <Label htmlFor="sell_price">Sell Price *</Label>
              <Input
                id="sell_price"
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
              <Label htmlFor="stock_quantity">Stock Quantity</Label>
              <Input
                id="stock_quantity"
                type="number"
                {...form.register('stock_quantity', { valueAsNumber: true })}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reorder_level">Reorder Level</Label>
              <Input
                id="reorder_level"
                type="number"
                {...form.register('reorder_level', { valueAsNumber: true })}
                placeholder="10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                {...form.register('location')}
                placeholder="Enter storage location"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...form.register('description')}
              placeholder="Enter product description"
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={addProductMutation.isPending}>
              {addProductMutation.isPending ? 'Adding...' : 'Add Product'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddProductDialog;
