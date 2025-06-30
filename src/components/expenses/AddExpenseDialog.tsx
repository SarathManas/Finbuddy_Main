
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';
import { LucideIcon, Fuel, Users, Zap, Building2, Wifi, Wrench, Package, Plane, Car, Coffee, ShoppingCart, Phone, Monitor, FileText } from 'lucide-react';

interface AddExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddExpense: (expense: ExpenseCategory) => void;
}

export interface ExpenseCategory {
  title: string;
  amount: number;
  description: string;
  transactions: number;
  percentage: number;
  icon: LucideIcon;
  isPositive?: boolean;
}

interface FormData {
  title: string;
  description: string;
  amount: string;
}

const availableIcons = [
  { name: 'Fuel', icon: Fuel },
  { name: 'Users', icon: Users },
  { name: 'Zap', icon: Zap },
  { name: 'Building2', icon: Building2 },
  { name: 'Wifi', icon: Wifi },
  { name: 'Wrench', icon: Wrench },
  { name: 'Package', icon: Package },
  { name: 'Plane', icon: Plane },
  { name: 'Car', icon: Car },
  { name: 'Coffee', icon: Coffee },
  { name: 'ShoppingCart', icon: ShoppingCart },
  { name: 'Phone', icon: Phone },
  { name: 'Monitor', icon: Monitor },
  { name: 'FileText', icon: FileText },
];

const AddExpenseDialog = ({ open, onOpenChange, onAddExpense }: AddExpenseDialogProps) => {
  const [selectedIcon, setSelectedIcon] = useState(availableIcons[0]);
  const { toast } = useToast();
  
  const form = useForm<FormData>({
    defaultValues: {
      title: '',
      description: '',
      amount: '',
    },
  });

  const onSubmit = (data: FormData) => {
    const amount = parseFloat(data.amount);
    
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount greater than 0",
        variant: "destructive",
      });
      return;
    }

    const newExpense: ExpenseCategory = {
      title: data.title,
      amount: amount,
      description: data.description,
      transactions: 1,
      percentage: 0,
      icon: selectedIcon.icon,
      isPositive: true,
    };

    onAddExpense(newExpense);
    form.reset();
    setSelectedIcon(availableIcons[0]);
    onOpenChange(false);
    
    toast({
      title: "Expense Added",
      description: `${data.title} has been added to your expense categories.`,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Expense Category</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              rules={{ required: "Title is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Office Supplies" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              rules={{ required: "Description is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="Brief description of the expense category" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              rules={{ required: "Amount is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount (₹)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <Label>Select Icon</Label>
              <div className="grid grid-cols-4 gap-2">
                {availableIcons.map((iconOption) => {
                  const IconComponent = iconOption.icon;
                  return (
                    <button
                      key={iconOption.name}
                      type="button"
                      onClick={() => setSelectedIcon(iconOption)}
                      className={`p-3 rounded-lg border-2 transition-colors ${
                        selectedIcon.name === iconOption.name
                          ? 'border-primary bg-primary/10'
                          : 'border-muted hover:border-primary/50'
                      }`}
                    >
                      <IconComponent className="h-5 w-5 mx-auto" />
                    </button>
                  );
                })}
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">Add Expense</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddExpenseDialog;
