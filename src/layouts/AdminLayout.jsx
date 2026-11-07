import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AdminSidebar } from '../components/admin/AdminSidebar';
import { AdminHeader } from '../components/admin/AdminHeader';

export const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Determine current page title
  const getPageTitle = (pathname) => {
    if (pathname === '/admin' || pathname === '/admin/dashboard') return 'Dashboard Overview';
    if (pathname.startsWith('/admin/products')) return 'Product Management';
    if (pathname.startsWith('/admin/categories')) return 'Category Management';
    if (pathname.startsWith('/admin/services')) return 'Custom Services Management';
    if (pathname.startsWith('/admin/projects')) return 'Completed Projects CMS';
    if (pathname.startsWith('/admin/enquiries')) return 'Customer Enquiries';
    if (pathname.startsWith('/admin/offers')) return 'Offers & Discounts';
    if (pathname.startsWith('/admin/settings')) return 'Website Settings';
    return 'Admin Management';
  };

  return (
    <div className="min-h-screen flex bg-neutral-100 text-neutral-900">
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AdminHeader
          onMenuClick={() => setSidebarOpen(true)}
          title={getPageTitle(location.pathname)}
        />
        
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

