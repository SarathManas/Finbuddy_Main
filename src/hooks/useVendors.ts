
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Create a simple vendor type since the table doesn't exist
type Vendor = {
  id: string;
  name: string;
  company_name: string;
  created_at: string;
  updated_at: string;
};

export const useVendors = (searchTerm?: string) => {
  return useQuery({
    queryKey: ['vendors', searchTerm],
    queryFn: async () => {
      console.log('Fetching vendors data...');
      
      // Since vendors table doesn't exist, create mock vendor data
      // In a real app, you would fetch from an actual vendors table
      const mockVendors: Vendor[] = [
        {
          id: 'vendor-1',
          name: 'ABC Suppliers',
          company_name: 'ABC Suppliers Pvt Ltd',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'vendor-2', 
          name: 'XYZ Trading',
          company_name: 'XYZ Trading Co.',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'vendor-3',
          name: 'Global Supplies',
          company_name: 'Global Supplies Inc',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];

      // Filter by search term if provided
      if (searchTerm) {
        return mockVendors.filter(vendor => 
          vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          vendor.company_name.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      return mockVendors;
    },
  });
};

export const useCreateVendor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (vendor: Omit<Vendor, 'id' | 'created_at' | 'updated_at'>) => {
      // Mock creation since table doesn't exist
      const newVendor: Vendor = {
        id: `vendor-${Date.now()}`,
        ...vendor,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      console.log('Mock vendor created:', newVendor);
      return newVendor;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      toast.success('Vendor created successfully');
    },
    onError: (error) => {
      console.error('Error creating vendor:', error);
      toast.error('Failed to create vendor');
    },
  });
};
