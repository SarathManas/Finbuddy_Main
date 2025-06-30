
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { 
  Building2, 
  Users, 
  FileText, 
  Package, 
  DollarSign, 
  BarChart3, 
  Settings, 
  Calculator,
  Upload,
  ShoppingCart,
  Receipt,
  Banknote,
  PiggyBank,
  BookOpen,
  Box,
  ArrowUpDown,
  ChevronDown,
  CreditCard,
  Wallet
} from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

const navigationItems = [
  {
    title: 'Dashboard',
    url: '/',
    icon: BarChart3,
  },
  {
    title: 'Document Upload',
    url: '/document-upload',
    icon: Upload,
  },
  {
    title: 'Chart of Accounts',
    url: '/accounts',
    icon: FileText,
  },
  {
    title: 'Bank & Cash',
    url: '/bank-cash',
    icon: PiggyBank,
  },
  {
    title: 'Journal Entry',
    url: '/journal-entry',
    icon: BookOpen,
  },
  {
    title: 'Reconciliation',
    url: '/reconciliation',
    icon: ArrowUpDown,
  },
  {
    title: 'Sales',
    icon: ShoppingCart,
    items: [
      {
        title: 'Generate Invoice',
        url: '/sales/generate-invoice',
        icon: FileText,
      },
      {
        title: 'Quotation',
        url: '/sales/quotation',
        icon: Receipt,
      },
      {
        title: 'Tax Invoice',
        url: '/sales/tax-invoice',
        icon: CreditCard,
      },
    ],
  },
  {
    title: 'Purchase',
    icon: Package,
    items: [
      {
        title: 'Purchase Entry',
        url: '/purchase/purchase-entry',
        icon: FileText,
      },
      {
        title: 'Quotation',
        url: '/purchase/quotation',
        icon: Receipt,
      },
      {
        title: 'Purchases',
        url: '/purchase/purchases',
        icon: Package,
      },
    ],
  },
  {
    title: 'Master Data',
    icon: Building2,
    items: [
      {
        title: 'Customer Management',
        url: '/customers',
        icon: Users,
      },
      {
        title: 'Inventory',
        url: '/inventory',
        icon: Box,
      },
    ],
  },
  {
    title: 'Expenses',
    url: '/expenses',
    icon: Wallet,
  },
  {
    title: 'Reports',
    url: '/reports',
    icon: FileText,
  },
  {
    title: 'Settings',
    url: '/settings',
    icon: Settings,
  },
];

const AppSidebar = () => {
  const { state } = useSidebar();
  const location = useLocation();
  const isCollapsed = state === 'collapsed';

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const isGroupActive = (items: any[]) => {
    return items.some(item => isActive(item.url));
  };

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader className="border-b bg-sidebar/50">
        <div className="flex items-center gap-3 px-3 py-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm">
            <Building2 className="h-4 w-4" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <h2 className="text-base font-semibold tracking-tight text-sidebar-foreground">FinBuddy</h2>
              <p className="text-xs text-sidebar-foreground/60 font-medium">Business Management</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-sidebar-foreground/70 px-3 py-2">Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => {
                if (item.items) {
                  // Collapsible menu item
                  return (
                    <SidebarMenuItem key={item.title}>
                      <Collapsible defaultOpen={isGroupActive(item.items)}>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton
                            tooltip={isCollapsed ? item.title : undefined}
                            className="w-full justify-between"
                          >
                            <div className="flex items-center gap-2">
                              <item.icon className="h-4 w-4" />
                              <span>{item.title}</span>
                            </div>
                            {!isCollapsed && <ChevronDown className="h-4 w-4" />}
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {item.items.map((subItem) => (
                              <SidebarMenuSubItem key={subItem.title}>
                                <SidebarMenuSubButton
                                  asChild
                                  isActive={isActive(subItem.url)}
                                >
                                  <NavLink to={subItem.url} className="flex items-center gap-2">
                                    <subItem.icon className="h-4 w-4" />
                                    <span>{subItem.title}</span>
                                  </NavLink>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </Collapsible>
                    </SidebarMenuItem>
                  );
                } else {
                  // Regular menu item
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive(item.url)}
                        tooltip={isCollapsed ? item.title : undefined}
                      >
                        <NavLink to={item.url} className="flex items-center gap-2">
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                }
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;
