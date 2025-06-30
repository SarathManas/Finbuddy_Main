
import React from 'react';
import { Outlet } from 'react-router-dom';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import AppSidebar from './AppSidebar';
import Header from './Header';
import FloatingActionButton from './shared/FloatingActionButton';

const AppLayout = () => {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full overflow-hidden">
        <AppSidebar />
        <SidebarInset className="flex-1 min-w-0">
          <Header />
          <main className="flex-1 p-3 sm:p-6 overflow-auto">
            <div className="w-full max-w-full">
              <Outlet />
            </div>
          </main>
          <FloatingActionButton />
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default AppLayout;
