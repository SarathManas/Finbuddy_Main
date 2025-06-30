
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useEnhancedDashboard } from '@/hooks/useEnhancedDashboard';
import EnhancedMetricCards from '@/components/dashboard/EnhancedMetricCards';
import BusinessHealthOverview from '@/components/dashboard/BusinessHealthOverview';
import ActionItemsWidget from '@/components/dashboard/ActionItemsWidget';
import EnhancedDashboardCharts from '@/components/dashboard/EnhancedDashboardCharts';
import RecentInvoices from '@/components/dashboard/RecentInvoices';
import EnhancedFinancialDashboard from '@/components/dashboard/EnhancedFinancialDashboard';

const Dashboard = () => {
  const { data: dashboardData, isLoading, error } = useEnhancedDashboard();

  if (error) {
    console.error('Dashboard data error:', error);
  }

  if (isLoading) {
    return (
      <div className="space-y-6 bg-sky-gradient-light min-h-screen p-6">
        <div className="bg-white/90 rounded-xl p-6 shadow-lg border border-sky-100">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        
        {/* Loading skeleton for metric cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="p-6 border rounded-xl bg-white/90 shadow-lg border-sky-100">
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-8 w-1/2 mb-2" />
              <Skeleton className="h-3 w-full" />
            </div>
          ))}
        </div>

        {/* Loading skeleton for charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="bg-white/90 rounded-xl shadow-lg border border-sky-100">
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
          <div className="bg-white/90 rounded-xl shadow-lg border border-sky-100">
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-sky-gradient-light min-h-screen p-6">
      <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-sky-100">
        <h1 className="text-page-title text-3xl font-bold mb-2">Business Dashboard</h1>
        <p className="text-sky-700 text-lg">Comprehensive insights across your business operations</p>
      </div>

      {/* Enhanced Financial Dashboard - New integrated section */}
      <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-sky-100">
        <EnhancedFinancialDashboard dashboardData={dashboardData} />
      </div>

      {/* Enhanced Metric Cards */}
      <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-sky-100 p-6">
        <EnhancedMetricCards dashboardData={dashboardData} />
      </div>
      
      {/* Business Health and Action Items */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-sky-100">
          <BusinessHealthOverview dashboardData={dashboardData} />
        </div>
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-sky-100">
          <ActionItemsWidget dashboardData={dashboardData} />
        </div>
      </div>

      {/* Enhanced Charts */}
      <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-sky-100">
        <EnhancedDashboardCharts dashboardData={dashboardData} />
      </div>
      
      {/* Recent Activity */}
      <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-sky-100">
        <RecentInvoices invoices={dashboardData?.invoices || []} />
      </div>
    </div>
  );
};

export default Dashboard;
