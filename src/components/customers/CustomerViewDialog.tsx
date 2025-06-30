
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Mail, Phone, MapPin, CreditCard, Calendar, Hash, User } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';

type Customer = Tables<'customers'>;

interface CustomerViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: Customer | null;
}

const CustomerViewDialog = ({ open, onOpenChange, customer }: CustomerViewDialogProps) => {
  if (!customer) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatBalance = (balance: number | null) => {
    if (balance === null || balance === 0) return '₹0';
    const formatted = `₹${Math.abs(balance).toLocaleString()}`;
    return balance < 0 ? `-${formatted}` : formatted;
  };

  const getBalanceColor = (balance: number | null) => {
    if (!balance || balance === 0) return 'text-muted-foreground';
    return balance > 0 ? 'text-green-600' : 'text-red-600';
  };

  const getDisplayName = () => {
    return customer.legal_name || customer.name;
  };

  const getInvoicePhone = () => {
    return customer.phone_number || customer.phone;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Customer Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-3">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Display Name</label>
                  <p className="text-base font-medium">{customer.name}</p>
                </div>
                {customer.legal_name && customer.legal_name !== customer.name && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Legal Name</label>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <p className="text-base">{customer.legal_name}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Contact Information */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <p className="text-base">{customer.email}</p>
                  </div>
                </div>
                {customer.phone && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Phone (General)</label>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <p className="text-base">{customer.phone}</p>
                    </div>
                  </div>
                )}
                {customer.phone_number && customer.phone_number !== customer.phone && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Phone (Invoices)</label>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <p className="text-base">{customer.phone_number}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Address Information */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Address Information</h3>
              {customer.address && (
                <div className="space-y-2 mb-4">
                  <label className="text-sm font-medium text-muted-foreground">Street Address</label>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                    <p className="text-base">{customer.address}</p>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {customer.place && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">City/Place</label>
                    <p className="text-base">{customer.place}</p>
                  </div>
                )}
                {customer.state && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">State</label>
                    <p className="text-base">{customer.state}</p>
                  </div>
                )}
                {customer.pincode && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">PIN Code</label>
                    <p className="text-base font-mono">{customer.pincode}</p>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Business Information */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Business Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {customer.gstin && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">GSTIN</label>
                    <div className="flex items-center gap-2">
                      <Hash className="h-4 w-4 text-muted-foreground" />
                      <p className="text-base font-mono">{customer.gstin}</p>
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Current Balance</label>
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <p className={`text-base font-semibold ${getBalanceColor(customer.balance)}`}>
                      {formatBalance(customer.balance)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Invoice Preview */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Invoice Information Preview</h3>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800 mb-2">This is how this customer will appear on invoices:</p>
                <div className="space-y-1">
                  <p className="font-medium">{getDisplayName()}</p>
                  {getInvoicePhone() && <p className="text-sm">Phone: {getInvoicePhone()}</p>}
                  {customer.gstin && <p className="text-sm font-mono">GSTIN: {customer.gstin}</p>}
                </div>
              </div>
            </div>

            <Separator />

            {/* Account Information */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Account Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Customer ID</label>
                  <p className="text-sm font-mono text-muted-foreground">{customer.id}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Created</label>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">{formatDate(customer.created_at)}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">{formatDate(customer.updated_at)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CustomerViewDialog;
