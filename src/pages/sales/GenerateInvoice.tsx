import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import InvoiceHeader from '@/components/invoice/InvoiceHeader';
import PartyDetails from '@/components/invoice/PartyDetails';
import InvoiceItemsTable from '@/components/invoice/InvoiceItemsTable';
import InvoiceSummary from '@/components/invoice/InvoiceSummary';

interface InvoiceItem {
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
  sgst: number;
}

const GenerateInvoice = () => {
  const [invoiceNumber, setInvoiceNumber] = useState(`INV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
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
  
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [newItem, setNewItem] = useState({
    description: '',
    hsnCode: '',
    price: 0,
    qty: 1,
    discPercent: 0,
    gstRate: 18
  });

  // Check if supplier and recipient are in the same state
  const isSameState = supplierState && recipientState && supplierState === recipientState;

  const handleCustomerSelect = (customer: any) => {
    // Use the enhanced customer data structure
    setRecipientName(customer.name || ''); // This is already legal_name from PartyDetails
    setRecipientGstin(customer.gstin || '');
    setRecipientAddress(customer.address || '');
    setRecipientPlace(customer.place || '');
    setRecipientState(customer.state || '');
    setRecipientPincode(customer.pincode || '');
    
    const customerDisplayName = customer.legal_name || customer.name;
    const location = customer.place && customer.state ? `${customer.place}, ${customer.state}` : '';
    toast.success(`Customer "${customerDisplayName}" selected and invoice details filled ${location ? `(${location})` : ''}`);
  };

  const addItem = () => {
    if (!newItem.description) {
      toast.error('Please enter item description');
      return;
    }

    const assessableValue = (newItem.price * newItem.qty) * (1 - newItem.discPercent / 100);
    const gstAmount = assessableValue * (newItem.gstRate / 100);
    
    let igst = 0;
    let cgst = 0;
    let sgst = 0;

    if (isSameState) {
      cgst = gstAmount / 2;
      sgst = gstAmount / 2;
      igst = 0;
    } else {
      igst = gstAmount;
      cgst = 0;
      sgst = 0;
    }
    
    const item: InvoiceItem = {
      id: Date.now().toString(),
      ...newItem,
      assessableValue,
      igst,
      cgst,
      sgst
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

  // Recalculate all items when states change
  const recalculateItems = () => {
    const updatedItems = items.map(item => {
      const gstAmount = item.assessableValue * (item.gstRate / 100);
      
      let igst = 0;
      let cgst = 0;
      let sgst = 0;

      if (isSameState) {
        cgst = gstAmount / 2;
        sgst = gstAmount / 2;
        igst = 0;
      } else {
        igst = gstAmount;
        cgst = 0;
        sgst = 0;
      }

      return {
        ...item,
        igst,
        cgst,
        sgst
      };
    });
    
    setItems(updatedItems);
  };

  // Effect to recalculate when states change
  React.useEffect(() => {
    if (items.length > 0) {
      recalculateItems();
    }
  }, [supplierState, recipientState]);

  const calculateTotals = () => {
    const totalAssessableValue = items.reduce((sum, item) => sum + item.assessableValue, 0);
    const totalIgst = items.reduce((sum, item) => sum + item.igst, 0);
    const totalCgst = items.reduce((sum, item) => sum + item.cgst, 0);
    const totalSgst = items.reduce((sum, item) => sum + item.sgst, 0);
    const grandTotal = totalAssessableValue + totalIgst + totalCgst + totalSgst;

    return { totalAssessableValue, totalIgst, totalCgst, totalSgst, grandTotal };
  };

  const { totalAssessableValue, totalIgst, totalCgst, totalSgst, grandTotal } = calculateTotals();

  const handleGenerateInvoice = () => {
    if (!supplierName || !recipientName || items.length === 0) {
      toast.error('Please fill in all required fields and add at least one item');
      return;
    }

    console.log('Generating invoice...', {
      invoiceNumber,
      date,
      supplier: { supplierName, supplierGstin, supplierAddress, supplierPlace, supplierState, supplierPincode },
      recipient: { recipientName, recipientGstin, recipientAddress, recipientPlace, recipientState, recipientPincode },
      items,
      totals: { totalAssessableValue, totalIgst, totalCgst, totalSgst, grandTotal },
      isSameState
    });

    toast.success('Tax invoice generated successfully!');
  };

  const handleCancel = () => {
    setItems([]);
    setSupplierName('');
    setSupplierGstin('');
    setSupplierAddress('');
    setSupplierPlace('');
    setSupplierState('');
    setSupplierPincode('');
    setRecipientName('');
    setRecipientGstin('');
    setRecipientAddress('');
    setRecipientPlace('');
    setRecipientState('');
    setRecipientPincode('');
  };

  const states = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 
    'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 
    'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 
    'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 
    'Uttarakhand', 'West Bengal'
  ];

  return (
    <div className="space-y-3 max-w-7xl mx-auto p-3">
      <div className="mb-3">
        <h1 className="text-xl font-bold">Invoice Generation</h1>
        <p className="text-muted-foreground text-xs">Generate a new invoice with all required details</p>
      </div>

      <div className="space-y-3">
        {/* Invoice Header */}
        <InvoiceHeader
          invoiceNumber={invoiceNumber}
          date={date}
          onInvoiceNumberChange={setInvoiceNumber}
          onDateChange={setDate}
        />

        {/* Supplier and Recipient Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <PartyDetails
            title="Supplier"
            name={supplierName}
            gstin={supplierGstin}
            address={supplierAddress}
            place={supplierPlace}
            state={supplierState}
            pincode={supplierPincode}
            onNameChange={setSupplierName}
            onGstinChange={setSupplierGstin}
            onAddressChange={setSupplierAddress}
            onPlaceChange={setSupplierPlace}
            onStateChange={setSupplierState}
            onPincodeChange={setSupplierPincode}
            states={states}
          />

          <PartyDetails
            title="Recipient"
            name={recipientName}
            gstin={recipientGstin}
            address={recipientAddress}
            place={recipientPlace}
            state={recipientState}
            pincode={recipientPincode}
            onNameChange={setRecipientName}
            onGstinChange={setRecipientGstin}
            onAddressChange={setRecipientAddress}
            onPlaceChange={setRecipientPlace}
            onStateChange={setRecipientState}
            onPincodeChange={setRecipientPincode}
            states={states}
            showCustomerDropdown={true}
            onCustomerSelect={handleCustomerSelect}
          />
        </div>

        {/* GST Type Indicator */}
        {supplierState && recipientState && (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="py-1">
              <div className="flex items-center justify-center">
                <span className="text-xs font-medium text-blue-800">
                  {isSameState 
                    ? `Same State Transaction (${supplierState}) - CGST + SGST will be applied`
                    : `Inter-State Transaction (${supplierState} → ${recipientState}) - IGST will be applied`
                  }
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Invoice Items */}
        <InvoiceItemsTable
          items={items}
          newItem={newItem}
          isSameState={isSameState}
          onNewItemChange={setNewItem}
          onAddItem={addItem}
          onRemoveItem={removeItem}
          onClearAllItems={clearAllItems}
        />

        {/* Invoice Summary */}
        <InvoiceSummary
          totalAssessableValue={totalAssessableValue}
          totalIgst={totalIgst}
          totalCgst={totalCgst}
          totalSgst={totalSgst}
          grandTotal={grandTotal}
          isSameState={isSameState}
          onGenerateInvoice={handleGenerateInvoice}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
};

export default GenerateInvoice;
