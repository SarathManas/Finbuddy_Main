
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, TrendingUp, TrendingDown, Activity } from 'lucide-react';

interface FilterSummaryProps {
  searchTerm: string;
  minAmount: string;
  maxAmount: string;
  performanceFilter: string;
  transactionVolumeFilter: string;
  selectedCategories: string[];
  onRemoveFilter: (filterType: string, value?: string) => void;
  totalResults: number;
  totalCategories: number;
}

const FilterSummary = ({
  searchTerm,
  minAmount,
  maxAmount,
  performanceFilter,
  transactionVolumeFilter,
  selectedCategories,
  onRemoveFilter,
  totalResults,
  totalCategories,
}: FilterSummaryProps) => {
  const activeFilters = [];

  if (searchTerm) {
    activeFilters.push({
      type: 'search',
      label: `Search: "${searchTerm}"`,
      value: searchTerm,
    });
  }

  if (minAmount || maxAmount) {
    const rangeLabel = `Amount: ${minAmount || '0'} - ${maxAmount || '∞'}`;
    activeFilters.push({
      type: 'amount',
      label: rangeLabel,
    });
  }

  if (performanceFilter && performanceFilter !== 'all') {
    const icon = performanceFilter === 'positive' ? TrendingUp : TrendingDown;
    activeFilters.push({
      type: 'performance',
      label: `Performance: ${performanceFilter}`,
      icon,
    });
  }

  if (transactionVolumeFilter && transactionVolumeFilter !== 'all') {
    activeFilters.push({
      type: 'transactionVolume',
      label: `Volume: ${transactionVolumeFilter}`,
      icon: Activity,
    });
  }

  if (selectedCategories.length > 0 && selectedCategories.length < totalCategories) {
    activeFilters.push({
      type: 'categories',
      label: `Categories: ${selectedCategories.length} selected`,
    });
  }

  if (activeFilters.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Active Filters:</span>
          <span className="text-sm text-muted-foreground">
            Showing {totalResults} of {totalCategories} categories
          </span>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {activeFilters.map((filter, index) => {
          const IconComponent = filter.icon;
          return (
            <Badge key={index} variant="secondary" className="flex items-center gap-2">
              {IconComponent && <IconComponent className="h-3 w-3" />}
              {filter.label}
              <Button
                variant="ghost"
                size="sm"
                className="h-auto w-auto p-0 ml-2"
                onClick={() => onRemoveFilter(filter.type, filter.value)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          );
        })}
      </div>
    </div>
  );
};

export default FilterSummary;
