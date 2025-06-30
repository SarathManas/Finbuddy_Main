
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Plus, FileText, BarChart3, Calculator, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useJournalEntries } from '@/hooks/useJournalEntries';
import CreateJournalEntryDialog from '@/components/journal/CreateJournalEntryDialog';
import JournalEntriesList from '@/components/journal/JournalEntriesList';
import JournalEntryViewDialog from '@/components/journal/JournalEntryViewDialog';
import CrossModuleNavigation from '@/components/shared/CrossModuleNavigation';

const JournalEntry = () => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [viewEntry, setViewEntry] = useState(null);
  const [showViewDialog, setShowViewDialog] = useState(false);

  const {
    chartOfAccounts,
    journalEntries,
    isLoadingEntries,
    createJournalEntry,
    postJournalEntry,
    deleteJournalEntry,
    isCreating,
    isPosting,
    isDeleting
  } = useJournalEntries();

  const handleViewEntry = (entry) => {
    setViewEntry(entry);
    setShowViewDialog(true);
  };

  const handleCreateJournalEntry = (data) => {
    createJournalEntry(data);
    setShowCreateDialog(false);
  };

  // Get summary statistics
  const draftEntries = journalEntries.filter(entry => entry.status === 'draft');
  const postedEntries = journalEntries.filter(entry => entry.status === 'posted');
  const totalAmount = journalEntries.reduce((sum, entry) => sum + entry.total_debit, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Journal Entry</h1>
          <p className="text-muted-foreground">
            Create and manage accounting journal entries compliant with Indian Accounting Standards
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to="/accounts" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Chart of Accounts
              <ExternalLink className="h-3 w-3" />
            </Link>
          </Button>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Journal Entry
          </Button>
        </div>
      </div>

      {/* Cross-Module Navigation */}
      <CrossModuleNavigation />

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Entries</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{journalEntries.length}</div>
            <p className="text-xs text-muted-foreground">
              {draftEntries.length} draft, {postedEntries.length} posted
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalAmount.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chart of Accounts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{chartOfAccounts.length}</div>
            <p className="text-xs text-muted-foreground">
              <Link to="/accounts" className="text-blue-600 hover:underline">
                Manage accounts →
              </Link>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{draftEntries.length}</div>
            <p className="text-xs text-muted-foreground">
              Draft entries
            </p>
          </CardContent>
        </Card>
      </div>

      <JournalEntriesList
        entries={journalEntries}
        isLoading={isLoadingEntries}
        onViewEntry={handleViewEntry}
        onPostEntry={postJournalEntry}
        onDeleteEntry={deleteJournalEntry}
        isPosting={isPosting}
        isDeleting={isDeleting}
      />

      <CreateJournalEntryDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSubmit={handleCreateJournalEntry}
        chartOfAccounts={chartOfAccounts}
        isLoading={isCreating}
      />

      <JournalEntryViewDialog
        open={showViewDialog}
        onOpenChange={setShowViewDialog}
        entry={viewEntry}
      />
    </div>
  );
};

export default JournalEntry;
