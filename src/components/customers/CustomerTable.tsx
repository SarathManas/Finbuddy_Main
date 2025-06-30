
import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  ArrowUpDown,
  Eye
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { Tables } from '@/integrations/supabase/types';

type Customer = Tables<'customers'>;

interface CustomerTableProps {
  customers: Customer[];
  isLoading?: boolean;
  selectedCustomers: string[];
  onSelectCustomer: (customerId: string) => void;
  onSelectAll: (checked: boolean) => void;
  onView: (customer: Customer) => void;
  onEdit: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
  sortConfig: {
    key: keyof Customer | null;
    direction: 'asc' | 'desc';
  };
  onSort: (key: keyof Customer) => void;
}

const CustomerTable = ({
  customers,
  isLoading,
  selectedCustomers,
  onSelectCustomer,
  onSelectAll,
  onView,
  onEdit,
  onDelete,
  sortConfig,
  onSort,
}: CustomerTableProps) => {
  const getSortIcon = (key: keyof Customer) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'asc' ? '↑' : '↓';
    }
    return null;
  };

  const allSelected = customers.length > 0 && selectedCustomers.length === customers.length;
  const someSelected = selectedCustomers.length > 0;

  if (isLoading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12"></TableHead>
              <TableHead className="font-semibold">S.No</TableHead>
              <TableHead className="font-semibold">Customer Name</TableHead>
              <TableHead className="font-semibold">Location</TableHead>
              <TableHead className="font-semibold">GSTIN</TableHead>
              <TableHead className="font-semibold">Balance</TableHead>
              <TableHead className="w-12 font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                <TableCell><div className="h-4 w-4 bg-muted rounded animate-pulse" /></TableCell>
                <TableCell><div className="h-4 w-12 bg-muted rounded animate-pulse" /></TableCell>
                <TableCell><div className="h-4 w-32 bg-muted rounded animate-pulse" /></TableCell>
                <TableCell><div className="h-4 w-28 bg-muted rounded animate-pulse" /></TableCell>
                <TableCell><div className="h-4 w-24 bg-muted rounded animate-pulse" /></TableCell>
                <TableCell><div className="h-4 w-20 bg-muted rounded animate-pulse" /></TableCell>
                <TableCell><div className="h-4 w-8 bg-muted rounded animate-pulse" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={allSelected}
                onCheckedChange={onSelectAll}
              />
            </TableHead>
            <TableHead className="w-16 font-semibold">S.No</TableHead>
            <TableHead className="font-semibold">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSort('name')}
                className="h-auto p-0 font-semibold"
              >
                Customer Name
                <ArrowUpDown className="ml-2 h-4 w-4" />
                {getSortIcon('name')}
              </Button>
            </TableHead>
            <TableHead className="font-semibold">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSort('place')}
                className="h-auto p-0 font-semibold"
              >
                Location
                <ArrowUpDown className="ml-2 h-4 w-4" />
                {getSortIcon('place')}
              </Button>
            </TableHead>
            <TableHead className="font-semibold">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSort('gstin')}
                className="h-auto p-0 font-semibold"
              >
                GSTIN
                <ArrowUpDown className="ml-2 h-4 w-4" />
                {getSortIcon('gstin')}
              </Button>
            </TableHead>
            <TableHead className="font-semibold">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSort('balance')}
                className="h-auto p-0 font-semibold"
              >
                Balance
                <ArrowUpDown className="ml-2 h-4 w-4" />
                {getSortIcon('balance')}
              </Button>
            </TableHead>
            <TableHead className="w-12 font-semibold">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                No customers found. Create your first customer to get started.
              </TableCell>
            </TableRow>
          ) : (
            customers.map((customer, index) => (
              <TableRow key={customer.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedCustomers.includes(customer.id)}
                    onCheckedChange={() => onSelectCustomer(customer.id)}
                  />
                </TableCell>
                <TableCell className="font-medium">
                  {index + 1}
                </TableCell>
                <TableCell className="font-medium">
                  {customer.name}
                </TableCell>
                <TableCell>
                  {customer.place && customer.state ? (
                    <span>{customer.place}, {customer.state}</span>
                  ) : customer.place ? (
                    <span>{customer.place}</span>
                  ) : customer.state ? (
                    <span>{customer.state}</span>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  {customer.gstin ? (
                    <span className="font-mono text-sm">{customer.gstin}</span>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <span className={`font-medium ${
                    customer.balance && customer.balance > 0 
                      ? 'text-green-600' 
                      : customer.balance && customer.balance < 0 
                      ? 'text-red-600' 
                      : 'text-muted-foreground'
                  }`}>
                    {customer.balance ? `₹${customer.balance.toLocaleString()}` : '₹0'}
                  </span>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onView(customer)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEdit(customer)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => onDelete(customer)}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default CustomerTable;
