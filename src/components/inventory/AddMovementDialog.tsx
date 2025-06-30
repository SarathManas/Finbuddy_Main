
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useProducts, useAddInventoryMovement } from '@/hooks/useInventory';

const movementSchema = z.object({
  product_id: z.string().min(1, 'Product is required'),
  movement_type: z.enum(['purchase', 'sale', 'adjustment', 'return'], {
    required_error: 'Movement type is required',
  }),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
  reference_number: z.string().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
});

type MovementFormData = z.infer<typeof movementSchema>;

interface AddMovementDialogProps {
  children?: React.ReactNode;
}

const AddMovementDialog = ({ children }: AddMovementDialogProps) => {
  const [open, setOpen] = React.useState(false);
  const { data: products } = useProducts();
  const addMovementMutation = useAddInventoryMovement();

  const form = useForm<MovementFormData>({
    resolver: zodResolver(movementSchema),
    defaultValues: {
      product_id: '',
      movement_type: 'purchase',
      quantity: 1,
      reference_number: '',
      notes: '',
    },
  });

  const onSubmit = async (data: MovementFormData) => {
    try {
      // Transform the data to match the expected type
      const movementData = {
        product_id: data.product_id,
        movement_type: data.movement_type,
        quantity: data.quantity,
        reference_number: data.reference_number || null,
        notes: data.notes || null,
      };
      
      await addMovementMutation.mutateAsync(movementData);
      setOpen(false);
      form.reset();
    } catch (error) {
      console.error('Error adding movement:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Movement
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Stock Movement</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="product_id">Product *</Label>
            <Controller
              name="product_id"
              control={form.control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products?.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {form.formState.errors.product_id && (
              <p className="text-sm text-red-600">{form.formState.errors.product_id.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="movement_type">Movement Type *</Label>
            <Controller
              name="movement_type"
              control={form.control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select movement type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="purchase">Purchase</SelectItem>
                    <SelectItem value="sale">Sale</SelectItem>
                    <SelectItem value="adjustment">Adjustment</SelectItem>
                    <SelectItem value="return">Return</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {form.formState.errors.movement_type && (
              <p className="text-sm text-red-600">{form.formState.errors.movement_type.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity *</Label>
            <Input
              id="quantity"
              type="number"
              {...form.register('quantity', { valueAsNumber: true })}
              placeholder="1"
            />
            {form.formState.errors.quantity && (
              <p className="text-sm text-red-600">{form.formState.errors.quantity.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="reference_number">Reference Number</Label>
            <Input
              id="reference_number"
              {...form.register('reference_number')}
              placeholder="Enter reference number"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              {...form.register('notes')}
              placeholder="Enter any notes"
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={addMovementMutation.isPending}>
              {addMovementMutation.isPending ? 'Adding...' : 'Add Movement'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddMovementDialog;
