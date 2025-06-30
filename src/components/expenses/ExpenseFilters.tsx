
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Search, Filter, X, TrendingUp, TrendingDown, Activity, RotateCcw } from 'lucide-react';
import { ExpenseCategory } from './AddExpenseDialog';

interface ExpenseFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  minAmount: string;
  maxAmount: string;
  onMinAmountChange: (value: string) => void;
  onMaxAmountChange: (value: string) => void;
  performanceFilter: string;
  onPerformanceFilterChange: (value: string) => void;
  transactionVolumeFilter: string;
  onTransactionVolumeFilterChange: (value: string) => void;
  selectedCategories: string[];
  onSelectedCategoriesChange: (categories: string[]) => void;
  availableCategories: ExpenseCategory[];
  onResetFilters: () => void;
  activeFiltersCount: number;
}

const ExpenseFilters = ({
  searchTerm,
  onSearchChange,
  minAmount,
  maxAmount,
  onMinAmountChange,
  onMaxAmountChange,
  performanceFilter,
  onPerformanceFilterChange,
  transactionVolumeFilter,
  onTransactionVolumeFilterChange,
  selectedCategories,
  onSelectedCategoriesChange,
  availableCategories,
  onResetFilters,
  activeFiltersCount,
}: ExpenseFiltersProps) => {
  const handleCategoryToggle = (categoryTitle: string, checked: boolean) => {
    if (checked) {
      onSelectedCategoriesChange([...selectedCategories, categoryTitle]);
    } else {
      onSelectedCategoriesChange(selectedCategories.filter(cat => cat !== categoryTitle));
    }
  };

  const handleSelectAllCategories = () => {
    if (selectedCategories.length === availableCategories.length) {
      onSelectedCategoriesChange([]);
    } else {
      onSelectedCategoriesChange(availableCategories.map(cat => cat.title));
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            <CardTitle>Filters</CardTitle>
            {activeFiltersCount > 0 && (
              <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onResetFilters}
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search */}
        <div className="space-y-2">
          <Label>Search Categories</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or description..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Amount Range */}
        <div className="space-y-2">
          <Label>Amount Range (₹)</Label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              placeholder="Min"
              value={minAmount}
              onChange={(e) => onMinAmountChange(e.target.value)}
            />
            <Input
              type="number"
              placeholder="Max"
              value={maxAmount}
              onChange={(e) => onMaxAmountChange(e.target.value)}
            />
          </div>
        </div>

        {/* Performance Filter */}
        <div className="space-y-2">
          <Label>Performance</Label>
          <ToggleGroup 
            type="single" 
            value={performanceFilter} 
            onValueChange={onPerformanceFilterChange}
            className="justify-start"
          >
            <ToggleGroupItem value="all" variant="outline" size="sm">
              All
            </ToggleGroupItem>
            <ToggleGroupItem value="positive" variant="outline" size="sm">
              <TrendingUp className="h-4 w-4 mr-1" />
              Positive
            </ToggleGroupItem>
            <ToggleGroupItem value="negative" variant="outline" size="sm">
              <TrendingDown className="h-4 w-4 mr-1" />
              Negative
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        {/* Transaction Volume */}
        <div className="space-y-2">
          <Label>Transaction Volume</Label>
          <ToggleGroup 
            type="single" 
            value={transactionVolumeFilter} 
            onValueChange={onTransactionVolumeFilterChange}
            className="justify-start"
          >
            <ToggleGroupItem value="all" variant="outline" size="sm">
              All
            </ToggleGroupItem>
            <ToggleGroupItem value="high" variant="outline" size="sm">
              <Activity className="h-4 w-4 mr-1" />
              High (50+)
            </ToggleGroupItem>
            <ToggleGroupItem value="medium" variant="outline" size="sm">
              Medium (20-49)
            </ToggleGroupItem>
            <ToggleGroupItem value="low" variant="outline" size="sm">
              Low (&lt;20)
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        {/* Category Selection */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Categories</Label>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSelectAllCategories}
              className="h-auto p-1 text-xs"
            >
              {selectedCategories.length === availableCategories.length ? 'Deselect All' : 'Select All'}
            </Button>
          </div>
          <div className="max-h-40 overflow-y-auto space-y-2">
            {availableCategories.map((category) => {
              const Icon = category.icon;
              return (
                <div key={category.title} className="flex items-center space-x-2">
                  <Checkbox
                    id={category.title}
                    checked={selectedCategories.includes(category.title)}
                    onCheckedChange={(checked) => 
                      handleCategoryToggle(category.title, checked as boolean)
                    }
                  />
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <label 
                    htmlFor={category.title} 
                    className="text-sm cursor-pointer flex-1"
                  >
                    {category.title}
                  </label>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExpenseFilters;
