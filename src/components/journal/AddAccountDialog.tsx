
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { ChartOfAccount } from '@/hooks/useJournalEntries';

interface AddAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
  accounts: ChartOfAccount[];
  isLoading: boolean;
}

interface FormData {
  account_name: string;
  account_type: string;
  account_subtype: string;
  parent_account_id?: string;
  opening_balance: number;
}

const AddAccountDialog = ({
  open,
  onOpenChange,
  onSubmit,
  accounts,
  isLoading
}: AddAccountDialogProps) => {
  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<FormData>({
    defaultValues: {
      opening_balance: 0
    }
  });

  const selectedAccountType = watch('account_type');

  const accountTypes = [
    { value: 'asset', label: 'Asset' },
    { value: 'liability', label: 'Liability' },
    { value: 'equity', label: 'Equity' },
    { value: 'income', label: 'Income' },
    { value: 'expense', label: 'Expense' }
  ];

  const accountSubtypes = {
    asset: [
      { value: 'Current Assets', label: 'Current Assets' },
      { value: 'Fixed Assets', label: 'Fixed Assets' },
      { value: 'Investments', label: 'Investments' },
      { value: 'Intangible Assets', label: 'Intangible Assets' },
      { value: 'Other Assets', label: 'Other Assets' }
    ],
    liability: [
      { value: 'Current Liabilities', label: 'Current Liabilities' },
      { value: 'Long-term Liabilities', label: 'Long-term Liabilities' },
      { value: 'Provisions', label: 'Provisions' },
      { value: 'Other Liabilities', label: 'Other Liabilities' }
    ],
    equity: [
      { value: 'Share Capital', label: 'Share Capital' },
      { value: 'Reserves and Surplus', label: 'Reserves and Surplus' },
      { value: 'Retained Earnings', label: 'Retained Earnings' },
      { value: 'Other Equity', label: 'Other Equity' }
    ],
    income: [
      { value: 'Revenue from Operations', label: 'Revenue from Operations' },
      { value: 'Other Income', label: 'Other Income' },
      { value: 'Interest Income', label: 'Interest Income' },
      { value: 'Dividend Income', label: 'Dividend Income' }
    ],
    expense: [
      { value: 'Cost of Goods Sold', label: 'Cost of Goods Sold' },
      { value: 'Operating Expenses', label: 'Operating Expenses' },
      { value: 'Administrative Expenses', label: 'Administrative Expenses' },
      { value: 'Selling Expenses', label: 'Selling Expenses' },
      { value: 'Finance Costs', label: 'Finance Costs' },
      { value: 'Other Expenses', label: 'Other Expenses' }
    ]
  };

  const getSubtypeOptions = () => {
    if (!selectedAccountType) return [];
    return accountSubtypes[selectedAccountType as keyof typeof accountSubtypes] || [];
  };

  const handleFormSubmit = (data: FormData) => {
    onSubmit({
      ...data,
      parent_account_id: data.parent_account_id || null,
      opening_balance: Number(data.opening_balance)
    });
    reset();
  };

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  const handleAccountTypeChange = (value: string) => {
    setValue('account_type', value);
    // Reset subtype when account type changes
    setValue('account_subtype', '');
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Account</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="account_name">Account Name *</Label>
            <Input
              id="account_name"
              {...register('account_name', { required: 'Account name is required' })}
              placeholder="e.g., Petty Cash"
            />
            {errors.account_name && (
              <p className="text-sm text-destructive">{errors.account_name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="account_type">Account Type *</Label>
            <Select onValueChange={handleAccountTypeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select account type" />
              </SelectTrigger>
              <SelectContent>
                {accountTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.account_type && (
              <p className="text-sm text-destructive">{errors.account_type.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="account_subtype">Account Subtype</Label>
            <Select 
              onValueChange={(value) => setValue('account_subtype', value)}
              disabled={!selectedAccountType}
            >
              <SelectTrigger>
                <SelectValue placeholder={
                  selectedAccountType 
                    ? "Select account subtype" 
                    : "Select account type first"
                } />
              </SelectTrigger>
              <SelectContent>
                {getSubtypeOptions().map((subtype) => (
                  <SelectItem key={subtype.value} value={subtype.value}>
                    {subtype.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="parent_account_id">Parent Account (Optional)</Label>
            <Select onValueChange={(value) => setValue('parent_account_id', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select parent account" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.account_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="opening_balance">Opening Balance</Label>
            <Input
              id="opening_balance"
              type="number"
              step="0.01"
              {...register('opening_balance', { 
                valueAsNumber: true,
                min: { value: 0, message: 'Opening balance cannot be negative' }
              })}
              placeholder="0.00"
            />
            {errors.opening_balance && (
              <p className="text-sm text-destructive">{errors.opening_balance.message}</p>
            )}
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Account'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddAccountDialog;
