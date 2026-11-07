import React, { useState, useEffect, useMemo } from 'react';
import {
  Inbox,
  Search,
  Filter,
  Phone,
  Mail,
  Calendar,
  MessageCircle,
  Eye,
  Trash2,
  CheckCircle2,
  Clock,
  MapPin,
  FileText,
  AlertCircle,
  ChevronDown,
  RefreshCw,
  ExternalLink,
  Save,
  X,
  Sparkles,
} from 'lucide-react';
import {
  enquiryService,
  ENQUIRY_STATUSES,
  ENQUIRY_TYPES,
} from '../../services/enquiryService';
import { formatWhatsAppLink } from '../../utils/formatters';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const AdminEnquiries = () => {
  const [enquiries, setEnquiries] = useState(() => {
    try {
      const data = enquiryService.getCachedEnquiries();
      return Array.isArray(data) ? data : [];
    } catch (_) {
      return [];
    }
  });
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [successNotice, setSuccessNotice] = useState('');

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');

  // Lightbox Modal for Customer Reference Photos
  const [lightboxImage, setLightboxImage] = useState(null);

  // Delete confirmation
  const [enquiryToDelete, setEnquiryToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Inline notes editing tracking
  const [notesState, setNotesState] = useState({});
  const [savingNotesId, setSavingNotesId] = useState(null);

  const loadEnquiries = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);
    setError('');

    try {
      const data = await enquiryService.getAllForAdmin();
      setEnquiries(data);

      // Pre-fill notes state
      const initialNotes = {};
      data.forEach((e) => {
        initialNotes[e.id] = e.notes || '';
      });
      setNotesState(initialNotes);
    } catch (err) {
      console.error('Error loading enquiries:', err);
      setError('Failed to fetch enquiries. Ensure your admin session is valid.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadEnquiries();
  }, []);

  // Update Status
  const handleStatusChange = async (enquiryId, newStatus) => {
    try {
      await enquiryService.updateEnquiry(enquiryId, { status: newStatus });
      setEnquiries((prev) =>
        prev.map((e) => (e.id === enquiryId ? { ...e, status: newStatus } : e))
      );
      showNotice(`Status updated to "${newStatus}"`);
    } catch (err) {
      console.error('Error updating status:', err);
      setError('Could not update enquiry status. Please try again.');
    }
  };

  // Save Internal Notes
  const handleSaveNotes = async (enquiryId) => {
    const notes = notesState[enquiryId] || '';
    setSavingNotesId(enquiryId);
    try {
      await enquiryService.updateEnquiry(enquiryId, { notes });
      setEnquiries((prev) =>
        prev.map((e) => (e.id === enquiryId ? { ...e, notes } : e))
      );
      showNotice('Internal notes saved successfully.');
    } catch (err) {
      console.error('Error saving notes:', err);
      setError('Failed to save notes.');
    } finally {
      setSavingNotesId(null);
    }
  };

  // Delete Enquiry
  const handleDeleteEnquiry = async () => {
    if (!enquiryToDelete) return;
    const targetId = enquiryToDelete.id;
    const targetImage = enquiryToDelete.referenceImageUrl || enquiryToDelete.imageUrl;

    // 1. Instantly remove from UI & close modal (0ms)
    setEnquiries((prev) => prev.filter((e) => e.id !== targetId));
    setEnquiryToDelete(null);
    showNotice('Enquiry deleted.');

    // 2. Perform background delete
    try {
      await enquiryService.delete(targetId, targetImage);
    } catch (err) {
      console.warn('Background delete enquiry warning:', err);
    }
  };

  const showNotice = (msg) => {
    setSuccessNotice(msg);
    setTimeout(() => setSuccessNotice(''), 4000);
  };

  // Metrics
  const metrics = useMemo(() => {
    const total = enquiries.length;
    const newCount = enquiries.filter((e) => e.status === 'New').length;
    const siteVisits = enquiries.filter(
      (e) => e.status === 'Site Visit Scheduled'
    ).length;
    const quotationSent = enquiries.filter(
      (e) => e.status === 'Quotation Sent'
    ).length;
    const confirmed = enquiries.filter(
      (e) => e.status === 'Confirmed' || e.status === 'Completed'
    ).length;

    return { total, newCount, siteVisits, quotationSent, confirmed };
  }, [enquiries]);

  // Filtered Enquiries
  const filteredEnquiries = useMemo(() => {
    return enquiries.filter((item) => {
      // Search
      const query = searchTerm.toLowerCase();
      const matchSearch =
        !searchTerm ||
        item.customerName?.toLowerCase().includes(query) ||
        item.phone?.toLowerCase().includes(query) ||
        item.email?.toLowerCase().includes(query) ||
        item.message?.toLowerCase().includes(query) ||
        item.relatedItemName?.toLowerCase().includes(query);

      // Status
      const matchStatus =
        statusFilter === 'All' || item.status === statusFilter;

      // Type
      const matchType = typeFilter === 'All' || item.enquiryType === typeFilter;

      return matchSearch && matchStatus && matchType;
    });
  }, [enquiries, searchTerm, statusFilter, typeFilter]);

  // Formatter for timestamp
  const formatEnquiryDate = (timestamp) => {
    if (!timestamp) return 'Just now';
    if (timestamp.toDate) {
      return timestamp.toDate().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
    return new Date(timestamp).toLocaleDateString('en-IN');
  };

  // Status Badge Styling in White and Gray palette
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'New':
        return 'bg-neutral-900 text-white font-bold ring-1 ring-neutral-900';
      case 'Contacted':
        return 'bg-neutral-200 text-neutral-800 font-semibold';
      case 'Site Visit Scheduled':
        return 'bg-neutral-800 text-neutral-100 font-semibold';
      case 'Quotation Sent':
        return 'bg-neutral-150 text-neutral-900 border border-neutral-300 font-semibold';
      case 'Confirmed':
      case 'Completed':
        return 'bg-neutral-100 text-neutral-900 border border-neutral-400 font-bold';
      case 'Closed':
        return 'bg-neutral-100 text-neutral-500 line-through';
      default:
        return 'bg-neutral-100 text-neutral-700';
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Title & Refresh */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">
            <Inbox className="w-3.5 h-3.5" />
            <span>Customer Pipeline</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900">
            Customer Enquiries Management
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Track inquiries, update statuses, schedule site visits, and connect with customers on WhatsApp.
          </p>
        </div>

        <button
          type="button"
          onClick={() => loadEnquiries(true)}
          disabled={refreshing}
          className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl border border-neutral-300 bg-white text-neutral-700 text-xs font-semibold hover:bg-neutral-50 shadow-2xs cursor-pointer disabled:opacity-50"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`}
          />
          <span>{refreshing ? 'Refreshing...' : 'Refresh Feed'}</span>
        </button>
      </div>

      {/* Global Alerts */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start space-x-2 text-xs text-red-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {successNotice && (
        <div className="p-4 bg-neutral-900 text-white rounded-2xl flex items-center space-x-2 text-xs font-medium shadow-md animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{successNotice}</span>
        </div>
      )}

      {/* Metrics / KPI Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white rounded-2xl border border-neutral-200 p-4 space-y-1 shadow-2xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 block">
            Total Enquiries
          </span>
          <div className="text-2xl font-bold text-neutral-900">
            {metrics.total}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200 p-4 space-y-1 shadow-2xs relative overflow-hidden">
          {metrics.newCount > 0 && (
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          )}
          <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 block">
            New / Unread
          </span>
          <div className="text-2xl font-bold text-neutral-900">
            {metrics.newCount}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200 p-4 space-y-1 shadow-2xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 block">
            Site Visits
          </span>
          <div className="text-2xl font-bold text-neutral-900">
            {metrics.siteVisits}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200 p-4 space-y-1 shadow-2xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 block">
            Quotes Sent
          </span>
          <div className="text-2xl font-bold text-neutral-900">
            {metrics.quotationSent}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200 p-4 space-y-1 shadow-2xs col-span-2 sm:col-span-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 block">
            Confirmed / Done
          </span>
          <div className="text-2xl font-bold text-neutral-900">
            {metrics.confirmed}
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-4 shadow-2xs flex flex-col md:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by customer name, phone, item, or details..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white transition-all"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center space-x-2">
          <Filter className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white"
          >
            <option value="All">All Statuses</option>
            {ENQUIRY_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* Type Filter */}
        <div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full md:w-auto px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white"
          >
            <option value="All">All Enquiry Types</option>
            {ENQUIRY_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Enquiries List */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <LoadingSpinner size="lg" message="Loading customer enquiries..." />
        </div>
      ) : filteredEnquiries.length === 0 ? (
        <div className="bg-white rounded-3xl border border-neutral-200 p-12 text-center space-y-3 shadow-2xs">
          <Inbox className="w-12 h-12 text-neutral-400 mx-auto" />
          <h3 className="text-base font-bold text-neutral-900">
            No Enquiries Found
          </h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            {searchTerm || statusFilter !== 'All' || typeFilter !== 'All'
              ? 'No customer enquiries match your current search or status filter.'
              : 'Incoming customer enquiries from the website and custom quotation forms will appear here.'}
          </p>
          {(searchTerm || statusFilter !== 'All' || typeFilter !== 'All') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('All');
                setTypeFilter('All');
              }}
              className="px-4 py-2 text-xs font-semibold text-neutral-800 border border-neutral-300 rounded-xl hover:bg-neutral-50"
            >
              Clear All Filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEnquiries.map((enquiry) => {
            const customerPhoneClean = (enquiry.phone || '').replace(
              /[^\d+]/g,
              ''
            );
            const waGreeting = `Hello ${enquiry.customerName || 'Customer'}, thank you for contacting Sleep Star Furniture regarding your ${enquiry.enquiryType || 'enquiry'}${
              enquiry.relatedItemName ? ` for "${enquiry.relatedItemName}"` : ''
            }. We would be delighted to assist you with design details, pricing, and scheduling a site survey.`;
            const waReplyUrl = formatWhatsAppLink(
              customerPhoneClean,
              waGreeting
            );
            const refPhoto =
              enquiry.referenceImageUrl || enquiry.imageUrl || '';

            return (
              <div
                key={enquiry.id}
                className="bg-white rounded-3xl border border-neutral-200 p-5 sm:p-6 shadow-2xs space-y-4 transition-all hover:border-neutral-300"
              >
                {/* Header row: Name, Badge, Date, Delete */}
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-neutral-100 pb-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-base font-bold text-neutral-900">
                      {enquiry.customerName}
                    </span>

                    <span
                      className={`text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full ${getStatusBadgeClass(
                        enquiry.status
                      )}`}
                    >
                      {enquiry.status}
                    </span>

                    <span className="text-[10px] font-semibold text-neutral-700 bg-neutral-100 px-2 py-0.5 rounded-md">
                      {enquiry.enquiryType}
                    </span>
                  </div>

                  <div className="flex items-center space-x-3 text-xs text-neutral-500">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5 text-neutral-400" />
                      <span>{formatEnquiryDate(enquiry.createdAt)}</span>
                    </span>

                    <button
                      type="button"
                      onClick={() => setEnquiryToDelete(enquiry)}
                      className="p-1 text-neutral-400 hover:text-red-600 transition-colors"
                      title="Delete enquiry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Middle details: Contact links & Requirements */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                  {/* Left: Contact actions & Item info (5 cols) */}
                  <div className="lg:col-span-5 space-y-3">
                    {/* Direct Contact Buttons */}
                    <div className="flex flex-wrap items-center gap-2">
                      {/* WhatsApp reply button */}
                      <a
                        href={waReplyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-neutral-900 text-white text-xs font-semibold hover:bg-neutral-800 transition-colors shadow-2xs"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Reply on WhatsApp</span>
                      </a>

                      {/* Phone call button */}
                      <a
                        href={`tel:${customerPhoneClean}`}
                        className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl border border-neutral-300 bg-neutral-50 text-neutral-800 text-xs font-semibold hover:bg-neutral-100 transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5 text-neutral-600" />
                        <span>{enquiry.phone}</span>
                      </a>
                    </div>

                    {/* Email if present */}
                    {enquiry.email && (
                      <div className="flex items-center space-x-1.5 text-xs text-neutral-600">
                        <Mail className="w-3.5 h-3.5 text-neutral-400" />
                        <a
                          href={`mailto:${enquiry.email}`}
                          className="hover:underline text-neutral-900 font-medium"
                        >
                          {enquiry.email}
                        </a>
                      </div>
                    )}

                    {/* Related Item Name */}
                    {enquiry.relatedItemName && (
                      <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-xs">
                        <span className="font-semibold text-neutral-500 uppercase tracking-wider text-[10px] block">
                          Related Design / Item:
                        </span>
                        <span className="font-bold text-neutral-900">
                          {enquiry.relatedItemName}
                        </span>
                        {enquiry.relatedItemId && (
                          <span className="text-[10px] text-neutral-400 block">
                            ID: {enquiry.relatedItemId}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Reference photo preview if attached */}
                    {refPhoto && (
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase font-semibold text-neutral-500 tracking-wider block">
                          Customer Reference Photo / Floorplan:
                        </span>
                        <div className="relative group w-32 h-24 rounded-xl overflow-hidden border border-neutral-200 bg-neutral-100">
                          <img
                            src={refPhoto}
                            alt="Reference"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform cursor-pointer"
                            onClick={() => setLightboxImage(refPhoto)}
                          />
                          <button
                            type="button"
                            onClick={() => setLightboxImage(refPhoto)}
                            className="absolute inset-0 bg-neutral-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-semibold transition-opacity"
                          >
                            <Eye className="w-4 h-4 mr-1" /> View
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right: Requirements & Admin Notes (7 cols) */}
                  <div className="lg:col-span-7 space-y-3">
                    {/* Requirements Message */}
                    <div className="p-3.5 rounded-2xl bg-neutral-50/80 border border-neutral-200 space-y-1">
                      <span className="text-[10px] uppercase font-semibold text-neutral-500 tracking-wider block">
                        Customer Message / Location Requirements:
                      </span>
                      <p className="text-xs text-neutral-800 whitespace-pre-line leading-relaxed">
                        {enquiry.message || 'No specific description provided.'}
                      </p>
                    </div>

                    {/* Internal Notes / Remarks Field */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex justify-between items-center text-xs">
                        <label className="font-semibold uppercase tracking-wider text-[10px] text-neutral-600">
                          Internal Admin Notes & Follow-up Log:
                        </label>
                        {notesState[enquiry.id] !== (enquiry.notes || '') && (
                          <span className="text-[10px] text-amber-600 font-semibold">
                            Unsaved changes
                          </span>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="e.g. Called on 10th; scheduled site survey for Saturday 11am; customer wants teak finish..."
                          value={notesState[enquiry.id] || ''}
                          onChange={(e) =>
                            setNotesState({
                              ...notesState,
                              [enquiry.id]: e.target.value,
                            })
                          }
                          className="flex-1 px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white"
                        />

                        <button
                          type="button"
                          onClick={() => handleSaveNotes(enquiry.id)}
                          disabled={savingNotesId === enquiry.id}
                          className="px-3 py-2 rounded-xl bg-neutral-900 text-white text-xs font-semibold hover:bg-neutral-800 disabled:opacity-50 transition-colors cursor-pointer flex items-center space-x-1"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>
                            {savingNotesId === enquiry.id ? 'Saving...' : 'Save'}
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* Status Changer Dropdown */}
                    <div className="pt-2 flex items-center justify-between border-t border-neutral-100">
                      <span className="text-xs font-semibold text-neutral-600">
                        Update Pipeline Status:
                      </span>
                      <div className="relative">
                        <select
                          value={enquiry.status}
                          onChange={(e) =>
                            handleStatusChange(enquiry.id, e.target.value)
                          }
                          className="text-xs font-semibold py-1.5 pl-3 pr-8 rounded-xl bg-white border border-neutral-300 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900 cursor-pointer shadow-2xs"
                        >
                          {ENQUIRY_STATUSES.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Lightbox Modal for Reference Image */}
      {lightboxImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl overflow-hidden max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl">
            <div className="p-4 border-b border-neutral-200 flex justify-between items-center">
              <span className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                Customer Reference Photograph
              </span>
              <div className="flex items-center space-x-2">
                <a
                  href={lightboxImage}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 text-neutral-500 hover:text-neutral-900 rounded-lg"
                  title="Open in new tab"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
                <button
                  type="button"
                  onClick={() => setLightboxImage(null)}
                  className="p-1.5 text-neutral-500 hover:text-neutral-900 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-4 flex-1 overflow-auto bg-neutral-100 flex items-center justify-center">
              <img
                src={lightboxImage}
                alt="Enquiry Full Resolution"
                className="max-h-[75vh] max-w-full object-contain rounded-xl shadow-sm"
              />
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {enquiryToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl border border-neutral-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-neutral-900">
              Confirm Enquiry Deletion
            </h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Are you sure you want to permanently delete the enquiry from{' '}
              <span className="font-bold text-neutral-900">
                {enquiryToDelete.customerName}
              </span>
              ? This will also remove any uploaded reference photographs from storage.
            </p>
            <div className="pt-2 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setEnquiryToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl border border-neutral-300 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteEnquiry}
                disabled={isDeleting}
                className="px-5 py-2 rounded-xl bg-red-600 text-white text-xs font-semibold hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
