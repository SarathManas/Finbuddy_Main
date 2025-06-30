
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calculator, BarChart3, BookOpen, FileText, Users, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Accounting = () => {
  const navigate = useNavigate();

  const accountingModules = [
    {
      title: 'Journal Entries',
      description: 'Create and manage accounting journal entries',
      icon: BookOpen,
      path: '/journal-entry',
      color: 'bg-blue-500'
    },
    {
      title: 'Chart of Accounts',
      description: 'Manage your account structure',
      icon: Calculator,
      path: '/journal-entry',
      color: 'bg-green-500'
    },
    {
      title: 'Financial Reports',
      description: 'View profit & loss, balance sheet reports',
      icon: BarChart3,
      path: '/reports',
      color: 'bg-purple-500'
    },
    {
      title: 'GST Reports',
      description: 'GST returns and compliance reports',
      icon: FileText,
      path: '/reports',
      color: 'bg-orange-500'
    },
    {
      title: 'Accounts Payable',
      description: 'Manage vendor payments and bills',
      icon: Users,
      path: '/customers',
      color: 'bg-red-500'
    },
    {
      title: 'Accounts Receivable',
      description: 'Track customer payments and invoices',
      icon: TrendingUp,
      path: '/invoices',
      color: 'bg-indigo-500'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Accounting</h1>
        <p className="text-muted-foreground">
          Comprehensive accounting management compliant with Indian Accounting Standards
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {accountingModules.map((module) => {
          const Icon = module.icon;
          return (
            <Card key={module.title} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <div className={`p-2 rounded-lg ${module.color}`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{module.title}</CardTitle>
                    <CardDescription>{module.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full" 
                  onClick={() => navigate(module.path)}
                >
                  Open Module
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Indian Accounting Standards Compliance</CardTitle>
            <CardDescription>
              Key features for IAS compliance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm">Double-entry bookkeeping system</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm">GST compliance and reporting</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm">Audit trail and transaction history</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm">Financial statements as per IAS</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm">Multi-currency support</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Statutory Compliance</CardTitle>
            <CardDescription>
              Indian statutory requirements
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm">TDS calculations and returns</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm">ESI and PF compliance</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm">Annual financial statements</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm">Company law compliance</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm">ROC filing support</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Accounting;
