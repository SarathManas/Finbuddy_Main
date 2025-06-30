
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowUpDown, FileText, CheckCircle, AlertTriangle, Clock, Download } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const Reconciliation = () => {
  const workflowSteps = [
    {
      step: 1,
      title: "Data Collection",
      description: "Gather sales registers, purchase registers, and GSTR returns",
      icon: <FileText className="h-5 w-5" />,
      status: "completed"
    },
    {
      step: 2,
      title: "GSTR-1 vs Sales Register",
      description: "Compare outward supplies reported in GSTR-1 with sales register",
      icon: <ArrowUpDown className="h-5 w-5" />,
      status: "in-progress"
    },
    {
      step: 3,
      title: "GSTR-2A vs Purchase Register",
      description: "Match inward supplies in GSTR-2A with purchase register",
      icon: <ArrowUpDown className="h-5 w-5" />,
      status: "pending"
    },
    {
      step: 4,
      title: "ITC Reconciliation",
      description: "Reconcile Input Tax Credit claimed vs available",
      icon: <CheckCircle className="h-5 w-5" />,
      status: "pending"
    },
    {
      step: 5,
      title: "GSTR-3B Reconciliation",
      description: "Match GSTR-3B liability with compiled data",
      icon: <AlertTriangle className="h-5 w-5" />,
      status: "pending"
    }
  ];

  const reconciliationTypes = [
    {
      title: "Outward Supply Reconciliation",
      description: "GSTR-1 vs Sales Register",
      items: [
        "Invoice-wise comparison",
        "Tax rate verification",
        "Taxable value matching",
        "GSTIN validation",
        "HSN code verification"
      ]
    },
    {
      title: "Inward Supply Reconciliation", 
      description: "GSTR-2A/2B vs Purchase Register",
      items: [
        "Supplier invoice matching",
        "ITC eligibility check",
        "Document date verification",
        "Tax amount reconciliation",
        "Reverse charge applicability"
      ]
    },
    {
      title: "ITC Reconciliation",
      description: "Available vs Claimed ITC",
      items: [
        "GSTR-2A vs Books ITC",
        "Provisional ITC analysis",
        "Reversal requirements",
        "Time limit compliance",
        "Credit utilization tracking"
      ]
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'in-progress':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'pending':
        return <AlertTriangle className="h-4 w-4 text-gray-600" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">GST Reconciliation</h1>
        <p className="text-muted-foreground">
          Comprehensive workflow for GST compliance and reconciliation
        </p>
      </div>

      <Tabs defaultValue="workflow" className="space-y-6">
        <TabsList>
          <TabsTrigger value="workflow">Workflow Process</TabsTrigger>
          <TabsTrigger value="types">Reconciliation Types</TabsTrigger>
          <TabsTrigger value="reports">Reports & Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="workflow" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowUpDown className="h-5 w-5" />
                GST Reconciliation Workflow
              </CardTitle>
              <CardDescription>
                Step-by-step process for complete GST reconciliation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {workflowSteps.map((step, index) => (
                  <div key={step.step} className="flex items-start gap-4 p-4 border rounded-lg">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                        {step.step}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {step.icon}
                        <h3 className="font-semibold">{step.title}</h3>
                        <Badge className={getStatusColor(step.status)}>
                          <span className="flex items-center gap-1">
                            {getStatusIcon(step.status)}
                            {step.status.replace('-', ' ')}
                          </span>
                        </Badge>
                      </div>
                      <p className="text-muted-foreground">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Key Reconciliation Points</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-medium text-green-700">✓ Items to Match</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Invoice numbers and dates</li>
                    <li>• Taxable values and tax amounts</li>
                    <li>• GSTIN of counterparties</li>
                    <li>• HSN/SAC codes</li>
                    <li>• Tax rates applied</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-medium text-red-700">⚠ Common Discrepancies</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Missing invoices in GSTR-1</li>
                    <li>• ITC claimed but not available</li>
                    <li>• Rate differences</li>
                    <li>• Amendment not reflected</li>
                    <li>• Timing differences</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="types" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {reconciliationTypes.map((type, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg">{type.title}</CardTitle>
                  <CardDescription>{type.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {type.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Reconciliation Reports</CardTitle>
                <CardDescription>Generated reports and analysis</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">GSTR-1 vs Sales Summary</p>
                    <p className="text-sm text-muted-foreground">Monthly reconciliation report</p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">ITC Reconciliation Report</p>
                    <p className="text-sm text-muted-foreground">Available vs claimed analysis</p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">Discrepancy Report</p>
                    <p className="text-sm text-muted-foreground">Identified mismatches and errors</p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Compliance Status</CardTitle>
                <CardDescription>Current reconciliation status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">GSTR-1 Filed</span>
                    <Badge className="bg-green-100 text-green-800">Completed</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">GSTR-3B Filed</span>
                    <Badge className="bg-green-100 text-green-800">Completed</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Purchase Reconciliation</span>
                    <Badge className="bg-yellow-100 text-yellow-800">In Progress</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">ITC Reconciliation</span>
                    <Badge className="bg-gray-100 text-gray-800">Pending</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Monthly Reconciliation Timeline</CardTitle>
              <CardDescription>Key dates and deadlines for GST compliance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">10th of Month</h4>
                    <p className="text-sm text-muted-foreground">Download GSTR-2A</p>
                    <p className="text-sm text-muted-foreground">Start purchase reconciliation</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">11th of Month</h4>
                    <p className="text-sm text-muted-foreground">File GSTR-1</p>
                    <p className="text-sm text-muted-foreground">Complete sales reconciliation</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">20th of Month</h4>
                    <p className="text-sm text-muted-foreground">File GSTR-3B</p>
                    <p className="text-sm text-muted-foreground">Pay GST liability</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reconciliation;
