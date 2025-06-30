
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Plus } from 'lucide-react';
import { ChartOfAccount } from '@/hooks/useJournalEntries';
import InlineTextEdit from '@/components/shared/InlineTextEdit';
import InlineSelectEdit from '@/components/shared/InlineSelectEdit';
import InlineNumberEdit from '@/components/shared/InlineNumberEdit';
import AddAccountDialog from './AddAccountDialog';

interface ChartOfAccountsListProps {
  accounts: ChartOfAccount[];
  isLoading: boolean;
  onUpdateAccount: (accountId: string, updates: any) => void;
  onCreateAccount: (data: any) => void;
  isUpdating?: boolean;
  isCreatingAccount?: boolean;
}

const ChartOfAccountsList = ({
  accounts,
  isLoading,
  onUpdateAccount,
  onCreateAccount,
  isUpdating = false,
  isCreatingAccount = false
}: ChartOfAccountsListProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);

  const filteredAccounts = accounts.filter(account =>
    account.account_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.account_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getAccountTypeBadge = (type: string) => {
    const colors = {
      asset: 'bg-green-100 text-green-800',
      liability: 'bg-red-100 text-red-800',
      equity: 'bg-blue-100 text-blue-800',
      income: 'bg-purple-100 text-purple-800',
      expense: 'bg-orange-100 text-orange-800'
    };
    
    return (
      <Badge className={colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </Badge>
    );
  };

  const accountTypeOptions = [
    { value: 'asset', label: 'Asset' },
    { value: 'liability', label: 'Liability' },
    { value: 'equity', label: 'Equity' },
    { value: 'income', label: 'Income' },
    { value: 'expense', label: 'Expense' }
  ];

  const getSubtypeOptions = (accountType: string) => {
    const subtypeMap = {
      asset: [
        { value: 'current_asset', label: 'Current Asset' },
        { value: 'fixed_asset', label: 'Fixed Asset' },
        { value: 'cash', label: 'Cash & Cash Equivalents' },
        { value: 'accounts_receivable', label: 'Accounts Receivable' },
        { value: 'inventory', label: 'Inventory' },
        { value: 'prepaid_expenses', label: 'Prepaid Expenses' },
        { value: 'other_asset', label: 'Other Asset' }
      ],
      liability: [
        { value: 'current_liability', label: 'Current Liability' },
        { value: 'long_term_liability', label: 'Long Term Liability' },
        { value: 'accounts_payable', label: 'Accounts Payable' },
        { value: 'accrued_expenses', label: 'Accrued Expenses' },
        { value: 'loans_payable', label: 'Loans Payable' },
        { value: 'other_liability', label: 'Other Liability' }
      ],
      equity: [
        { value: 'owners_equity', label: 'Owner\'s Equity' },
        { value: 'retained_earnings', label: 'Retained Earnings' },
        { value: 'capital', label: 'Capital' },
        { value: 'drawings', label: 'Drawings' }
      ],
      income: [
        { value: 'revenue', label: 'Revenue' },
        { value: 'sales', label: 'Sales' },
        { value: 'service_income', label: 'Service Income' },
        { value: 'interest_income', label: 'Interest Income' },
        { value: 'other_income', label: 'Other Income' }
      ],
      expense: [
        { value: 'operating_expense', label: 'Operating Expense' },
        { value: 'cost_of_goods_sold', label: 'Cost of Goods Sold' },
        { value: 'administrative_expense', label: 'Administrative Expense' },
        { value: 'marketing_expense', label: 'Marketing Expense' },
        { value: 'interest_expense', label: 'Interest Expense' },
        { value: 'depreciation', label: 'Depreciation' },
        { value: 'other_expense', label: 'Other Expense' }
      ]
    };

    return subtypeMap[accountType as keyof typeof subtypeMap] || [];
  };

  const handleCreateAccount = (data: any) => {
    onCreateAccount(data);
    setShowAddDialog(false);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading chart of accounts...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Chart of Accounts</CardTitle>
            <Button size="sm" onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Account
            </Button>
          </div>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search accounts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Account Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Subtype</TableHead>
                  <TableHead className="text-right">Opening Balance</TableHead>
                  <TableHead className="text-right">Current Balance</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAccounts.map((account) => (
                  <TableRow key={account.id}>
                    <TableCell className="font-medium">
                      <InlineTextEdit
                        value={account.account_name}
                        onSave={(value) => onUpdateAccount(account.id, { account_name: value })}
                        placeholder="Account name"
                        disabled={isUpdating}
                      />
                    </TableCell>
                    <TableCell>
                      <InlineSelectEdit
                        value={account.account_type}
                        onSave={(value) => onUpdateAccount(account.id, { account_type: value })}
                        options={accountTypeOptions}
                        placeholder="Select type"
                        disabled={isUpdating}
                      />
                    </TableCell>
                    <TableCell>
                      <InlineSelectEdit
                        value={account.account_subtype || ''}
                        onSave={(value) => onUpdateAccount(account.id, { account_subtype: value })}
                        options={getSubtypeOptions(account.account_type)}
                        placeholder="Select subtype"
                        disabled={isUpdating}
                        allowEmpty={true}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <InlineNumberEdit
                        value={account.opening_balance}
                        onSave={(value) => onUpdateAccount(account.id, { opening_balance: value })}
                        formatDisplay={(value) => `₹${value.toFixed(2)}`}
                        placeholder="0.00"
                        disabled={isUpdating}
                      />
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ₹{account.current_balance.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={account.is_active ? "default" : "secondary"}>
                        {account.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {isUpdating && (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-2"></div>
              <span className="text-sm text-muted-foreground">Updating account...</span>
            </div>
          )}
        </CardContent>
      </Card>

      <AddAccountDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSubmit={handleCreateAccount}
        accounts={accounts}
        isLoading={isCreatingAccount}
      />
    </>
  );
};

export default ChartOfAccountsList;
