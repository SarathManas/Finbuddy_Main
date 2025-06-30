
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TransactionCategory } from '@/hooks/useBankTransactions';

interface InlineCategorySelectProps {
  currentCategory?: string;
  categories: TransactionCategory[];
  onCategoryChange: (category: string) => void;
  disabled?: boolean;
  showSelectOption?: boolean;
}

const InlineCategorySelect = ({
  currentCategory,
  categories,
  onCategoryChange,
  disabled = false,
  showSelectOption = false
}: InlineCategorySelectProps) => {
  const UNCATEGORIZED_VALUE = "__uncategorized__";

  const getCategoryName = (categoryId: string) => {
    if (categoryId === UNCATEGORIZED_VALUE) {
      return 'Select Category';
    }
    
    const category = categories.find(c => c.id === categoryId || c.name === categoryId);
    return category?.name || categoryId || 'Uncategorized';
  };

  const handleValueChange = (value: string) => {
    // If the special uncategorized value is selected, pass empty string to parent
    if (value === UNCATEGORIZED_VALUE) {
      onCategoryChange('');
    } else {
      onCategoryChange(value);
    }
  };

  // If no category is set (uncategorized), show the select dropdown
  if (!currentCategory || currentCategory.trim() === '') {
    return (
      <Select value="" onValueChange={handleValueChange} disabled={disabled}>
        <SelectTrigger className="w-[120px] sm:w-[150px] h-auto p-1 border-none bg-transparent shadow-none">
          <SelectValue placeholder="Select category" />
        </SelectTrigger>
        <SelectContent>
          {categories.map((category) => (
            <SelectItem key={category.id} value={category.name}>
              <span className="text-table-cell">{category.name}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  // If transaction has a category and is not disabled, show editable select
  if (!disabled) {
    return (
      <Select value={currentCategory} onValueChange={handleValueChange}>
        <SelectTrigger className="w-[120px] sm:w-[150px] h-auto p-1 border-none bg-transparent shadow-none">
          <SelectValue>
            <span className="text-table-cell truncate max-w-full">
              {getCategoryName(currentCategory)}
            </span>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {showSelectOption && (
            <SelectItem value={UNCATEGORIZED_VALUE}>
              <span className="text-helper">Remove Category</span>
            </SelectItem>
          )}
          {categories.map((category) => (
            <SelectItem key={category.id} value={category.name}>
              <span className="text-table-cell">{category.name}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  // If disabled (read-only), show as text
  return (
    <span 
      className="text-table-cell truncate max-w-[120px] sm:max-w-[150px] block" 
      title={getCategoryName(currentCategory)}
    >
      {getCategoryName(currentCategory)}
    </span>
  );
};

export default InlineCategorySelect;
