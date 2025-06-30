
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Plus, Trash2, Search } from 'lucide-react';
import { toast } from 'sonner';
import { useQuotations } from '@/hooks/useQuotations';
import QuotationTable from '@/components/quotations/QuotationTable';
import QuotationFilters from '@/components/quotations/QuotationFilters';

interface QuotationItem {
  id: string;
  description: string;
  hsnCode: string;
  price: number;
  qty: number;
  discPercent: number;
  assessableValue: number;
  gstRate: number;
  igst: number;
  cgst: number;
}

const SalesQuotation = () => {
  const [activeTab, setActiveTab] = useState<'create' | 'manage'>('create');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Form states for creating quotation
  const [quotationNumber, setQuotationNumber] = useState(`QUO-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [validUntil, setValidUntil] = useState(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  
  // Supplier details
  const [supplierName, setSupplierName] = useState('');
  const [supplierGstin, setSupplierGstin] = useState('');
  const [supplierAddress, setSupplierAddress] = useState('');
  const [supplierPlace, setSupplierPlace] = useState('');
  const [supplierState, setSupplierState] = useState('');
  const [supplierPincode, setSupplierPincode] = useState('');
  
  // Recipient details
  const [recipientName, setRecipientName] = useState('');
  const [recipientGstin, setRecipientGstin] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [recipientPlace, setRecipientPlace] = useState('');
  const [recipientState, setRecipientState] = useState('');
  const [recipientPincode, setRecipientPincode] = useState('');
  
  const [items, setItems] = useState<QuotationItem[]>([]);
  const [newItem, setNewItem] = useState({
    description: '',
    hsnCode: '',
    price: 0,
    qty: 1,
    discPercent: 0,
    gstRate: 18
  });

  const { 
    quotations, 
    isLoading, 
    convertToInvoice, 
    updateStatus, 
    isConverting, 
    isUpdatingStatus 
  } = useQuotations();

  const addItem = () => {
    if (!newItem.description) {
      toast.error('Please enter item description');
      return;
    }

    const assessableValue = (newItem.price * newItem.qty) * (1 - newItem.discPercent / 100);
    const gstAmount = assessableValue * (newItem.gstRate / 100);
    
    const item: QuotationItem = {
      id: Date.now().toString(),
      ...newItem,
      assessableValue,
      igst: gstAmount,
      cgst: gstAmount / 2
    };

    setItems([...items, item]);
    setNewItem({
      description: '',
      hsnCode: '',
      price: 0,
      qty: 1,
      discPercent: 0,
      gstRate: 18
    });
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const clearAllItems = () => {
    setItems([]);
  };

  const calculateTotals = () => {
    const totalAssessableValue = items.reduce((sum, item) => sum + item.assessableValue, 0);
    const totalIgst = items.reduce((sum, item) => sum + item.igst, 0);
    const totalCgst = items.reduce((sum, item) => sum + item.cgst, 0);
    const totalSgst = totalCgst; // SGST is same as CGST
    const grandTotal = totalAssessableValue + totalIgst + totalCgst + totalSgst;

    return { totalAssessableValue, totalIgst, totalCgst, totalSgst, grandTotal };
  };

  const { totalAssessableValue, totalIgst, totalCgst, totalSgst, grandTotal } = calculateTotals();

  const handleGenerateQuotation = () => {
    if (!supplierName || !recipientName || items.length === 0) {
      toast.error('Please fill in all required fields and add at least one item');
      return;
    }

    console.log('Generating quotation...', {
      quotationNumber,
      date,
      validUntil,
      supplier: { supplierName, supplierGstin, supplierAddress, supplierPlace, supplierState, supplierPincode },
      recipient: { recipientName, recipientGstin, recipientAddress, recipientPlace, recipientState, recipientPincode },
      items,
      totals: { totalAssessableValue, totalIgst, totalCgst, totalSgst, grandTotal }
    });

    toast.success('Quotation generated successfully!');
  };

  const handleConvertToInvoice = async (quotationId: string) => {
    try {
      await convertToInvoice(quotationId);
      toast.success('Quotation successfully converted to invoice!');
    } catch (error) {
      console.error('Error converting quotation to invoice:', error);
      toast.error('Failed to convert quotation to invoice');
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await updateStatus({ id, status });
      toast.success(`Quotation status updated to ${status}`);
    } catch (error) {
      console.error('Error updating quotation status:', error);
      toast.error('Failed to update quotation status');
    }
  };

  const filteredQuotations = React.useMemo(() => {
    if (!quotations) return [];
    
    return quotations.filter(quotation => {
      const matchesSearch = 
        quotation.quotation_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quotation.customers?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quotation.customers?.legal_name?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || quotation.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [quotations, searchTerm, statusFilter]);

  const states = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 
    'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 
    'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 
    'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 
    'Uttarakhand', 'West Bengal'
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sales Quotations</h1>
          <p className="text-muted-foreground">
            Create new quotations and manage existing ones
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant={activeTab === 'create' ? 'default' : 'outline'}
            onClick={() => setActiveTab('create')}
          >
            Create Quotation
          </Button>
          <Button 
            variant={activeTab === 'manage' ? 'default' : 'outline'}
            onClick={() => setActiveTab('manage')}
          >
            Manage Quotations
          </Button>
        </div>
      </div>

      {activeTab === 'create' ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-6">
            {/* Quotation Header */}
            <Card>
              <CardHeader>
                <CardTitle>Quotation Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="quotation-number">Quotation Number</Label>
                    <Input
                      id="quotation-number"
                      value={quotationNumber}
                      onChange={(e) => setQuotationNumber(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="valid-until">Valid Until</Label>
                    <Input
                      id="valid-until"
                      type="date"
                      value={validUntil}
                      onChange={(e) => setValidUntil(e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Supplier and Recipient Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Supplier</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="supplier-name">Name</Label>
                    <Input
                      id="supplier-name"
                      value={supplierName}
                      onChange={(e) => setSupplierName(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="supplier-gstin">GSTIN</Label>
                    <Input
                      id="supplier-gstin"
                      value={supplierGstin}
                      onChange={(e) => setSupplierGstin(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="supplier-address">Address</Label>
                    <Input
                      id="supplier-address"
                      value={supplierAddress}
                      onChange={(e) => setSupplierAddress(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <Label htmlFor="supplier-place">Place</Label>
                      <Input
                        id="supplier-place"
                        value={supplierPlace}
                        onChange={(e) => setSupplierPlace(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="supplier-state">State</Label>
                      <Select value={supplierState} onValueChange={setSupplierState}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                        <SelectContent>
                          {states.map(state => (
                            <SelectItem key={state} value={state}>{state}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="supplier-pincode">Pincode</Label>
                      <Input
                        id="supplier-pincode"
                        value={supplierPincode}
                        onChange={(e) => setSupplierPincode(e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recipient</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="recipient-name">Name</Label>
                    <Input
                      id="recipient-name"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="recipient-gstin">GSTIN</Label>
                    <Input
                      id="recipient-gstin"
                      value={recipientGstin}
                      onChange={(e) => setRecipientGstin(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="recipient-address">Address</Label>
                    <Input
                      id="recipient-address"
                      value={recipientAddress}
                      onChange={(e) => setRecipientAddress(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <Label htmlFor="recipient-place">Place</Label>
                      <Input
                        id="recipient-place"
                        value={recipientPlace}
                        onChange={(e) => setRecipientPlace(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="recipient-state">State</Label>
                      <Select value={recipientState} onValueChange={setRecipientState}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                        <SelectContent>
                          {states.map(state => (
                            <SelectItem key={state} value={state}>{state}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="recipient-pincode">Pincode</Label>
                      <Input
                        id="recipient-pincode"
                        value={recipientPincode}
                        onChange={(e) => setRecipientPincode(e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quotation Items */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Quotation Items ({items.length} item{items.length !== 1 ? 's' : ''})</CardTitle>
                    <CardDescription>Press Enter in the last row to add a new item</CardDescription>
                  </div>
                  {items.length > 0 && (
                    <Button variant="destructive" size="sm" onClick={clearAllItems}>
                      Clear All
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <div className="min-w-[1000px]">
                    {/* Table Header */}
                    <div className="grid grid-cols-11 gap-2 text-sm font-medium border-b pb-2 mb-4">
                      <div>#</div>
                      <div className="col-span-2">Description</div>
                      <div>HSN Code</div>
                      <div>Price</div>
                      <div>Qty</div>
                      <div>Disc %</div>
                      <div>Assessable Value</div>
                      <div>GST Rate</div>
                      <div>IGST</div>
                      <div>CGST</div>
                    </div>

                    {/* Existing Items */}
                    {items.map((item, index) => (
                      <div key={item.id} className="grid grid-cols-11 gap-2 items-center py-2 border-b">
                        <div className="text-sm">{index + 1}</div>
                        <div className="col-span-2 text-sm">{item.description}</div>
                        <div className="text-sm">{item.hsnCode}</div>
                        <div className="text-sm">{item.price}</div>
                        <div className="text-sm">{item.qty}</div>
                        <div className="text-sm">{item.discPercent}%</div>
                        <div className="text-sm">₹{item.assessableValue.toFixed(2)}</div>
                        <div className="text-sm">{item.gstRate}%</div>
                        <div className="text-sm">₹{item.igst.toFixed(2)}</div>
                        <div className="text-sm flex items-center justify-between">
                          ₹{item.cgst.toFixed(2)}
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => removeItem(item.id)}
                            className="h-6 w-6 p-0 ml-2"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}

                    {/* Add New Item Row */}
                    <div className="grid grid-cols-11 gap-2 pt-4">
                      <div className="text-sm">{items.length + 1}</div>
                      <Input
                        className="col-span-2"
                        placeholder="Description"
                        value={newItem.description}
                        onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                      />
                      <Input
                        placeholder="HSN Code"
                        value={newItem.hsnCode}
                        onChange={(e) => setNewItem({ ...newItem, hsnCode: e.target.value })}
                      />
                      <Input
                        type="number"
                        placeholder="Price"
                        value={newItem.price}
                        onChange={(e) => setNewItem({ ...newItem, price: parseFloat(e.target.value) || 0 })}
                      />
                      <Input
                        type="number"
                        placeholder="Qty"
                        value={newItem.qty}
                        onChange={(e) => setNewItem({ ...newItem, qty: parseInt(e.target.value) || 1 })}
                      />
                      <Input
                        type="number"
                        placeholder="Disc %"
                        value={newItem.discPercent}
                        onChange={(e) => setNewItem({ ...newItem, discPercent: parseFloat(e.target.value) || 0 })}
                      />
                      <div className="text-sm">₹{((newItem.price * newItem.qty) * (1 - newItem.discPercent / 100)).toFixed(2)}</div>
                      <Input
                        type="number"
                        placeholder="GST %"
                        value={newItem.gstRate}
                        onChange={(e) => setNewItem({ ...newItem, gstRate: parseFloat(e.target.value) || 0 })}
                      />
                      <div className="text-sm">₹{(((newItem.price * newItem.qty) * (1 - newItem.discPercent / 100)) * (newItem.gstRate / 100)).toFixed(2)}</div>
                      <div className="flex items-center">
                        <span className="text-sm">₹{(((newItem.price * newItem.qty) * (1 - newItem.discPercent / 100)) * (newItem.gstRate / 100) / 2).toFixed(2)}</span>
                        <Button 
                          onClick={addItem}
                          size="sm"
                          className="ml-2 h-8 w-8 p-0"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quotation Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quotation Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Total Assessable Value:</span>
                  <span>₹{totalAssessableValue.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total IGST:</span>
                  <span>₹{totalIgst.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total CGST:</span>
                  <span>₹{totalCgst.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total SGST:</span>
                  <span>₹{totalSgst.toFixed(2)}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Grand Total:</span>
                    <span>₹{grandTotal.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-3">
              <Button 
                className="w-full" 
                size="lg"
                onClick={handleGenerateQuotation}
              >
                <FileText className="mr-2 h-5 w-5" />
                Generate Quotation
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  setItems([]);
                  setSupplierName('');
                  setRecipientName('');
                  // Reset other fields as needed
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Quotation Management</CardTitle>
            <CardDescription>
              Track all your quotations and convert accepted ones to invoices
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search quotations, customers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <QuotationFilters 
                statusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
              />
            </div>

            <QuotationTable 
              quotations={filteredQuotations}
              isLoading={isLoading}
              onConvertToInvoice={handleConvertToInvoice}
              onUpdateStatus={handleUpdateStatus}
              isConverting={isConverting || isUpdatingStatus}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SalesQuotation;
