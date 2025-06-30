
import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';

interface InlineNumberEditProps {
  value: number | string;
  onSave: (value: number) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  formatDisplay?: (value: number) => string;
  min?: number;
  max?: number;
  step?: number;
}

const InlineNumberEdit = ({ 
  value, 
  onSave, 
  placeholder = "Enter amount", 
  disabled = false,
  className = "",
  formatDisplay,
  min,
  max,
  step = 0.01
}: InlineNumberEditProps) => {
  const [editValue, setEditValue] = useState(String(value));
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEditValue(String(value));
    setHasError(false);
    setErrorMessage('');
  }, [value]);

  const validateNumber = (inputValue: string): { isValid: boolean; number: number; error: string } => {
    const trimmedValue = inputValue.trim();
    
    if (trimmedValue === '') {
      return { isValid: false, number: 0, error: 'Value cannot be empty' };
    }

    const numValue = parseFloat(trimmedValue);
    
    if (isNaN(numValue)) {
      return { isValid: false, number: 0, error: 'Please enter a valid number' };
    }

    if (min !== undefined && numValue < min) {
      return { isValid: false, number: numValue, error: `Value must be at least ${min}` };
    }

    if (max !== undefined && numValue > max) {
      return { isValid: false, number: numValue, error: `Value must be at most ${max}` };
    }

    return { isValid: true, number: numValue, error: '' };
  };

  const handleSave = async () => {
    const validation = validateNumber(editValue);
    
    if (!validation.isValid) {
      setHasError(true);
      setErrorMessage(validation.error);
      return;
    }

    if (validation.number !== Number(value) && !isLoading) {
      setIsLoading(true);
      setHasError(false);
      setErrorMessage('');
      
      try {
        await onSave(validation.number);
      } catch (error) {
        console.error('Error saving number:', error);
        setHasError(true);
        setErrorMessage('Failed to save. Please try again.');
        setEditValue(String(value)); // Reset to original value on error
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleReset = () => {
    setEditValue(String(value));
    setHasError(false);
    setErrorMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
      inputRef.current?.blur();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleReset();
      inputRef.current?.blur();
    }
  };

  const handleBlur = () => {
    if (!hasError) {
      handleSave();
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    // Select all text when focused for easier editing
    e.target.select();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setEditValue(newValue);
    
    // Clear error state when user starts typing
    if (hasError) {
      setHasError(false);
      setErrorMessage('');
    }
  };

  return (
    <div className={`inline-edit-container ${className}`}>
      <Input
        ref={inputRef}
        type="number"
        value={editValue}
        onChange={handleChange}
        onKeyDown={handleKeyPress}
        onBlur={handleBlur}
        onFocus={handleFocus}
        placeholder={placeholder}
        disabled={disabled || isLoading}
        min={min}
        max={max}
        step={step}
        className={`inline-edit-input ${hasError ? 'border-red-500' : ''} ${isLoading ? 'opacity-50' : ''} ${className}`}
        title={hasError ? errorMessage : undefined}
        style={{
          color: 'inherit'
        }}
      />
    </div>
  );
};

export default InlineNumberEdit;
