
import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChartOfAccount } from '@/hooks/useBankTransactions';
import InlineCreateAccountDialog from './InlineCreateAccountDialog';

interface InlineAccountSelectProps {
  currentCategory?: string;
  accounts: ChartOfAccount[];
  onCategoryChange: (category: string) => void;
  onCreateAccount?: (accountData: {
    account_name: string;
    account_type: 'asset' | 'liability' | 'equity' | 'income' | 'expense';
    account_subtype?: string;
    opening_balance?: number;
  }) => void;
  disabled?: boolean;
  showSelectOption?: boolean;
  isCreatingAccount?: boolean;
}

const InlineAccountSelect = ({
  currentCategory,
  accounts,
  onCategoryChange,
  onCreateAccount,
  disabled = false,
  showSelectOption = false,
  isCreatingAccount = false
}: InlineAccountSelectProps) => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const UNCATEGORIZED_VALUE = "__uncategorized__";
  const CREATE_NEW_VALUE = "__create_new__";

  const getAccountName = (categoryId: string) => {
    if (categoryId === UNCATEGORIZED_VALUE) {
      return 'Select Account';
    }
    
    if (categoryId === CREATE_NEW_VALUE) {
      return 'Create New Account...';
    }
    
    const account = accounts.find(a => a.id === categoryId || a.account_name === categoryId);
    return account?.account_name || categoryId || 'Uncategorized';
  };

  const handleValueChange = (value: string) => {
    if (value === CREATE_NEW_VALUE) {
      setShowCreateDialog(true);
      return;
    }
    
    // If the special uncategorized value is selected, pass empty string to parent
    if (value === UNCATEGORIZED_VALUE) {
      onCategoryChange('');
    } else {
      // Find the account and use its account_name
      const account = accounts.find(a => a.id === value);
      onCategoryChange(account?.account_name || value);
    }
  };

  const handleCreateAccount = (accountData: {
    account_name: string;
    account_type: 'asset' | 'liability' | 'equity' | 'income' | 'expense';
    account_subtype?: string;
    opening_balance?: number;
  }) => {
    if (onCreateAccount) {
      onCreateAccount(accountData);
      // After creating the account, select it
      onCategoryChange(accountData.account_name);
    }
    setShowCreateDialog(false);
  };

  // If no category is set (uncategorized), show the select dropdown
  if (!currentCategory || currentCategory.trim() === '') {
    return (
      <>
        <Select value="" onValueChange={handleValueChange} disabled={disabled}>
          <SelectTrigger className="w-[120px] sm:w-[150px] h-auto p-1 border-none bg-transparent shadow-none">
            <SelectValue placeholder="Select account" />
          </SelectTrigger>
          <SelectContent>
            {accounts.map((account) => (
              <SelectItem key={account.id} value={account.id}>
                <span className="text-table-cell">{account.account_name}</span>
              </SelectItem>
            ))}
            {onCreateAccount && (
              <SelectItem value={CREATE_NEW_VALUE}>
                <span className="text-blue-600 font-medium">+ Create New Account...</span>
              </SelectItem>
            )}
          </SelectContent>
        </Select>
        
        {onCreateAccount && (
          <InlineCreateAccountDialog
            open={showCreateDialog}
            onOpenChange={setShowCreateDialog}
            onCreateAccount={handleCreateAccount}
            isCreating={isCreatingAccount}
          />
        )}
      </>
    );
  }

  // If transaction has a category and is not disabled, show editable select
  if (!disabled) {
    // Find the current account by account_name
    const currentAccount = accounts.find(a => a.account_name === currentCategory);
    const currentValue = currentAccount?.id || currentCategory;

    return (
      <>
        <Select value={currentValue} onValueChange={handleValueChange}>
          <SelectTrigger className="w-[120px] sm:w-[150px] h-auto p-1 border-none bg-transparent shadow-none">
            <SelectValue>
              <span className="text-table-cell truncate max-w-full">
                {getAccountName(currentCategory)}
              </span>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {showSelectOption && (
              <SelectItem value={UNCATEGORIZED_VALUE}>
                <span className="text-helper">Remove Category</span>
              </SelectItem>
            )}
            {accounts.map((account) => (
              <SelectItem key={account.id} value={account.id}>
                <span className="text-table-cell">{account.account_name}</span>
              </SelectItem>
            ))}
            {onCreateAccount && (
              <SelectItem value={CREATE_NEW_VALUE}>
                <span className="text-blue-600 font-medium">+ Create New Account...</span>
              </SelectItem>
            )}
          </SelectContent>
        </Select>
        
        {onCreateAccount && (
          <InlineCreateAccountDialog
            open={showCreateDialog}
            onOpenChange={setShowCreateDialog}
            onCreateAccount={handleCreateAccount}
            isCreating={isCreatingAccount}
          />
        )}
      </>
    );
  }

  // If disabled (read-only), show as text
  return (
    <span 
      className="text-table-cell truncate max-w-[120px] sm:max-w-[150px] block" 
      title={getAccountName(currentCategory)}
    >
      {getAccountName(currentCategory)}
    </span>
  );
};

export default InlineAccountSelect;
