
import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { format, parseISO, isValid } from 'date-fns';

interface InlineDateEditProps {
  value: string;
  onSave: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  min?: string;
  max?: string;
}

const InlineDateEdit = ({ 
  value, 
  onSave, 
  placeholder = "Select date", 
  disabled = false,
  className = "",
  min,
  max
}: InlineDateEditProps) => {
  const [editValue, setEditValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Format date for input[type="date"] (YYYY-MM-DD)
  const formatDateForInput = (dateString: string): string => {
    if (!dateString) return '';
    
    try {
      const date = parseISO(dateString);
      if (isValid(date)) {
        return format(date, 'yyyy-MM-dd');
      }
      
      // Try parsing as a different format
      const parsedDate = new Date(dateString);
      if (isValid(parsedDate)) {
        return format(parsedDate, 'yyyy-MM-dd');
      }
    } catch (error) {
      console.error('Error formatting date:', error);
    }
    
    return '';
  };

  useEffect(() => {
    const formattedDate = formatDateForInput(value);
    setEditValue(formattedDate);
    setHasError(false);
    setErrorMessage('');
  }, [value]);

  const validateDate = (dateString: string): { isValid: boolean; error: string } => {
    if (!dateString.trim()) {
      return { isValid: false, error: 'Date cannot be empty' };
    }

    try {
      const inputDate = new Date(dateString);
      
      if (!isValid(inputDate)) {
        return { isValid: false, error: 'Please enter a valid date' };
      }

      if (min) {
        const minDate = new Date(min);
        if (inputDate < minDate) {
          return { isValid: false, error: `Date must be after ${format(minDate, 'MMM dd, yyyy')}` };
        }
      }

      if (max) {
        const maxDate = new Date(max);
        if (inputDate > maxDate) {
          return { isValid: false, error: `Date must be before ${format(maxDate, 'MMM dd, yyyy')}` };
        }
      }

      return { isValid: true, error: '' };
    } catch (error) {
      return { isValid: false, error: 'Please enter a valid date' };
    }
  };

  const handleSave = async () => {
    const validation = validateDate(editValue);
    
    if (!validation.isValid) {
      setHasError(true);
      setErrorMessage(validation.error);
      return;
    }

    // Compare the actual date values, not string representations
    const currentFormatted = formatDateForInput(value);
    if (editValue !== currentFormatted && !isLoading) {
      setIsLoading(true);
      setHasError(false);
      setErrorMessage('');
      
      try {
        // Convert back to ISO string for storage
        const date = new Date(editValue);
        const isoString = date.toISOString().split('T')[0]; // YYYY-MM-DD format
        await onSave(isoString);
      } catch (error) {
        console.error('Error saving date:', error);
        setHasError(true);
        setErrorMessage('Failed to save. Please try again.');
        setEditValue(formatDateForInput(value)); // Reset to original value on error
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleReset = () => {
    const formattedDate = formatDateForInput(value);
    setEditValue(formattedDate);
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
        type="date"
        value={editValue}
        onChange={handleChange}
        onKeyDown={handleKeyPress}
        onBlur={handleBlur}
        onFocus={handleFocus}
        placeholder={placeholder}
        disabled={disabled || isLoading}
        min={min}
        max={max}
        className={`inline-edit-input ${hasError ? 'border-red-500' : ''} ${isLoading ? 'opacity-50' : ''}`}
        title={hasError ? errorMessage : undefined}
      />
    </div>
  );
};

export default InlineDateEdit;
