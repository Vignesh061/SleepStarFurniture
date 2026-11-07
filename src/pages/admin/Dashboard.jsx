import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Wrench,
  FolderGit2,
  Inbox,
  Sparkles,
  RefreshCw,
  Plus,
  ArrowRight,
  MessageCircle,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Star,
  Image as ImageIcon,
  Phone,
  Layers,
  Check,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { formatDate, formatCurrency, formatWhatsAppLink } from '../../utils/formatters';
import { productService } from '../../services/productService';
import { serviceService } from '../../services/serviceService';
import { projectService } from '../../services/projectService';
import { enquiryService } from '../../services/enquiryService';

export const Dashboard = () => {
  const { currentUser, isConfigured } = useAuth();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Direct reactive collection states initialized from instant cache
  const [products, setProducts] = useState(() => {
    try {
      const data = productService.getCachedOrDefaults();
      return Array.isArray(data) ? data : [];
    } catch (_) {
      return [];
    }
  });

  const [services, setServices] = useState(() => {
    try {
      const data = serviceService.getCachedOrDefaults();
      return Array.isArray(data) ? data : [];
    } catch (_) {
      return [];
    }
  });

  const [projects, setProjects] = useState(() => {
    try {
      const data = projectService.getCachedOrDefaults();
      return Array.isArray(data) ? data : [];
    } catch (_) {
      return [];
    }
  });

  const [enquiries, setEnquiries] = useState(() => {
    try {
      const data = enquiryService.getCachedEnquiries();
      return Array.isArray(data) ? data : [];
    } catch (_) {
      return [];
    }
  });

  // Recent lists
  const [recentProjects, setRecentProjects] = useState([]);
  const [recentEnquiries, setRecentEnquiries] = useState([]);

  // Compute live breakdown metrics clearly
  const productStats = useMemo(() => {
    const total = products.length;
    const published = products.filter((p) => p && p.isPublished !== false).length;
    const drafts = total - published;
    const featured = products.filter((p) => p && p.isFeatured).length;
    const inStock = products.filter((p) => p && p.inStock !== false).length;
    return { total, published, drafts, featured, inStock };
  }, [products]);

  const serviceStats = useMemo(() => {
    const total = services.length;
    const active = services.filter((s) => s && s.isActive !== false).length;
    const featured = services.filter((s) => s && s.isFeatured).length;
    return { total, active, featured };
  }, [services]);

  const projectStats = useMemo(() => {
    const total = projects.length;
    const published = projects.filter((p) => p && p.status === 'published').length;
    const drafts = total - published;
    const featured = projects.filter((p) => p && p.isFeatured).length;
    return { total, published, drafts, featured };
  }, [projects]);

  const enquiryStats = useMemo(() => {
    const total = enquiries.length;
    const newCount = enquiries.filter((e) => e && (e.status === 'New' || !e.status)).length;
    const inProgress = enquiries.filter(
      (e) => e && ['Contacted', 'Site Visit Scheduled', 'Quotation Sent'].includes(e.status)
    ).length;
    const completed = enquiries.filter(
      (e) => e && ['Confirmed', 'Completed', 'Closed'].includes(e.status)
    ).length;
    return { total, newCount, inProgress, completed };
  }, [enquiries]);

  // Unified data fetcher with instant cache fallback
  const fetchDashboardData = async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      setError(null);

      const [prodsRes, servsRes, projsRes, enqsRes] = await Promise.allSettled([
        productService.getAllForAdmin({ forceRefresh: true }),
        serviceService.getAllForAdmin({ forceRefresh: true }),
        projectService.getAllForAdmin({ forceRefresh: true }),
        enquiryService.getAllForAdmin({ forceRefresh: true }),
      ]);

      const prods =
        prodsRes.status === 'fulfilled' && Array.isArray(prodsRes.value)
          ? prodsRes.value
          : productService.getCachedOrDefaults();

      const servs =
        servsRes.status === 'fulfilled' && Array.isArray(servsRes.value)
          ? servsRes.value
          : serviceService.getCachedOrDefaults();

      const projs =
        projsRes.status === 'fulfilled' && Array.isArray(projsRes.value)
          ? projsRes.value
          : projectService.getCachedOrDefaults();

      const enqs =
        enqsRes.status === 'fulfilled' && Array.isArray(enqsRes.value)
          ? enqsRes.value
          : enquiryService.getCachedEnquiries();

      setProducts(prods);
      setServices(servs);
      setProjects(projs);
      setEnquiries(enqs);

      // Sort recent projects
      const sortedProjs = [...projs].sort((a, b) => {
        const timeA = a.createdAt?.toMillis
          ? a.createdAt.toMillis()
          : a.createdAt
          ? new Date(a.createdAt).getTime()
          : 0;
        const timeB = b.createdAt?.toMillis
          ? b.createdAt.toMillis()
          : b.createdAt
          ? new Date(b.createdAt).getTime()
          : 0;
        return timeB - timeA;
      });
      setRecentProjects(sortedProjs.slice(0, 5));

      // Sort recent enquiries
      const sortedEnqs = [...enqs].sort((a, b) => {
        const timeA = a.createdAt?.toMillis
          ? a.createdAt.toMillis()
          : a.createdAt
          ? new Date(a.createdAt).getTime()
          : 0;
        const timeB = b.createdAt?.toMillis
          ? b.createdAt.toMillis()
          : b.createdAt
          ? new Date(b.createdAt).getTime()
          : 0;
        return timeB - timeA;
      });
      setRecentEnquiries(sortedEnqs.slice(0, 5));
    } catch (err) {
      console.warn('Dashboard fetch warning:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData(false);
  }, [isConfigured]);

  const handleRefresh = () => {
    fetchDashboardData(true);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'New':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Contacted':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Site Visit Scheduled':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Quotation Sent':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'Confirmed':
      case 'Completed':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Closed':
        return 'bg-neutral-100 text-neutral-600 border-neutral-200';
      default:
        return 'bg-neutral-100 text-neutral-700 border-neutral-200';
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <LoadingSpinner size="lg" text="Loading live dashboard metrics..." />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Banner & Quick Controls */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-6 sm:p-8 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Real-time Business Overview</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
            Dashboard & Content Metrics
          </h2>
          <p className="text-sm text-neutral-500">
            Live counts for products, custom interior services, completed portfolio projects, and incoming customer enquiries.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl border border-neutral-300 bg-white text-neutral-700 text-xs font-semibold hover:bg-neutral-50 active:scale-95 disabled:opacity-50 transition-all cursor-pointer shadow-2xs"
            title="Refresh metrics from database"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh Data'}</span>
          </button>

          <Link
            to="/admin/products"
            className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-neutral-900 text-white text-xs font-semibold hover:bg-neutral-800 transition-colors shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Product</span>
          </Link>

          <Link
            to="/admin/projects"
            className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-olive-700 text-white text-xs font-semibold hover:bg-olive-800 transition-colors shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Publish Project</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start space-x-3 text-amber-800 text-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold">Notice</p>
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* 4 PRIMARY METRIC DIVS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* 1. Total Products */}
        <Link
          to="/admin/products"
          className="group bg-white rounded-2xl border border-neutral-200 p-5 hover:border-neutral-400 hover:shadow-md transition-all flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                Total Products
              </span>
              <div className="p-2 rounded-xl bg-neutral-100 text-neutral-700 group-hover:bg-neutral-900 group-hover:text-white transition-colors">
                <Package className="w-4 h-4" />
              </div>
            </div>

            <div className="mt-4 flex items-baseline justify-between">
              <span className="text-3xl font-extrabold text-neutral-900">
                {productStats.total}
              </span>
              <span className="text-xs font-bold text-olive-700 group-hover:text-olive-800 transition-colors flex items-center">
                <span>Manage</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-neutral-100 space-y-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="inline-flex items-center text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1" />
                {productStats.published} Published
              </span>
              {productStats.drafts > 0 && (
                <span className="inline-flex items-center text-[10px] font-semibold text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded-full border border-neutral-200">
                  {productStats.drafts} Draft
                </span>
              )}
              {productStats.featured > 0 && (
                <span className="inline-flex items-center text-[10px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  <Star className="w-3 h-3 text-amber-500 fill-amber-400 mr-1" />
                  {productStats.featured} Featured
                </span>
              )}
            </div>
            <p className="text-[11px] text-neutral-400">
              Ready-made furniture pieces in showroom
            </p>
          </div>
        </Link>

        {/* 2. Customer Services */}
        <Link
          to="/admin/services"
          className="group bg-white rounded-2xl border border-neutral-200 p-5 hover:border-neutral-400 hover:shadow-md transition-all flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                Customer Services
              </span>
              <div className="p-2 rounded-xl bg-neutral-100 text-neutral-700 group-hover:bg-neutral-900 group-hover:text-white transition-colors">
                <Wrench className="w-4 h-4" />
              </div>
            </div>

            <div className="mt-4 flex items-baseline justify-between">
              <span className="text-3xl font-extrabold text-neutral-900">
                {serviceStats.total}
              </span>
              <span className="text-xs font-bold text-olive-700 group-hover:text-olive-800 transition-colors flex items-center">
                <span>Manage</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-neutral-100 space-y-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="inline-flex items-center text-[10px] font-semibold text-olive-800 bg-olive-50 px-2 py-0.5 rounded-full border border-olive-200">
                <span className="w-1.5 h-1.5 rounded-full bg-olive-600 mr-1" />
                {serviceStats.active} Active Services
              </span>
              {serviceStats.featured > 0 && (
                <span className="inline-flex items-center text-[10px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  <Star className="w-3 h-3 text-amber-500 fill-amber-400 mr-1" />
                  {serviceStats.featured} Featured
                </span>
              )}
            </div>
            <p className="text-[11px] text-neutral-400">
              Kitchens, wardrobes & modular interior woodwork
            </p>
          </div>
        </Link>

        {/* 3. Completed Projects */}
        <Link
          to="/admin/projects"
          className="group bg-white rounded-2xl border border-neutral-200 p-5 hover:border-neutral-400 hover:shadow-md transition-all flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                Completed Projects
              </span>
              <div className="p-2 rounded-xl bg-neutral-100 text-neutral-700 group-hover:bg-neutral-900 group-hover:text-white transition-colors">
                <FolderGit2 className="w-4 h-4" />
              </div>
            </div>

            <div className="mt-4 flex items-baseline justify-between">
              <span className="text-3xl font-extrabold text-neutral-900">
                {projectStats.total}
              </span>
              <span className="text-xs font-bold text-olive-700 group-hover:text-olive-800 transition-colors flex items-center">
                <span>Portfolio</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-neutral-100 space-y-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="inline-flex items-center text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1" />
                {projectStats.published} Live Showcase
              </span>
              {projectStats.drafts > 0 && (
                <span className="inline-flex items-center text-[10px] font-semibold text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded-full border border-neutral-200">
                  {projectStats.drafts} Draft
                </span>
              )}
              {projectStats.featured > 0 && (
                <span className="inline-flex items-center text-[10px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  <Star className="w-3 h-3 text-amber-500 fill-amber-400 mr-1" />
                  {projectStats.featured} Featured
                </span>
              )}
            </div>
            <p className="text-[11px] text-neutral-400">
              Real installations, photos, video & locations
            </p>
          </div>
        </Link>

        {/* 4. Customer Queries */}
        <Link
          to="/admin/enquiries"
          className="group bg-white rounded-2xl border border-neutral-200 p-5 hover:border-neutral-400 hover:shadow-md transition-all flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                Customer Queries
              </span>
              <div className="p-2 rounded-xl bg-neutral-100 text-neutral-700 group-hover:bg-neutral-900 group-hover:text-white transition-colors">
                <Inbox className="w-4 h-4" />
              </div>
            </div>

            <div className="mt-4 flex items-baseline justify-between">
              <span className="text-3xl font-extrabold text-neutral-900">
                {enquiryStats.total}
              </span>
              <span className="text-xs font-bold text-olive-700 group-hover:text-olive-800 transition-colors flex items-center">
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-neutral-100 space-y-2">
            <div className="flex flex-wrap items-center gap-1.5">
              {enquiryStats.newCount > 0 ? (
                <span className="inline-flex items-center text-[10px] font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse mr-1" />
                  {enquiryStats.newCount} New / Unhandled
                </span>
              ) : (
                <span className="inline-flex items-center text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600 mr-1" />
                  All Addressed
                </span>
              )}
              {enquiryStats.inProgress > 0 && (
                <span className="inline-flex items-center text-[10px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  {enquiryStats.inProgress} In Progress
                </span>
              )}
            </div>
            <p className="text-[11px] text-neutral-400">
              Inquiries submitted through website forms & WhatsApp
            </p>
          </div>
        </Link>
      </div>

      {/* Two-Column Activity Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Enquiries (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-neutral-200 shadow-2xs overflow-hidden flex flex-col">
          <div className="p-5 border-b border-neutral-200 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-neutral-900">
                Recent Customer Queries
              </h3>
              <p className="text-xs text-neutral-500">
                Incoming requests from website enquiry forms
              </p>
            </div>
            <Link
              to="/admin/enquiries"
              className="text-xs font-bold text-olive-700 hover:text-olive-800 flex items-center space-x-1"
            >
              <span>View all ({enquiryStats.total})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-5 flex-1">
            {recentEnquiries.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <div className="w-12 h-12 rounded-full bg-neutral-100 text-neutral-400 mx-auto flex items-center justify-center">
                  <Inbox className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-neutral-800">No customer queries yet</p>
                  <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                    When customers submit enquiry forms on products, custom interior services, or completed projects, they will appear here instantly.
                  </p>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-neutral-100">
                {recentEnquiries.map((enq) => {
                  const replyUrl = formatWhatsAppLink(
                    enq.phone,
                    `Hello ${enq.customerName || 'Customer'}, regarding your enquiry for Sleep Star Furniture:`
                  );

                  return (
                    <div key={enq.id} className="py-3.5 flex items-start justify-between gap-4">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-sm text-neutral-900 truncate">
                            {enq.customerName || 'Customer'}
                          </span>
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getStatusBadge(
                              enq.status
                            )}`}
                          >
                            {enq.status || 'New'}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-600 truncate">
                          {enq.enquiryType || 'General Enquiry'}
                          {enq.relatedItemName && ` • ${enq.relatedItemName}`}
                          {enq.phone && ` • ${enq.phone}`}
                        </p>
                        <p className="text-[11px] text-neutral-400 flex items-center space-x-1">
                          <Clock className="w-3 h-3 text-neutral-400" />
                          <span>{formatDate(enq.createdAt) || 'Recent'}</span>
                        </p>
                      </div>

                      <div className="flex items-center space-x-2 flex-shrink-0">
                        {enq.phone && (
                          <a
                            href={replyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold transition-colors border border-emerald-200"
                            title="Chat on WhatsApp"
                          >
                            <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                            <span>WhatsApp</span>
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Recent Completed Projects (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-neutral-200 shadow-2xs overflow-hidden flex flex-col">
          <div className="p-5 border-b border-neutral-200 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-neutral-900">
                Recent Projects
              </h3>
              <p className="text-xs text-neutral-500">
                Portfolio installations
              </p>
            </div>
            <Link
              to="/admin/projects"
              className="text-xs font-bold text-olive-700 hover:text-olive-800 flex items-center space-x-1"
            >
              <span>CMS ({projectStats.total})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-5 flex-1">
            {recentProjects.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <div className="w-12 h-12 rounded-full bg-neutral-100 text-neutral-400 mx-auto flex items-center justify-center">
                  <FolderGit2 className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-neutral-800">No project posts yet</p>
                  <p className="text-xs text-neutral-500 max-w-xs mx-auto">
                    Publish completed furniture work with photos, client locations, and video walkthroughs.
                  </p>
                </div>
                <div className="pt-2">
                  <Link
                    to="/admin/projects"
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 text-white text-xs font-semibold hover:bg-neutral-800 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create Project Post</span>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {recentProjects.map((proj) => {
                  const cover =
                    proj.coverImage ||
                    proj.imageUrl ||
                    (proj.images && proj.images[0]) ||
                    '';

                  return (
                    <div
                      key={proj.id}
                      className="p-3 rounded-xl border border-neutral-200 bg-neutral-50/50 flex items-center justify-between gap-3 hover:bg-neutral-100/60 transition-colors"
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        {cover ? (
                          <img
                            src={cover}
                            alt={proj.title}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&auto=format&fit=crop&q=80';
                            }}
                            className="w-10 h-10 rounded-lg object-cover border border-neutral-200 flex-shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-neutral-200 text-neutral-500 flex items-center justify-center flex-shrink-0">
                            <ImageIcon className="w-4 h-4" />
                          </div>
                        )}

                        <div className="min-w-0 space-y-0.5">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-bold text-neutral-900 truncate">
                              {proj.title || 'Untitled Project'}
                            </span>
                            <span
                              className={`text-[9px] uppercase px-1.5 py-0.2 rounded font-semibold ${
                                proj.status === 'published'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-neutral-200 text-neutral-700'
                              }`}
                            >
                              {proj.status || 'Draft'}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 text-[11px] text-neutral-500">
                            {proj.location && (
                              <span className="flex items-center space-x-0.5">
                                <MapPin className="w-3 h-3 text-neutral-400" />
                                <span>{proj.location}</span>
                              </span>
                            )}
                            {proj.category && <span>• {proj.category}</span>}
                          </div>
                        </div>
                      </div>

                      <Link
                        to="/admin/projects"
                        className="p-1.5 text-neutral-400 hover:text-neutral-900 transition-colors flex-shrink-0"
                        title="Manage in Projects CMS"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
