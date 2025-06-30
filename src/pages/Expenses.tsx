import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, Fuel, Users, Zap, Building2, Wifi, Wrench, Plane, Package, Filter } from 'lucide-react';
import ExpenseCategoryCard from '@/components/expenses/ExpenseCategoryCard';
import ExpenseDistributionChart from '@/components/expenses/ExpenseDistributionChart';
import MonthlyExpensesChart from '@/components/expenses/MonthlyExpensesChart';
import ExpenseFilters from '@/components/expenses/ExpenseFilters';
import FilterSummary from '@/components/expenses/FilterSummary';
import AddExpenseDialog, { ExpenseCategory } from '@/components/expenses/AddExpenseDialog';

const Expenses = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Filter states
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [performanceFilter, setPerformanceFilter] = useState('all');
  const [transactionVolumeFilter, setTransactionVolumeFilter] = useState('all');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const [expenseCategories, setExpenseCategories] = useState<ExpenseCategory[]>([
    {
      title: 'Fuel',
      amount: 45000,
      description: 'Expenses related to fuel for vehicles and transportation',
      transactions: 120,
      percentage: -5.2,
      icon: Fuel,
    },
    {
      title: 'Salaries',
      amount: 250000,
      description: 'Employee salaries and compensation',
      transactions: 48,
      percentage: 2.1,
      icon: Users,
      isPositive: true,
    },
    {
      title: 'Electricity Bill',
      amount: 32000,
      description: 'Electricity and power expenses',
      transactions: 24,
      percentage: -8.7,
      icon: Zap,
    },
    {
      title: 'Rent',
      amount: 120000,
      description: 'Office and facility rent expenses',
      transactions: 12,
      percentage: 0,
      icon: Building2,
    },
    {
      title: 'Internet & Phone',
      amount: 18500,
      description: 'Internet, phone, and communication expenses',
      transactions: 24,
      percentage: -1.5,
      icon: Wifi,
    },
    {
      title: 'Maintenance',
      amount: 35000,
      description: 'Equipment and facility maintenance',
      transactions: 42,
      percentage: 3.8,
      icon: Wrench,
      isPositive: true,
    },
    {
      title: 'Office Supplies',
      amount: 12500,
      description: 'Office supplies and stationery',
      transactions: 65,
      percentage: 1.2,
      icon: Package,
      isPositive: true,
    },
    {
      title: 'Travel',
      amount: 28000,
      description: 'Business travel expenses',
      transactions: 32,
      percentage: -12.5,
      icon: Plane,
    },
  ]);

  // Initialize selected categories to include all categories
  React.useEffect(() => {
    if (selectedCategories.length === 0) {
      setSelectedCategories(expenseCategories.map(cat => cat.title));
    }
  }, [expenseCategories, selectedCategories.length]);

  const filteredCategories = useMemo(() => {
    return expenseCategories.filter(category => {
      // Search filter
      const matchesSearch = searchTerm === '' || 
        category.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.description.toLowerCase().includes(searchTerm.toLowerCase());

      // Amount range filter
      const minAmountNum = minAmount ? parseFloat(minAmount) : 0;
      const maxAmountNum = maxAmount ? parseFloat(maxAmount) : Infinity;
      const matchesAmount = category.amount >= minAmountNum && category.amount <= maxAmountNum;

      // Performance filter
      const matchesPerformance = performanceFilter === 'all' ||
        (performanceFilter === 'positive' && (category.isPositive || category.percentage > 0)) ||
        (performanceFilter === 'negative' && !category.isPositive && category.percentage < 0);

      // Transaction volume filter
      const matchesVolume = transactionVolumeFilter === 'all' ||
        (transactionVolumeFilter === 'high' && category.transactions >= 50) ||
        (transactionVolumeFilter === 'medium' && category.transactions >= 20 && category.transactions < 50) ||
        (transactionVolumeFilter === 'low' && category.transactions < 20);

      // Category selection filter
      const matchesCategory = selectedCategories.includes(category.title);

      return matchesSearch && matchesAmount && matchesPerformance && matchesVolume && matchesCategory;
    });
  }, [expenseCategories, searchTerm, minAmount, maxAmount, performanceFilter, transactionVolumeFilter, selectedCategories]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (searchTerm) count++;
    if (minAmount || maxAmount) count++;
    if (performanceFilter !== 'all') count++;
    if (transactionVolumeFilter !== 'all') count++;
    if (selectedCategories.length > 0 && selectedCategories.length < expenseCategories.length) count++;
    return count;
  }, [searchTerm, minAmount, maxAmount, performanceFilter, transactionVolumeFilter, selectedCategories, expenseCategories.length]);

  const handleAddExpense = (newExpense: ExpenseCategory) => {
    setExpenseCategories(prev => [...prev, newExpense]);
    setSelectedCategories(prev => [...prev, newExpense.title]);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setMinAmount('');
    setMaxAmount('');
    setPerformanceFilter('all');
    setTransactionVolumeFilter('all');
    setSelectedCategories(expenseCategories.map(cat => cat.title));
  };

  const handleRemoveFilter = (filterType: string, value?: string) => {
    switch (filterType) {
      case 'search':
        setSearchTerm('');
        break;
      case 'amount':
        setMinAmount('');
        setMaxAmount('');
        break;
      case 'performance':
        setPerformanceFilter('all');
        break;
      case 'transactionVolume':
        setTransactionVolumeFilter('all');
        break;
      case 'categories':
        setSelectedCategories(expenseCategories.map(cat => cat.title));
        break;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Expense Categories</h1>
          <p className="text-muted-foreground">
            Manage your expense categories, view analytics, and forecast future expenses
          </p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Quick search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Button 
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
            {activeFiltersCount > 0 && (
              <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full ml-1">
                {activeFiltersCount}
              </span>
            )}
          </Button>
          <Button 
            className="flex items-center gap-2"
            onClick={() => setIsAddDialogOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Add Expense
          </Button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <ExpenseFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          minAmount={minAmount}
          maxAmount={maxAmount}
          onMinAmountChange={setMinAmount}
          onMaxAmountChange={setMaxAmount}
          performanceFilter={performanceFilter}
          onPerformanceFilterChange={setPerformanceFilter}
          transactionVolumeFilter={transactionVolumeFilter}
          onTransactionVolumeFilterChange={setTransactionVolumeFilter}
          selectedCategories={selectedCategories}
          onSelectedCategoriesChange={setSelectedCategories}
          availableCategories={expenseCategories}
          onResetFilters={handleResetFilters}
          activeFiltersCount={activeFiltersCount}
        />
      )}

      {/* Filter Summary */}
      <FilterSummary
        searchTerm={searchTerm}
        minAmount={minAmount}
        maxAmount={maxAmount}
        performanceFilter={performanceFilter}
        transactionVolumeFilter={transactionVolumeFilter}
        selectedCategories={selectedCategories}
        onRemoveFilter={handleRemoveFilter}
        totalResults={filteredCategories.length}
        totalCategories={expenseCategories.length}
      />

      {/* Expense Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredCategories.length > 0 ? (
          filteredCategories.map((category, index) => (
            <ExpenseCategoryCard
              key={index}
              title={category.title}
              amount={category.amount}
              description={category.description}
              transactions={category.transactions}
              percentage={category.percentage}
              icon={category.icon}
              isPositive={category.isPositive}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground text-lg mb-2">No expense categories found</p>
            <p className="text-sm text-muted-foreground">
              Try adjusting your filters or add a new expense category
            </p>
            <Button 
              className="mt-4"
              onClick={() => setIsAddDialogOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add First Expense
            </Button>
          </div>
        )}
      </div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Analytics</h2>
          <ExpenseDistributionChart />
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-4">Forecast & Trends</h2>
          <MonthlyExpensesChart />
        </div>
      </div>

      {/* Add Expense Dialog */}
      <AddExpenseDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAddExpense={handleAddExpense}
      />
    </div>
  );
};

export default Expenses;
