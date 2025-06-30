
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Plus, Trash2 } from 'lucide-react';

interface CustomerSearchAndActionsProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onAddCustomer: () => void;
  selectedCount: number;
  onDeleteSelected: () => void;
}

const CustomerSearchAndActions = ({
  searchTerm,
  onSearchChange,
  onAddCustomer,
  selectedCount,
  onDeleteSelected,
}: CustomerSearchAndActionsProps) => {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search customers by name, email, or company..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        {selectedCount > 0 && (
          <Button
            variant="destructive"
            size="sm"
            onClick={onDeleteSelected}
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Delete {selectedCount} selected
          </Button>
        )}
      </div>
      <Button onClick={onAddCustomer} className="flex items-center gap-2">
        <Plus className="h-4 w-4" />
        Add Customer
      </Button>
    </div>
  );
};

export default CustomerSearchAndActions;
