
import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';

interface InlineTextEditProps {
  value: string;
  onSave: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

const InlineTextEdit = ({ 
  value, 
  onSave, 
  placeholder = "Enter text", 
  disabled = false,
  className = ""
}: InlineTextEditProps) => {
  const [editValue, setEditValue] = useState(value);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEditValue(value);
    setHasError(false);
  }, [value]);

  const handleSave = async () => {
    if (editValue.trim() !== value.trim() && !isLoading) {
      setIsLoading(true);
      setHasError(false);
      
      try {
        await onSave(editValue.trim());
      } catch (error) {
        console.error('Error saving text:', error);
        setHasError(true);
        setEditValue(value); // Reset to original value on error
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleReset = () => {
    setEditValue(value);
    setHasError(false);
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

  return (
    <div className={`inline-edit-container ${className}`}>
      <Input
        ref={inputRef}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onKeyDown={handleKeyPress}
        onBlur={handleBlur}
        onFocus={handleFocus}
        placeholder={placeholder}
        disabled={disabled || isLoading}
        className={`inline-edit-input ${hasError ? 'border-red-500' : ''} ${isLoading ? 'opacity-50' : ''}`}
      />
    </div>
  );
};

export default InlineTextEdit;
