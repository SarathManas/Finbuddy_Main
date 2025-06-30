
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  FileText, 
  CreditCard, 
  BookOpen, 
  Users, 
  Package,
  DollarSign,
  ArrowUpDown,
  Calculator,
  BarChart3
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CommandPalette = ({ open, onOpenChange }: CommandPaletteProps) => {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const allCommands = [
    // Navigation Commands
    { 
      id: 'nav-dashboard', 
      title: 'Dashboard', 
      description: 'Business overview and metrics',
      category: 'Navigation',
      icon: BarChart3,
      action: () => navigate('/'),
      keywords: ['home', 'overview', 'dashboard', 'metrics']
    },
    { 
      id: 'nav-accounts', 
      title: 'Chart of Accounts', 
      description: 'Manage your accounting structure',
      category: 'Financial',
      icon: FileText,
      action: () => navigate('/accounts'),
      keywords: ['accounts', 'chart', 'gl', 'general ledger']
    },
    { 
      id: 'nav-journal', 
      title: 'Journal Entry', 
      description: 'Create accounting journal entries',
      category: 'Financial',
      icon: BookOpen,
      action: () => navigate('/journal-entry'),
      keywords: ['journal', 'entry', 'posting', 'accounting']
    },
    { 
      id: 'nav-bank', 
      title: 'Bank & Cash', 
      description: 'Manage bank accounts and transactions',
      category: 'Financial',
      icon: CreditCard,
      action: () => navigate('/bank-cash'),
      keywords: ['bank', 'cash', 'transactions', 'statements']
    },
    { 
      id: 'nav-reconcile', 
      title: 'Reconciliation', 
      description: 'Match bank transactions with journal entries',
      category: 'Financial',
      icon: ArrowUpDown,
      action: () => navigate('/reconciliation'),
      keywords: ['reconcile', 'match', 'verify', 'balance']
    },
    { 
      id: 'nav-customers', 
      title: 'Customers', 
      description: 'Manage customer information',
      category: 'Master Data',
      icon: Users,
      action: () => navigate('/customers'),
      keywords: ['customers', 'clients', 'contacts']
    },
    { 
      id: 'nav-inventory', 
      title: 'Inventory', 
      description: 'Track products and stock levels',
      category: 'Master Data',
      icon: Package,
      action: () => navigate('/inventory'),
      keywords: ['inventory', 'products', 'stock', 'items']
    },
    { 
      id: 'nav-invoices', 
      title: 'Invoices', 
      description: 'Manage customer invoices',
      category: 'Sales',
      icon: FileText,
      action: () => navigate('/invoices'),
      keywords: ['invoices', 'billing', 'sales']
    },
    { 
      id: 'nav-expenses', 
      title: 'Expenses', 
      description: 'Track business expenses',
      category: 'Financial',
      icon: DollarSign,
      action: () => navigate('/expenses'),
      keywords: ['expenses', 'costs', 'spending']
    },

    // Quick Actions
    { 
      id: 'action-new-journal', 
      title: 'New Journal Entry', 
      description: 'Create a new accounting entry',
      category: 'Quick Actions',
      icon: BookOpen,
      action: () => navigate('/journal-entry'),
      keywords: ['new', 'create', 'journal', 'entry', 'post']
    },
    { 
      id: 'action-new-account', 
      title: 'Add Account', 
      description: 'Create a new chart of account',
      category: 'Quick Actions',
      icon: FileText,
      action: () => navigate('/accounts'),
      keywords: ['new', 'add', 'account', 'chart', 'create']
    },
    { 
      id: 'action-upload-bank', 
      title: 'Upload Bank Statement', 
      description: 'Import bank transaction data',
      category: 'Quick Actions',
      icon: CreditCard,
      action: () => navigate('/bank-cash'),
      keywords: ['upload', 'import', 'bank', 'statement', 'csv']
    },
    { 
      id: 'action-reconcile', 
      title: 'Start Reconciliation', 
      description: 'Begin account reconciliation process',
      category: 'Quick Actions',
      icon: ArrowUpDown,
      action: () => navigate('/reconciliation'),
      keywords: ['reconcile', 'start', 'begin', 'match']
    }
  ];

  const filteredCommands = allCommands.filter(command => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      command.title.toLowerCase().includes(searchLower) ||
      command.description.toLowerCase().includes(searchLower) ||
      command.category.toLowerCase().includes(searchLower) ||
      command.keywords.some(keyword => keyword.includes(searchLower))
    );
  });

  const groupedCommands = filteredCommands.reduce((groups, command) => {
    const category = command.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(command);
    return groups;
  }, {} as Record<string, typeof allCommands>);

  const handleCommandSelect = (command: typeof allCommands[0]) => {
    command.action();
    onOpenChange(false);
    setSearch('');
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onOpenChange(true);
      }
      if (e.key === 'Escape') {
        onOpenChange(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0">
        <div className="flex items-center border-b px-4 py-3">
          <Search className="h-4 w-4 text-muted-foreground mr-3" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search commands, pages, and actions... (Ctrl+K)"
            className="border-0 focus-visible:ring-0 text-base"
            autoFocus
          />
        </div>
        
        <div className="max-h-80 overflow-y-auto p-2">
          {Object.entries(groupedCommands).map(([category, commands]) => (
            <div key={category} className="mb-4">
              <div className="px-2 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {category}
              </div>
              <div className="space-y-1">
                {commands.map((command) => (
                  <div
                    key={command.id}
                    onClick={() => handleCommandSelect(command)}
                    className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-gray-100 cursor-pointer transition-colors"
                  >
                    <command.icon className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <div className="font-medium text-sm">{command.title}</div>
                      <div className="text-xs text-muted-foreground">{command.description}</div>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {command.category}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          ))}
          
          {filteredCommands.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No commands found for "{search}"</p>
            </div>
          )}
        </div>
        
        <div className="border-t px-4 py-2 text-xs text-muted-foreground">
          Press <kbd className="px-1.5 py-0.5 rounded bg-gray-100">Ctrl+K</kbd> to open command palette
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CommandPalette;
