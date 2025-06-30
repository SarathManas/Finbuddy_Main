
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2 } from 'lucide-react';
import { ChartOfAccount } from '@/hooks/useJournalEntries';

interface JournalEntryLine {
  account_id: string;
  account_name: string;
  description: string;
  debit_amount: number;
  credit_amount: number;
}

interface CreateJournalEntryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    description: string;
    entry_date: string;
    lines: JournalEntryLine[];
  }) => void;
  chartOfAccounts: ChartOfAccount[];
  isLoading: boolean;
}

const CreateJournalEntryDialog = ({
  open,
  onOpenChange,
  onSubmit,
  chartOfAccounts,
  isLoading
}: CreateJournalEntryDialogProps) => {
  const [description, setDescription] = useState('');
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split('T')[0]);
  const [lines, setLines] = useState<JournalEntryLine[]>([
    { account_id: '', account_name: '', description: '', debit_amount: 0, credit_amount: 0 },
    { account_id: '', account_name: '', description: '', debit_amount: 0, credit_amount: 0 }
  ]);

  const addLine = () => {
    setLines([...lines, { account_id: '', account_name: '', description: '', debit_amount: 0, credit_amount: 0 }]);
  };

  const removeLine = (index: number) => {
    if (lines.length > 2) {
      setLines(lines.filter((_, i) => i !== index));
    }
  };

  const updateLine = (index: number, field: keyof JournalEntryLine, value: string | number) => {
    const updatedLines = [...lines];
    if (field === 'account_id') {
      const account = chartOfAccounts.find(acc => acc.id === value);
      updatedLines[index] = {
        ...updatedLines[index],
        account_id: value as string,
        account_name: account?.account_name || ''
      };
    } else {
      updatedLines[index] = { ...updatedLines[index], [field]: value };
    }
    setLines(updatedLines);
  };

  const getTotalDebits = () => lines.reduce((sum, line) => sum + (line.debit_amount || 0), 0);
  const getTotalCredits = () => lines.reduce((sum, line) => sum + (line.credit_amount || 0), 0);
  const isBalanced = () => Math.abs(getTotalDebits() - getTotalCredits()) < 0.01;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!description.trim()) {
      alert('Please enter a description');
      return;
    }

    if (!isBalanced()) {
      alert('Journal entry must be balanced. Total debits must equal total credits.');
      return;
    }

    const validLines = lines.filter(line => 
      line.account_id && (line.debit_amount > 0 || line.credit_amount > 0)
    );

    if (validLines.length < 2) {
      alert('Please add at least two valid lines');
      return;
    }

    onSubmit({
      description,
      entry_date: entryDate,
      lines: validLines
    });

    // Reset form
    setDescription('');
    setEntryDate(new Date().toISOString().split('T')[0]);
    setLines([
      { account_id: '', account_name: '', description: '', debit_amount: 0, credit_amount: 0 },
      { account_id: '', account_name: '', description: '', debit_amount: 0, credit_amount: 0 }
    ]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Journal Entry</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="entry_date">Entry Date</Label>
              <Input
                id="entry_date"
                type="date"
                value={entryDate}
                onChange={(e) => setEntryDate(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter journal entry description"
                required
              />
            </div>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Journal Entry Lines</CardTitle>
              <Button type="button" onClick={addLine} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Line
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Account</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Debit</TableHead>
                    <TableHead className="text-right">Credit</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lines.map((line, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Select
                          value={line.account_id}
                          onValueChange={(value) => updateLine(index, 'account_id', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select account" />
                          </SelectTrigger>
                          <SelectContent>
                            {chartOfAccounts.map((account) => (
                              <SelectItem key={account.id} value={account.id}>
                                {account.account_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Input
                          value={line.description}
                          onChange={(e) => updateLine(index, 'description', e.target.value)}
                          placeholder="Line description"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={line.debit_amount || ''}
                          onChange={(e) => updateLine(index, 'debit_amount', parseFloat(e.target.value) || 0)}
                          placeholder="0.00"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={line.credit_amount || ''}
                          onChange={(e) => updateLine(index, 'credit_amount', parseFloat(e.target.value) || 0)}
                          placeholder="0.00"
                        />
                      </TableCell>
                      <TableCell>
                        {lines.length > 2 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeLine(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="font-medium bg-muted/50">
                    <TableCell colSpan={2}>Total</TableCell>
                    <TableCell className="text-right">₹{getTotalDebits().toFixed(2)}</TableCell>
                    <TableCell className="text-right">₹{getTotalCredits().toFixed(2)}</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
              
              <div className="mt-4 p-4 rounded-lg bg-muted">
                <div className="flex justify-between text-sm">
                  <span>Difference:</span>
                  <span className={`font-medium ${isBalanced() ? 'text-green-600' : 'text-red-600'}`}>
                    ₹{Math.abs(getTotalDebits() - getTotalCredits()).toFixed(2)}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {isBalanced() ? 'Entry is balanced ✓' : 'Entry must be balanced to save'}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !isBalanced()}>
              {isLoading ? 'Creating...' : 'Create Journal Entry'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateJournalEntryDialog;
