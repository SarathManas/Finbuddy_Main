
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  FileText, 
  CreditCard, 
  BookOpen, 
  ArrowUpDown,
  X,
  Zap
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const FloatingActionButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const quickActions = [
    {
      id: 'journal',
      title: 'Journal Entry',
      description: 'Record accounting transaction',
      icon: BookOpen,
      color: 'bg-blue-600 hover:bg-blue-700',
      action: () => navigate('/journal-entry'),
      show: !location.pathname.includes('/journal-entry')
    },
    {
      id: 'bank',
      title: 'Bank Transaction',
      description: 'Import or categorize',
      icon: CreditCard,
      color: 'bg-green-600 hover:bg-green-700',
      action: () => navigate('/bank-cash'),
      show: !location.pathname.includes('/bank-cash')
    },
    {
      id: 'account',
      title: 'New Account',
      description: 'Add to chart of accounts',
      icon: FileText,
      color: 'bg-purple-600 hover:bg-purple-700',
      action: () => navigate('/accounts'),
      show: !location.pathname.includes('/accounts')
    },
    {
      id: 'reconcile',
      title: 'Reconciliation',
      description: 'Match transactions',
      icon: ArrowUpDown,
      color: 'bg-orange-600 hover:bg-orange-700',
      action: () => navigate('/reconciliation'),
      show: !location.pathname.includes('/reconciliation')
    }
  ];

  const availableActions = quickActions.filter(action => action.show);

  const handleActionClick = (action: typeof quickActions[0]) => {
    action.action();
    setIsOpen(false);
  };

  // Don't show on non-financial pages
  const financialPages = ['/accounts', '/journal-entry', '/bank-cash', '/reconciliation', '/expenses'];
  const isFinancialPage = financialPages.some(page => location.pathname.includes(page));
  
  if (!isFinancialPage) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen && (
        <Card className="mb-4 animate-scale-in">
          <CardContent className="p-3 space-y-2 min-w-60">
            <div className="flex items-center gap-2 mb-2 pb-2 border-b">
              <Zap className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-sm">Quick Actions</span>
              <Badge variant="secondary" className="text-xs">Financial</Badge>
            </div>
            {availableActions.map((action) => (
              <div
                key={action.id}
                onClick={() => handleActionClick(action)}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className={`p-2 rounded-lg ${action.color} text-white`}>
                  <action.icon className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm">{action.title}</div>
                  <div className="text-xs text-muted-foreground">{action.description}</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
      
      <Button
        size="lg"
        className={`rounded-full h-14 w-14 shadow-lg transition-all duration-200 ${
          isOpen 
            ? 'bg-red-600 hover:bg-red-700 rotate-45' 
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
      </Button>
    </div>
  );
};

export default FloatingActionButton;
