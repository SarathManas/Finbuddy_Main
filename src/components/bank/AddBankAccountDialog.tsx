
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm, FieldError } from 'react-hook-form';
import { BankAccount } from '@/hooks/useBankTransactions';

interface AddBankAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Omit<BankAccount, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => void;
  isLoading: boolean;
}

const AddBankAccountDialog = ({ open, onOpenChange, onSubmit, isLoading }: AddBankAccountDialogProps) => {
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm();

  const getErrorMessage = (error: FieldError | undefined, defaultMessage: string): string => {
    if (!error) return '';
    if (typeof error === 'string') return error;
    return error.message || defaultMessage;
  };

  const handleFormSubmit = (data: any) => {
    onSubmit({
      account_name: data.account_name,
      account_number: data.account_number,
      bank_name: data.bank_name,
      account_type: data.account_type,
      opening_balance: parseFloat(data.opening_balance) || 0,
      current_balance: parseFloat(data.opening_balance) || 0,
      is_active: true
    });
    reset();
  };

  const handleClose = () => {
    onOpenChange(false);
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Bank Account</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="account_name">Account Name</Label>
            <Input
              id="account_name"
              placeholder="e.g., Business Checking"
              {...register('account_name', { required: 'Account name is required' })}
            />
            {errors.account_name && (
              <p className="text-sm text-destructive">
                {getErrorMessage(errors.account_name as FieldError, 'Account name is required')}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="bank_name">Bank Name</Label>
            <Input
              id="bank_name"
              placeholder="e.g., State Bank of India"
              {...register('bank_name', { required: 'Bank name is required' })}
            />
            {errors.bank_name && (
              <p className="text-sm text-destructive">
                {getErrorMessage(errors.bank_name as FieldError, 'Bank name is required')}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="account_number">Account Number</Label>
            <Input
              id="account_number"
              placeholder="1234567890"
              {...register('account_number', { required: 'Account number is required' })}
            />
            {errors.account_number && (
              <p className="text-sm text-destructive">
                {getErrorMessage(errors.account_number as FieldError, 'Account number is required')}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="account_type">Account Type</Label>
            <Select onValueChange={(value) => setValue('account_type', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select account type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="checking">Checking</SelectItem>
                <SelectItem value="savings">Savings</SelectItem>
                <SelectItem value="business">Business</SelectItem>
                <SelectItem value="current">Current</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="opening_balance">Opening Balance (₹)</Label>
            <Input
              id="opening_balance"
              type="number"
              step="0.01"
              placeholder="0.00"
              {...register('opening_balance')}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Adding...' : 'Add Account'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddBankAccountDialog;
