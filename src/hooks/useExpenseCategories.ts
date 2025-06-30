
import { useQuery } from '@tanstack/react-query';

export const useExpenseCategories = () => {
  return useQuery({
    queryKey: ['expense-categories'],
    queryFn: async () => {
      // Return predefined expense categories
      const categories = [
        'Office Supplies',
        'Travel & Transportation',
        'Meals & Entertainment',
        'Software & Subscriptions',
        'Marketing & Advertising',
        'Professional Services',
        'Utilities',
        'Rent & Facilities',
        'Insurance',
        'Equipment & Hardware',
        'Training & Education',
        'Bank Charges',
        'Taxes & Fees',
        'Maintenance & Repairs',
        'Fuel & Vehicle Expenses',
        'Communication',
        'Miscellaneous'
      ];
      
      return categories.map((category, index) => ({
        value: category.toLowerCase().replace(/[^a-z0-9]/g, '_'),
        label: category
      }));
    },
  });
};
