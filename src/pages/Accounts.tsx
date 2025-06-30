
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus, FileText, BarChart3, Building2 } from 'lucide-react';
import { useJournalEntries } from '@/hooks/useJournalEntries';
import ChartOfAccountsList from '@/components/journal/ChartOfAccountsList';
import AddAccountDialog from '@/components/journal/AddAccountDialog';
import CrossModuleNavigation from '@/components/shared/CrossModuleNavigation';

const Accounts = () => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const {
    chartOfAccounts,
    isLoadingAccounts,
    updateChartOfAccount,
    createChartOfAccount,
    isUpdatingAccount,
    isCreatingAccount
  } = useJournalEntries();

  const handleUpdateAccount = (accountId: string, updates: any) => {
    updateChartOfAccount({ accountId, updates });
  };

  const handleCreateAccount = (data: any) => {
    createChartOfAccount(data);
    setShowCreateDialog(false);
  };

  // Get summary statistics
  const assetAccounts = chartOfAccounts.filter(account => account.account_type === 'asset');
  const liabilityAccounts = chartOfAccounts.filter(account => account.account_type === 'liability');
  const equityAccounts = chartOfAccounts.filter(account => account.account_type === 'equity');
  const incomeAccounts = chartOfAccounts.filter(account => account.account_type === 'income');
  const expenseAccounts = chartOfAccounts.filter(account => account.account_type === 'expense');

  const totalAssets = assetAccounts.reduce((sum, account) => sum + account.current_balance, 0);
  const totalLiabilities = liabilityAccounts.reduce((sum, account) => sum + account.current_balance, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Chart of Accounts</h1>
          <p className="text-muted-foreground">
            Manage your company's chart of accounts and account balances
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Account
        </Button>
      </div>

      {/* Cross-Module Navigation */}
      <CrossModuleNavigation />

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalAssets.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {assetAccounts.length} accounts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Liabilities</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalLiabilities.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {liabilityAccounts.length} accounts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Equity</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{(totalAssets - totalLiabilities).toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {equityAccounts.length} accounts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Accounts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{chartOfAccounts.length}</div>
            <p className="text-xs text-muted-foreground">
              Active accounts
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Accounts</TabsTrigger>
          <TabsTrigger value="assets">Assets ({assetAccounts.length})</TabsTrigger>
          <TabsTrigger value="liabilities">Liabilities ({liabilityAccounts.length})</TabsTrigger>
          <TabsTrigger value="equity">Equity ({equityAccounts.length})</TabsTrigger>
          <TabsTrigger value="income">Income ({incomeAccounts.length})</TabsTrigger>
          <TabsTrigger value="expenses">Expenses ({expenseAccounts.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <ChartOfAccountsList
            accounts={chartOfAccounts}
            isLoading={isLoadingAccounts}
            onUpdateAccount={handleUpdateAccount}
            onCreateAccount={handleCreateAccount}
            isUpdating={isUpdatingAccount}
            isCreatingAccount={isCreatingAccount}
          />
        </TabsContent>

        <TabsContent value="assets">
          <ChartOfAccountsList
            accounts={assetAccounts}
            isLoading={isLoadingAccounts}
            onUpdateAccount={handleUpdateAccount}
            onCreateAccount={handleCreateAccount}
            isUpdating={isUpdatingAccount}
            isCreatingAccount={isCreatingAccount}
          />
        </TabsContent>

        <TabsContent value="liabilities">
          <ChartOfAccountsList
            accounts={liabilityAccounts}
            isLoading={isLoadingAccounts}
            onUpdateAccount={handleUpdateAccount}
            onCreateAccount={handleCreateAccount}
            isUpdating={isUpdatingAccount}
            isCreatingAccount={isCreatingAccount}
          />
        </TabsContent>

        <TabsContent value="equity">
          <ChartOfAccountsList
            accounts={equityAccounts}
            isLoading={isLoadingAccounts}
            onUpdateAccount={handleUpdateAccount}
            onCreateAccount={handleCreateAccount}
            isUpdating={isUpdatingAccount}
            isCreatingAccount={isCreatingAccount}
          />
        </TabsContent>

        <TabsContent value="income">
          <ChartOfAccountsList
            accounts={incomeAccounts}
            isLoading={isLoadingAccounts}
            onUpdateAccount={handleUpdateAccount}
            onCreateAccount={handleCreateAccount}
            isUpdating={isUpdatingAccount}
            isCreatingAccount={isCreatingAccount}
          />
        </TabsContent>

        <TabsContent value="expenses">
          <ChartOfAccountsList
            accounts={expenseAccounts}
            isLoading={isLoadingAccounts}
            onUpdateAccount={handleUpdateAccount}
            onCreateAccount={handleCreateAccount}
            isUpdating={isUpdatingAccount}
            isCreatingAccount={isCreatingAccount}
          />
        </TabsContent>
      </Tabs>

      <AddAccountDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSubmit={handleCreateAccount}
        accounts={chartOfAccounts}
        isLoading={isCreatingAccount}
      />
    </div>
  );
};

export default Accounts;
