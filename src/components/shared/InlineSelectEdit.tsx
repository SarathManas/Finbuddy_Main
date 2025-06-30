
import React, { useState, useEffect, useRef } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface InlineSelectEditProps {
  value: string;
  onSave: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  allowEmpty?: boolean;
}

const InlineSelectEdit = ({ 
  value, 
  onSave, 
  options,
  placeholder = "Select option", 
  disabled = false,
  className = "",
  allowEmpty = false
}: InlineSelectEditProps) => {
  const NONE_VALUE = "__none__";
  const [editValue, setEditValue] = useState(value || (allowEmpty ? NONE_VALUE : ''));
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Convert empty string to NONE_VALUE for internal state
    setEditValue(value || (allowEmpty ? NONE_VALUE : ''));
    setHasError(false);
    setErrorMessage('');
  }, [value, allowEmpty]);

  const validateSelection = (selectedValue: string): { isValid: boolean; error: string } => {
    if (!allowEmpty && (!selectedValue.trim() || selectedValue === NONE_VALUE)) {
      return { isValid: false, error: 'Please select an option' };
    }

    if (selectedValue && selectedValue !== NONE_VALUE && !options.some(option => option.value === selectedValue)) {
      return { isValid: false, error: 'Invalid option selected' };
    }

    return { isValid: true, error: '' };
  };

  const handleSave = async (newValue: string) => {
    const validation = validateSelection(newValue);
    
    if (!validation.isValid) {
      setHasError(true);
      setErrorMessage(validation.error);
      return;
    }

    // Convert NONE_VALUE back to empty string when saving
    const valueToSave = newValue === NONE_VALUE ? '' : newValue;
    
    if (valueToSave !== value && !isLoading) {
      setIsLoading(true);
      setHasError(false);
      setErrorMessage('');
      
      try {
        await onSave(valueToSave);
      } catch (error) {
        console.error('Error saving selection:', error);
        setHasError(true);
        setErrorMessage('Failed to save. Please try again.');
        setEditValue(value || (allowEmpty ? NONE_VALUE : '')); // Reset to original value on error
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleReset = () => {
    setEditValue(value || (allowEmpty ? NONE_VALUE : ''));
    setHasError(false);
    setErrorMessage('');
  };

  const handleValueChange = (newValue: string) => {
    setEditValue(newValue);
    
    // Clear error state when user makes a selection
    if (hasError) {
      setHasError(false);
      setErrorMessage('');
    }
    
    // Auto-save immediately when selection changes
    handleSave(newValue);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      handleReset();
      setIsOpen(false);
      selectRef.current?.blur();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      setIsOpen(!isOpen);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
  };

  const getDisplayValue = () => {
    if (editValue === NONE_VALUE) {
      return '';
    }
    return editValue;
  };

  const getDisplayLabel = () => {
    if (editValue === NONE_VALUE) {
      return 'None';
    }
    const option = options.find(option => option.value === editValue);
    return option?.label || editValue;
  };

  return (
    <div className={`inline-edit-container ${className}`}>
      <Select 
        value={editValue} 
        onValueChange={handleValueChange}
        onOpenChange={handleOpenChange}
        open={isOpen}
        disabled={disabled || isLoading}
      >
        <SelectTrigger 
          ref={selectRef}
          className={`inline-edit-select ${hasError ? 'border-red-500' : ''} ${isLoading ? 'opacity-50' : ''}`}
          onKeyDown={handleKeyPress}
          title={hasError ? errorMessage : undefined}
        >
          <SelectValue placeholder={placeholder}>
            {editValue ? (
              <span className="text-table-cell truncate max-w-full">
                {getDisplayLabel()}
              </span>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="inline-edit-select-content">
          {allowEmpty && (
            <SelectItem value={NONE_VALUE}>
              <span className="text-helper italic">None</span>
            </SelectItem>
          )}
          {options.map((option) => (
            <SelectItem 
              key={option.value} 
              value={option.value}
              className="inline-edit-select-item"
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default InlineSelectEdit;
