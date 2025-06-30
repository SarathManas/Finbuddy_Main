import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  FileText, 
  TrendingUp, 
  ShoppingCart, 
  Receipt,
  Calendar,
  DollarSign,
  Send,
  Edit,
  Trash2,
  CheckCircle
} from 'lucide-react';
import { Document } from '@/hooks/useDocuments';
import { formatDistanceToNow, format } from 'date-fns';
import InlineTextEdit from '@/components/shared/InlineTextEdit';
import InlineSelectEdit from '@/components/shared/InlineSelectEdit';
import InlineNumberEdit from '@/components/shared/InlineNumberEdit';
import InlineDateEdit from '@/components/shared/InlineDateEdit';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { useCustomers } from '@/hooks/useCustomers';
import { useVendors } from '@/hooks/useVendors';
import { useExpenseCategories } from '@/hooks/useExpenseCategories';
import { useDocumentPosting } from '@/hooks/useDocumentPosting';

interface CategorizedDocumentDisplayProps {
  documents: Document[];
}

const CategorizedDocumentDisplay = ({ documents }: CategorizedDocumentDisplayProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch data for dropdowns
  const { data: customers = [] } = useCustomers();
  const { data: vendors = [] } = useVendors();
  const { data: expenseCategories = [] } = useExpenseCategories();

  // Document posting functionality
  const {
    postSalesDocument,
    postPurchaseDocument,
    postExpenseDocument,
    isPostingSales,
    isPostingPurchase,
    isPostingExpense
  } = useDocumentPosting();

  // Categorize documents based on extracted data
  const categorizedDocs = {
    sales: documents.filter(doc => doc.extracted_data?.category === 'sales'),
    purchase: documents.filter(doc => doc.extracted_data?.category === 'purchase'),
    expense: documents.filter(doc => doc.extracted_data?.category === 'expense')
  };

  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(Number(amount));
  };

  const handleUpdateDocument = async (documentId: string, field: string, value: any) => {
    try {
      const document = documents.find(d => d.id === documentId);
      if (!document) return;

      const updatedData = {
        ...document.extracted_data,
        [field]: value
      };

      const { error } = await supabase
        .from('documents')
        .update({ extracted_data: updatedData })
        .eq('id', documentId);

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ['documents'] });
      
      toast({
        title: "Document updated",
        description: "Document data has been updated successfully."
      });
    } catch (error) {
      console.error('Error updating document:', error);
      toast({
        title: "Update failed",
        description: "Failed to update document data. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handlePost = (document: Document) => {
    const category = document.extracted_data?.category;
    const isAlreadyPosted = document.extracted_data?.posted;

    if (isAlreadyPosted) {
      toast({
        title: "Already posted",
        description: "This document has already been posted.",
        variant: "destructive"
      });
      return;
    }

    switch (category) {
      case 'sales':
        postSalesDocument(document);
        break;
      case 'purchase':
        postPurchaseDocument(document);
        break;
      case 'expense':
        postExpenseDocument(document);
        break;
      default:
        toast({
          title: "Cannot post",
          description: "Document category not recognized.",
          variant: "destructive"
        });
    }
  };

  const handleEdit = (document: Document) => {
    console.log('Edit document:', document.id);
    toast({
      title: "Feature coming soon",
      description: "Document editing functionality will be available soon."
    });
  };

  const handleDelete = (document: Document) => {
    console.log('Delete document:', document.id);
    toast({
      title: "Feature coming soon",
      description: "Document deletion functionality will be available soon."
    });
  };

  const isPosting = (document: Document) => {
    const category = document.extracted_data?.category;
    switch (category) {
      case 'sales':
        return isPostingSales;
      case 'purchase':
        return isPostingPurchase;
      case 'expense':
        return isPostingExpense;
      default:
        return false;
    }
  };

  const isPosted = (document: Document) => {
    return document.extracted_data?.posted === true;
  };

  const ActionButtons = ({ document }: { document: Document }) => (
    <div className="flex items-center gap-2">
      <Button
        size="sm"
        variant={isPosted(document) ? "secondary" : "outline"}
        onClick={() => handlePost(document)}
        className="h-8 w-8 p-0"
        title={isPosted(document) ? "Already posted" : "Post document"}
        disabled={isPosting(document) || isPosted(document)}
      >
        {isPosted(document) ? (
          <CheckCircle className="h-4 w-4 text-green-600" />
        ) : (
          <Send className="h-4 w-4" />
        )}
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={() => handleEdit(document)}
        className="h-8 w-8 p-0"
        title="Edit"
        disabled={isPosting(document)}
      >
        <Edit className="h-4 w-4" />
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={() => handleDelete(document)}
        className="h-8 w-8 p-0"
        title="Delete"
        disabled={isPosting(document)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );

  const PostingStatus = ({ document }: { document: Document }) => {
    if (isPosted(document)) {
      return (
        <Badge variant="secondary" className="text-green-700 bg-green-100">
          <CheckCircle className="h-3 w-3 mr-1" />
          Posted
        </Badge>
      );
    }
    if (isPosting(document)) {
      return (
        <Badge variant="outline">
          Posting...
        </Badge>
      );
    }
    return (
      <Badge variant="outline">
        Ready to Post
      </Badge>
    );
  };

  const SalesTable = ({ docs }: { docs: Document[] }) => {
    // Prepare customer options for dropdown
    const customerOptions = customers.map(customer => ({
      value: customer.name || customer.legal_name || '',
      label: customer.name || customer.legal_name || ''
    }));

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Customer Name</TableHead>
            <TableHead>Invoice No.</TableHead>
            <TableHead>Invoice Date</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {docs.map((doc) => {
            const data = doc.extracted_data;
            return (
              <TableRow key={doc.id}>
                <TableCell className="font-medium">
                  <InlineSelectEdit
                    value={data?.customer_name || ''}
                    onSave={(value) => handleUpdateDocument(doc.id, 'customer_name', value)}
                    options={customerOptions}
                    placeholder="Select customer"
                    allowEmpty={true}
                  />
                </TableCell>
                <TableCell>
                  <InlineTextEdit
                    value={data?.invoice_number || ''}
                    onSave={(value) => handleUpdateDocument(doc.id, 'invoice_number', value)}
                    placeholder="Invoice number"
                  />
                </TableCell>
                <TableCell>
                  <InlineDateEdit
                    value={data?.invoice_date || ''}
                    onSave={(value) => handleUpdateDocument(doc.id, 'invoice_date', value)}
                    placeholder="Invoice date"
                  />
                </TableCell>
                <TableCell>
                  <InlineDateEdit
                    value={data?.due_date || ''}
                    onSave={(value) => handleUpdateDocument(doc.id, 'due_date', value)}
                    placeholder="Due date"
                  />
                </TableCell>
                <TableCell>
                  <InlineNumberEdit
                    value={data?.total_amount || 0}
                    onSave={(value) => handleUpdateDocument(doc.id, 'total_amount', value)}
                    formatDisplay={formatCurrency}
                    placeholder="Amount"
                  />
                </TableCell>
                <TableCell>
                  <ActionButtons document={doc} />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    );
  };

  const PurchaseTable = ({ docs }: { docs: Document[] }) => {
    // Prepare vendor options for dropdown
    const vendorOptions = vendors.map(vendor => ({
      value: vendor.name || vendor.company_name || '',
      label: vendor.name || vendor.company_name || ''
    }));

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Vendor Name</TableHead>
            <TableHead>PO Number</TableHead>
            <TableHead>Order Date</TableHead>
            <TableHead>Delivery Date</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {docs.map((doc) => {
            const data = doc.extracted_data;
            return (
              <TableRow key={doc.id}>
                <TableCell className="font-medium">
                  <InlineSelectEdit
                    value={data?.vendor_name || ''}
                    onSave={(value) => handleUpdateDocument(doc.id, 'vendor_name', value)}
                    options={vendorOptions}
                    placeholder="Select vendor"
                    allowEmpty={true}
                  />
                </TableCell>
                <TableCell>
                  <InlineTextEdit
                    value={data?.po_number || ''}
                    onSave={(value) => handleUpdateDocument(doc.id, 'po_number', value)}
                    placeholder="PO number"
                  />
                </TableCell>
                <TableCell>
                  <InlineDateEdit
                    value={data?.order_date || ''}
                    onSave={(value) => handleUpdateDocument(doc.id, 'order_date', value)}
                    placeholder="Order date"
                  />
                </TableCell>
                <TableCell>
                  <InlineDateEdit
                    value={data?.delivery_date || ''}
                    onSave={(value) => handleUpdateDocument(doc.id, 'delivery_date', value)}
                    placeholder="Delivery date"
                  />
                </TableCell>
                <TableCell>
                  <InlineNumberEdit
                    value={data?.total_amount || 0}
                    onSave={(value) => handleUpdateDocument(doc.id, 'total_amount', value)}
                    formatDisplay={formatCurrency}
                    placeholder="Amount"
                  />
                </TableCell>
                <TableCell>
                  <ActionButtons document={doc} />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    );
  };

  const ExpenseTable = ({ docs }: { docs: Document[] }) => {
    // Prepare merchant options (using vendors list) and expense category options
    const merchantOptions = vendors.map(vendor => ({
      value: vendor.name || vendor.company_name || '',
      label: vendor.name || vendor.company_name || ''
    }));

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Merchant</TableHead>
            <TableHead>Receipt No.</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {docs.map((doc) => {
            const data = doc.extracted_data;
            return (
              <TableRow key={doc.id}>
                <TableCell className="font-medium">
                  <InlineSelectEdit
                    value={data?.merchant_name || ''}
                    onSave={(value) => handleUpdateDocument(doc.id, 'merchant_name', value)}
                    options={merchantOptions}
                    placeholder="Select merchant"
                    allowEmpty={true}
                  />
                </TableCell>
                <TableCell>
                  <InlineTextEdit
                    value={data?.receipt_number || ''}
                    onSave={(value) => handleUpdateDocument(doc.id, 'receipt_number', value)}
                    placeholder="Receipt number"
                  />
                </TableCell>
                <TableCell>
                  <InlineDateEdit
                    value={data?.expense_date || ''}
                    onSave={(value) => handleUpdateDocument(doc.id, 'expense_date', value)}
                    placeholder="Expense date"
                  />
                </TableCell>
                <TableCell>
                  <InlineSelectEdit
                    value={data?.expense_category || ''}
                    onSave={(value) => handleUpdateDocument(doc.id, 'expense_category', value)}
                    options={expenseCategories}
                    placeholder="Select category"
                    allowEmpty={true}
                  />
                </TableCell>
                <TableCell>
                  <InlineNumberEdit
                    value={data?.total_amount || 0}
                    onSave={(value) => handleUpdateDocument(doc.id, 'total_amount', value)}
                    formatDisplay={formatCurrency}
                    placeholder="Amount"
                  />
                </TableCell>
                <TableCell>
                  <ActionButtons document={doc} />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    );
  };

  const EmptyState = ({ category, icon: Icon }: { category: string; icon: any }) => (
    <div className="flex flex-col items-center justify-center py-12">
      <Icon className="h-16 w-16 text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium mb-2">No {category} documents</h3>
      <p className="text-muted-foreground text-center">
        Upload documents and they will be automatically categorized here.
      </p>
    </div>
  );

  if (documents.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileText className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No documents uploaded</h3>
          <p className="text-muted-foreground text-center">
            Upload your first document to get started with AI-powered analysis.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Categorized Documents
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="sales" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="sales" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Sales ({categorizedDocs.sales.length})
            </TabsTrigger>
            <TabsTrigger value="purchase" className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              Purchase ({categorizedDocs.purchase.length})
            </TabsTrigger>
            <TabsTrigger value="expense" className="flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              Expense ({categorizedDocs.expense.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="sales" className="mt-6">
            {categorizedDocs.sales.length > 0 ? (
              <SalesTable docs={categorizedDocs.sales} />
            ) : (
              <EmptyState category="sales" icon={TrendingUp} />
            )}
          </TabsContent>
          
          <TabsContent value="purchase" className="mt-6">
            {categorizedDocs.purchase.length > 0 ? (
              <PurchaseTable docs={categorizedDocs.purchase} />
            ) : (
              <EmptyState category="purchase" icon={ShoppingCart} />
            )}
          </TabsContent>
          
          <TabsContent value="expense" className="mt-6">
            {categorizedDocs.expense.length > 0 ? (
              <ExpenseTable docs={categorizedDocs.expense} />
            ) : (
              <EmptyState category="expense" icon={Receipt} />
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default CategorizedDocumentDisplay;
