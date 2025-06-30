
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowRight, 
  TrendingUp, 
  FileText, 
  CreditCard, 
  BookOpen,
  ArrowUpDown,
  Calculator,
  Search
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import FinancialHealthWidget from './FinancialHealthWidget';
import CommandPalette from '../shared/CommandPalette';

interface EnhancedFinancialDashboardProps {
  dashboardData: any;
}

const EnhancedFinancialDashboard = ({ dashboardData }: EnhancedFinancialDashboardProps) => {
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const navigate = useNavigate();

  const financialModules = [
    {
      id: 'accounts',
      title: 'Chart of Accounts',
      description: 'Manage your accounting structure and account hierarchy',
      icon: FileText,
      color: 'border-l-blue-500',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      action: () => navigate('/accounts'),
      stats: `${dashboardData?.chartOfAccounts?.length || 0} accounts`,
      badge: 'Setup'
    },
    {
      id: 'journal',
      title: 'Journal Entries',
      description: 'Record and manage accounting transactions',
      icon: BookOpen,
      color: 'border-l-green-500',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      action: () => navigate('/journal-entry'),
      stats: `${dashboardData?.journalEntries?.length || 0} entries`,
      badge: 'Active'
    },
    {
      id: 'bank',
      title: 'Bank & Cash',
      description: 'Import and categorize bank transactions',
      icon: CreditCard,
      color: 'border-l-purple-500',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
      action: () => navigate('/bank-cash'),
      stats: `${dashboardData?.transactions?.length || 0} transactions`,
      badge: 'Integration'
    },
    {
      id: 'reconcile',
      title: 'Reconciliation',
      description: 'Match bank transactions with journal entries',
      icon: ArrowUpDown,
      color: 'border-l-orange-500',
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600',
      action: () => navigate('/reconciliation'),
      stats: 'Real-time matching',
      badge: 'Automation'
    }
  ];

  const workflowSteps = [
    {
      step: 1,
      title: 'Setup Chart of Accounts',
      description: 'Define your accounting structure',
      status: (dashboardData?.chartOfAccounts?.length || 0) > 0 ? 'completed' : 'pending',
      action: () => navigate('/accounts')
    },
    {
      step: 2,
      title: 'Import Bank Data',
      description: 'Upload bank statements and transactions',
      status: (dashboardData?.transactions?.length || 0) > 0 ? 'completed' : 'pending',
      action: () => navigate('/bank-cash')
    },
    {
      step: 3,
      title: 'Create Journal Entries',
      description: 'Record accounting transactions',
      status: (dashboardData?.journalEntries?.length || 0) > 0 ? 'completed' : 'pending',
      action: () => navigate('/journal-entry')
    },
    {
      step: 4,
      title: 'Reconcile Accounts',
      description: 'Match and verify all transactions',
      status: 'available',
      action: () => navigate('/reconciliation')
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-orange-100 text-orange-800';
      case 'available': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Quick Access Toolbar */}
      <Card className="border-0 shadow-none bg-gradient-to-r from-blue-50 to-purple-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Calculator className="h-5 w-5 text-blue-600" />
                <span className="font-semibold">Financial Management Hub</span>
              </div>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                Integrated Workflow
              </Badge>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowCommandPalette(true)}
              className="gap-2"
            >
              <Search className="h-4 w-4" />
              Quick Access (Ctrl+K)
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Financial Health Overview */}
      <FinancialHealthWidget dashboardData={dashboardData} />

      {/* Financial Modules Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {financialModules.map((module) => (
          <Card 
            key={module.id} 
            className={`border-l-4 ${module.color} hover:shadow-md transition-shadow cursor-pointer`}
            onClick={module.action}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-lg ${module.bgColor}`}>
                  <module.icon className={`h-5 w-5 ${module.iconColor}`} />
                </div>
                <Badge variant="secondary" className="text-xs">
                  {module.badge}
                </Badge>
              </div>
              <div>
                <CardTitle className="text-lg">{module.title}</CardTitle>
                <CardDescription className="text-sm">
                  {module.description}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{module.stats}</span>
                <Button variant="ghost" size="sm" className="gap-1">
                  Open <ArrowRight className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Workflow Guide */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            Financial Setup Workflow
          </CardTitle>
          <CardDescription>
            Follow these steps to set up your complete financial management system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {workflowSteps.map((step) => (
            <div 
              key={step.step}
              className="flex items-center gap-4 p-3 rounded-lg border hover:bg-gray-50 transition-colors cursor-pointer"
              onClick={step.action}
            >
              <div className={`flex items-center justify-center w-8 h-8 rounded-full font-medium text-sm ${
                step.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
              }`}>
                {step.step}
              </div>
              <div className="flex-1">
                <div className="font-medium">{step.title}</div>
                <div className="text-sm text-muted-foreground">{step.description}</div>
              </div>
              <Badge className={getStatusColor(step.status)}>
                {step.status}
              </Badge>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </div>
          ))}
        </CardContent>
      </Card>

      <CommandPalette 
        open={showCommandPalette} 
        onOpenChange={setShowCommandPalette} 
      />
    </div>
  );
};

export default EnhancedFinancialDashboard;
