
import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TransactionCategory } from '@/hooks/useBankTransactions';

interface BulkCategorizeToolbarProps {
  selectedCount: number;
  categories: TransactionCategory[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onCategorizeSelected: () => void;
  isProcessing: boolean;
}

const BulkCategorizeToolbar = ({
  selectedCount,
  categories,
  selectedCategory,
  onCategoryChange,
  onSelectAll,
  onDeselectAll,
  onCategorizeSelected,
  isProcessing
}: BulkCategorizeToolbarProps) => {
  if (selectedCount === 0) {
    return (
      <Card className="mb-4">
        <CardContent className="py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <Button variant="outline" size="sm" onClick={onSelectAll} className="w-full sm:w-auto">
                Select All
              </Button>
              <span className="text-xs sm:text-sm text-muted-foreground">
                Select transactions to categorize them in bulk
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-4">
      <CardContent className="py-3 sm:py-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <Badge variant="secondary" className="text-xs w-fit">
              {selectedCount} selected
            </Badge>
            <Button variant="outline" size="sm" onClick={onDeselectAll} className="w-full sm:w-auto">
              Deselect All
            </Button>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <Select value={selectedCategory} onValueChange={onCategoryChange}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.name}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={onCategorizeSelected}
              disabled={!selectedCategory || isProcessing}
              size="sm"
              className="w-full sm:w-auto"
            >
              {isProcessing ? 'Processing...' : 'Categorize Selected'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BulkCategorizeToolbar;
