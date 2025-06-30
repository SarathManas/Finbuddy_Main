
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppLayout from "@/components/AppLayout";
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import Invoices from "./pages/Invoices";
import Products from "./pages/Products";
import Accounting from "./pages/Accounting";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import DocumentUpload from "./pages/DocumentUpload";
import GenerateInvoice from "./pages/sales/GenerateInvoice";
import SalesQuotation from "./pages/sales/Quotation";
import TaxInvoice from "./pages/sales/TaxInvoice";
import PurchaseEntry from "./pages/purchase/PurchaseEntry";
import PurchaseQuotation from "./pages/purchase/Quotation";
import Purchases from "./pages/purchase/Purchases";
import Expenses from "./pages/Expenses";
import BankCash from "./pages/BankCash";
import JournalEntry from "./pages/JournalEntry";
import Accounts from "./pages/Accounts";
import Inventory from "./pages/Inventory";
import Reconciliation from "./pages/Reconciliation";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route 
                path="/" 
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Dashboard />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="document-upload" element={<DocumentUpload />} />
                <Route path="accounts" element={<Accounts />} />
                <Route path="sales/generate-invoice" element={<GenerateInvoice />} />
                <Route path="sales/quotation" element={<SalesQuotation />} />
                <Route path="sales/tax-invoice" element={<TaxInvoice />} />
                <Route path="purchase/purchase-entry" element={<PurchaseEntry />} />
                <Route path="purchase/quotation" element={<PurchaseQuotation />} />
                <Route path="purchase/purchases" element={<Purchases />} />
                <Route path="expenses" element={<Expenses />} />
                <Route path="bank-cash" element={<BankCash />} />
                <Route path="journal-entry" element={<JournalEntry />} />
                <Route path="inventory" element={<Inventory />} />
                <Route path="reconciliation" element={<Reconciliation />} />
                <Route path="customers" element={<Customers />} />
                <Route path="invoices" element={<Invoices />} />
                <Route path="products" element={<Products />} />
                <Route path="accounting" element={<Accounting />} />
                <Route path="reports" element={<Reports />} />
                <Route path="settings" element={<Settings />} />
              </Route>
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
