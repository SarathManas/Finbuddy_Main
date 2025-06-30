
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowRight, 
  Plus, 
  FileText, 
  CreditCard, 
  BookOpen,
  ArrowUpDown
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const CrossModuleNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const getRelatedActions = () => {
    const path = location.pathname;
    
    if (path === '/accounts') {
      return [
        {
          title: 'Create Journal Entry',
          description: 'Record transactions using these accounts',
          icon: BookOpen,
          action: () => navigate('/journal-entry'),
          variant: 'default' as const
        },
        {
          title: 'View Bank Transactions',
          description: 'See how bank transactions map to accounts',
          icon: CreditCard,
          action: () => navigate('/bank-cash'),
          variant: 'outline' as const
        },
        {
          title: 'Start Reconciliation',
          description: 'Match bank transactions with journal entries',
          icon: ArrowUpDown,
          action: () => navigate('/reconciliation'),
          variant: 'outline' as const
        }
      ];
    }
    
    if (path === '/journal-entry') {
      return [
        {
          title: 'Manage Accounts',
          description: 'Add or edit chart of accounts',
          icon: FileText,
          action: () => navigate('/accounts'),
          variant: 'outline' as const
        },
        {
          title: 'Import Bank Data',
          description: 'Convert bank transactions to journal entries',
          icon: CreditCard,
          action: () => navigate('/bank-cash'),
          variant: 'default' as const
        },
        {
          title: 'Reconcile Accounts',
          description: 'Verify journal entries against bank statements',
          icon: ArrowUpDown,
          action: () => navigate('/reconciliation'),
          variant: 'outline' as const
        }
      ];
    }
    
    if (path === '/bank-cash') {
      return [
        {
          title: 'Create Journal Entries',
          description: 'Convert transactions to formal accounting entries',
          icon: BookOpen,
          action: () => navigate('/journal-entry'),
          variant: 'default' as const
        },
        {
          title: 'Setup Chart of Accounts',
          description: 'Ensure proper account mapping',
          icon: FileText,
          action: () => navigate('/accounts'),
          variant: 'outline' as const
        },
        {
          title: 'Reconcile Statements',
          description: 'Match transactions with journal entries',
          icon: ArrowUpDown,
          action: () => navigate('/reconciliation'),
          variant: 'outline' as const
        }
      ];
    }
    
    if (path === '/reconciliation') {
      return [
        {
          title: 'Review Journal Entries',
          description: 'Check entries that need reconciliation',
          icon: BookOpen,
          action: () => navigate('/journal-entry'),
          variant: 'outline' as const
        },
        {
          title: 'Check Bank Transactions',
          description: 'Verify transaction categorization',
          icon: CreditCard,
          action: () => navigate('/bank-cash'),
          variant: 'outline' as const
        },
        {
          title: 'Update Accounts',
          description: 'Modify account structures if needed',
          icon: FileText,
          action: () => navigate('/accounts'),
          variant: 'outline' as const
        }
      ];
    }

    return [];
  };

  const relatedActions = getRelatedActions();

  if (relatedActions.length === 0) return null;

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <ArrowRight className="h-4 w-4 text-blue-600" />
          <span className="font-medium text-sm">Related Actions</span>
          <Badge variant="secondary" className="text-xs">
            Workflow
          </Badge>
        </div>
        <div className="grid gap-2">
          {relatedActions.map((action, index) => (
            <div key={index} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <action.icon className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="font-medium text-sm">{action.title}</div>
                  <div className="text-xs text-muted-foreground">{action.description}</div>
                </div>
              </div>
              <Button 
                variant={action.variant} 
                size="sm" 
                onClick={action.action}
                className="ml-2"
              >
                <ArrowRight className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default CrossModuleNavigation;
