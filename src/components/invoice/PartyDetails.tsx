
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, Users } from 'lucide-react';
import { useCustomers } from '@/hooks/useCustomers';

interface PartyDetailsProps {
  title: string;
  name: string;
  gstin: string;
  address: string;
  place: string;
  state: string;
  pincode: string;
  onNameChange: (value: string) => void;
  onGstinChange: (value: string) => void;
  onAddressChange: (value: string) => void;
  onPlaceChange: (value: string) => void;
  onStateChange: (value: string) => void;
  onPincodeChange: (value: string) => void;
  states: string[];
  showCustomerDropdown?: boolean;
  onCustomerSelect?: (customer: any) => void;
}

const PartyDetails = ({
  title,
  name,
  gstin,
  address,
  place,
  state,
  pincode,
  onNameChange,
  onGstinChange,
  onAddressChange,
  onPlaceChange,
  onStateChange,
  onPincodeChange,
  states,
  showCustomerDropdown = false,
  onCustomerSelect
}: PartyDetailsProps) => {
  const { data: customers = [], isLoading } = useCustomers();

  const handleCustomerSelect = (customerId: string) => {
    const selectedCustomer = customers.find(c => c.id === customerId);
    if (selectedCustomer && onCustomerSelect) {
      // Use legal_name for invoices, fallback to name
      const customerData = {
        ...selectedCustomer,
        name: selectedCustomer.legal_name || selectedCustomer.name,
        // Use the single phone field for all purposes
        phone: selectedCustomer.phone
      };
      onCustomerSelect(customerData);
    }
  };

  return (
    <Card className="border-2 border-dashed border-primary/20 bg-primary/5">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-primary" />
          <CardTitle className="text-base text-primary">{title}</CardTitle>
        </div>
        <CardDescription className="text-xs">Enter {title.toLowerCase()} information</CardDescription>
      </CardHeader>
      <CardContent className="pt-0 space-y-4">
        {showCustomerDropdown && (
          <div>
            <Label className="text-xs font-medium">Select Existing Customer</Label>
            <Select onValueChange={handleCustomerSelect}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="Choose from existing customers..." />
              </SelectTrigger>
              <SelectContent className="bg-white z-50">
                {isLoading ? (
                  <SelectItem value="loading" disabled>Loading customers...</SelectItem>
                ) : customers.length === 0 ? (
                  <SelectItem value="empty" disabled>No customers found</SelectItem>
                ) : (
                  customers.map(customer => {
                    const displayName = customer.legal_name || customer.name;
                    const subtitle = customer.place && customer.state ? 
                      `(${customer.place}, ${customer.state})` : 
                      customer.place ? `(${customer.place})` : 
                      customer.state ? `(${customer.state})` : '';
                    
                    return (
                      <SelectItem key={customer.id} value={customer.id}>
                        <div className="flex items-center gap-2">
                          <Users className="h-3 w-3" />
                          <span>{displayName} {subtitle}</span>
                        </div>
                      </SelectItem>
                    );
                  })
                )}
              </SelectContent>
            </Select>
          </div>
        )}

        <div>
          <Label className="text-xs font-medium">Name *</Label>
          <Input
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            className="h-9 text-sm"
            placeholder={`Enter ${title.toLowerCase()} name...`}
          />
        </div>
        <div>
          <Label className="text-xs font-medium">GSTIN</Label>
          <Input
            value={gstin}
            onChange={(e) => onGstinChange(e.target.value)}
            className="h-9 text-sm"
            placeholder="GSTIN Number"
          />
        </div>
        <div>
          <Label className="text-xs font-medium">Address</Label>
          <Input
            value={address}
            onChange={(e) => onAddressChange(e.target.value)}
            className="h-9 text-sm"
            placeholder="Full address..."
          />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <Label className="text-xs font-medium">Place</Label>
            <Input
              value={place}
              onChange={(e) => onPlaceChange(e.target.value)}
              className="h-9 text-sm"
              placeholder="City"
            />
          </div>
          <div>
            <Label className="text-xs font-medium">State *</Label>
            <Select value={state} onValueChange={onStateChange}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent className="bg-white z-50">
                {states.map(s => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs font-medium">Pincode</Label>
            <Input
              value={pincode}
              onChange={(e) => onPincodeChange(e.target.value)}
              className="h-9 text-sm"
              placeholder="PIN"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PartyDetails;
