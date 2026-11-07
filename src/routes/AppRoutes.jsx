import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import { CustomerLayout } from '../layouts/CustomerLayout';
import { AdminLayout } from '../layouts/AdminLayout';

// Customer Pages
import { Home } from '../pages/customer/Home';
import { Products } from '../pages/customer/Products';
import { ProductDetails } from '../pages/customer/ProductDetails';
import { Services } from '../pages/customer/Services';
import { Projects } from '../pages/customer/Projects';
import { ProjectDetails } from '../pages/customer/ProjectDetails';
import { Offers } from '../pages/customer/Offers';
import { About } from '../pages/customer/About';
import { Contact } from '../pages/customer/Contact';
import { LogoRevealPage } from '../pages/customer/LogoRevealPage';

// Admin Pages
import { Login } from '../pages/admin/Login';
import { Dashboard } from '../pages/admin/Dashboard';
import { AdminProducts } from '../pages/admin/Products';
import { AdminCategories } from '../pages/admin/Categories';
import { AdminServices } from '../pages/admin/Services';
import { AdminProjects } from '../pages/admin/Projects';
import { AdminEnquiries } from '../pages/admin/Enquiries';
import { AdminOffers } from '../pages/admin/Offers';
import { AdminSettings } from '../pages/admin/Settings';

// Route Guard
import { ProtectedRoute } from '../components/admin/ProtectedRoute';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Customer Public Routes */}
      <Route element={<CustomerLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetails />} />
        <Route path="/services" element={<Services />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/projects/:id" element={<ProjectDetails />} />
        <Route path="/offers" element={<Offers />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
      </Route>

      {/* Standalone Brand Cinematic Logo Reveal */}
      <Route path="/logo-reveal" element={<LogoRevealPage />} />
      <Route path="/brand-reveal" element={<LogoRevealPage />} />

      {/* Admin Public Route */}
      <Route path="/admin/login" element={<Login />} />

      {/* Admin Protected Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="services" element={<AdminServices />} />
        <Route path="projects" element={<AdminProjects />} />
        <Route path="enquiries" element={<AdminEnquiries />} />
        <Route path="offers" element={<AdminOffers />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

