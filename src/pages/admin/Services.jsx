import React, { useState, useEffect } from 'react';
import {
  Wrench,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  RefreshCw,
  X,
  Star,
  Image as ImageIcon,
} from 'lucide-react';
import { serviceService } from '../../services/serviceService';
import { ImageUploader } from '../../components/common/ImageUploader';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { formatCurrency } from '../../utils/formatters';

export const AdminServices = () => {
  const [services, setServices] = useState(() => {
    try {
      const data = serviceService.getCachedOrDefaults();
      return Array.isArray(data) ? data : [];
    } catch (_) {
      return [];
    }
  });
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    name: '',
    description: '',
    startingPrice: '',
    features: '',
    highlights: '',
    coverImage: '',
    images: [],
    isActive: true,
    isFeatured: false,
    displayOrder: 1,
  });

  // Delete State
  const [deleteItem, setDeleteItem] = useState(null);

  const loadServices = async () => {
    try {
      setError(null);
      const data = await serviceService.getAllForAdmin();
      setServices(data);
    } catch (err) {
      console.error('Error fetching services:', err);
      setError('Could not load services from Firestore.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadServices();
  };

  const openCreateModal = () => {
    setEditingService(null);
    setFormData({
      title: '',
      name: '',
      description: '',
      startingPrice: '',
      features: '',
      highlights: '',
      coverImage: '',
      images: [],
      isActive: true,
      isFeatured: false,
      displayOrder: services.length + 1,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (srv) => {
    setEditingService(srv);
    setFormData({
      title: srv.title || srv.name || '',
      name: srv.name || srv.title || '',
      description: srv.description || '',
      startingPrice: srv.startingPrice || srv.price || '',
      features: typeof srv.features === 'string' ? srv.features : '',
      highlights: typeof srv.highlights === 'string' ? srv.highlights : '',
      coverImage: srv.coverImage || srv.imageUrl || (srv.images && srv.images[0]) || '',
      images: Array.isArray(srv.images) ? srv.images : [],
      isActive: srv.isActive !== false,
      isFeatured: Boolean(srv.isFeatured),
      displayOrder: srv.displayOrder || 1,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    setSubmitting(true);
    setError(null);

    const priceNum = formData.startingPrice ? parseFloat(formData.startingPrice) : 0;

    const payload = {
      ...formData,
      name: formData.title.trim(),
      title: formData.title.trim(),
      startingPrice: !isNaN(priceNum) && priceNum >= 0 ? priceNum : 0,
      coverImage: formData.coverImage || (formData.images && formData.images[0]) || '',
    };

    try {
      if (editingService) {
        await serviceService.update(editingService.id, payload);
        setSuccessMsg(`Service "${formData.title}" updated successfully.`);
      } else {
        await serviceService.create(payload);
        setSuccessMsg(`Service "${formData.title}" created successfully.`);
      }

      setIsModalOpen(false);
      await loadServices();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error('Save service error:', err);
      setError(err.message || 'Failed to save service.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (srv) => {
    try {
      const nextState = !srv.isActive;
      await serviceService.update(srv.id, { isActive: nextState });
      setServices((prev) =>
        prev.map((s) => (s.id === srv.id ? { ...s, isActive: nextState } : s))
      );
    } catch (err) {
      console.error('Toggle service active error:', err);
    }
  };

  const handleToggleFeatured = async (srv) => {
    try {
      const nextState = !srv.isFeatured;
      await serviceService.update(srv.id, { isFeatured: nextState });
      setServices((prev) =>
        prev.map((s) => (s.id === srv.id ? { ...s, isFeatured: nextState } : s))
      );
    } catch (err) {
      console.error('Toggle service featured error:', err);
    }
  };

  const confirmDelete = async () => {
    if (!deleteItem) return;
    const targetId = deleteItem.id;
    const targetImages = deleteItem.images || [];

    // 1. Instantly remove from UI & close modal (0ms)
    setServices((prev) => prev.filter((s) => s.id !== targetId));
    setDeleteItem(null);
    setSuccessMsg('Service deleted.');
    setTimeout(() => setSuccessMsg(''), 3000);

    // 2. Perform background delete
    try {
      await serviceService.delete(targetId, targetImages);
    } catch (err) {
      console.warn('Background delete warning:', err);
    }
  };

  const filteredServices = services.filter((srv) => {
    const q = searchQuery.toLowerCase();
    return (
      srv.title?.toLowerCase().includes(q) ||
      srv.name?.toLowerCase().includes(q) ||
      srv.description?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-neutral-200 shadow-2xs">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 tracking-tight">
            Custom Furniture & Interior Services
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Manage Modular Kitchens, Custom Wardrobes, TV Units, and on-site interior installation offerings
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 rounded-lg border border-neutral-300 bg-white text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 transition-colors shadow-2xs"
            title="Refresh services"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={openCreateModal}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-neutral-900 text-white text-xs font-semibold hover:bg-neutral-800 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Service</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center space-x-2 text-emerald-800 text-xs animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-2 text-red-800 text-xs">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Search */}
      <div className="flex items-center space-x-3 bg-white p-3 rounded-xl border border-neutral-200">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search custom services by name or description..."
            className="w-full pl-9 pr-3 py-1.5 text-xs text-neutral-900 placeholder-neutral-400 bg-transparent focus:outline-none"
          />
        </div>
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="text-xs text-neutral-400 hover:text-neutral-700 px-2"
          >
            Clear
          </button>
        )}
      </div>

      {/* Services List / Table */}
      {loading ? (
        <div className="py-20 bg-white rounded-2xl border border-neutral-200 flex justify-center">
          <LoadingSpinner text="Loading custom services from Firestore..." />
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-neutral-200 space-y-3">
          <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mx-auto text-neutral-400">
            <Wrench className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-neutral-900">
            {searchQuery ? 'No services match your search' : 'No custom services added yet'}
          </h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            {searchQuery
              ? 'Try searching with a different term.'
              : 'Add your custom interior offerings (Modular Kitchens, Custom Wardrobes, etc.).'}
          </p>
          {!searchQuery && (
            <div className="pt-2 flex justify-center gap-3">
              <button
                onClick={openCreateModal}
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-neutral-900 text-white text-xs font-semibold hover:bg-neutral-800 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Custom Service</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Image</th>
                  <th className="py-3 px-4">Service Name</th>
                  <th className="py-3 px-4">Starting Price</th>
                  <th className="py-3 px-4">Featured</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredServices.map((srv) => {
                  const cover =
                    srv.coverImage ||
                    srv.imageUrl ||
                    (srv.images && srv.images[0]) ||
                    '';

                  return (
                    <tr key={srv.id} className="hover:bg-neutral-50/60 transition-colors">
                      <td className="py-3 px-4">
                        {cover ? (
                          <img
                            src={cover}
                            alt={srv.title}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&auto=format&fit=crop&q=80';
                            }}
                            className="w-12 h-12 rounded-lg object-cover border border-neutral-200"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-400">
                            <ImageIcon className="w-5 h-5" />
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-neutral-900 text-sm">
                          {srv.title || srv.name}
                        </div>
                        {srv.description && (
                          <p className="text-neutral-500 text-[11px] max-w-md truncate mt-0.5">
                            {srv.description}
                          </p>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        {srv.startingPrice ? (
                          <div className="font-bold text-neutral-900 text-sm">
                            From {formatCurrency(srv.startingPrice)}
                          </div>
                        ) : (
                          <span className="text-neutral-400">On Inspection</span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleToggleFeatured(srv)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            srv.isFeatured
                              ? 'text-amber-500 bg-amber-50 hover:bg-amber-100'
                              : 'text-neutral-300 hover:text-neutral-500 hover:bg-neutral-100'
                          }`}
                          title="Toggle featured showcase"
                        >
                          <Star
                            className={`w-4 h-4 ${srv.isFeatured ? 'fill-amber-400' : ''}`}
                          />
                        </button>
                      </td>

                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleToggleActive(srv)}
                          className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-semibold transition-colors ${
                            srv.isActive
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300'
                          }`}
                          title="Click to toggle visibility"
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              srv.isActive ? 'bg-emerald-600' : 'bg-neutral-500'
                            }`}
                          />
                          <span>{srv.isActive ? 'Active' : 'Hidden'}</span>
                        </button>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => openEditModal(srv)}
                            className="p-1.5 rounded-md text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
                            title="Edit service"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteItem(srv)}
                            className="p-1.5 rounded-md text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Delete service"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create / Edit Service Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-xl max-w-xl w-full max-h-[92vh] flex flex-col overflow-hidden">
            <div className="p-6 border-b border-neutral-200 flex items-center justify-between bg-white z-10">
              <h3 className="text-base font-bold text-neutral-900">
                {editingService ? 'Edit Custom Service' : 'Add Custom Interior Service'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-neutral-400 hover:text-neutral-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1.5">
                  Service Name / Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value, name: e.target.value })
                  }
                  placeholder="e.g. Modular Kitchens, Custom Wardrobes"
                  className="w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1.5">
                  Starting Estimate Price (₹ INR Optional)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-xs font-bold">
                    ₹
                  </span>
                  <input
                    type="number"
                    min={0}
                    value={formData.startingPrice}
                    onChange={(e) =>
                      setFormData({ ...formData, startingPrice: e.target.value })
                    }
                    placeholder="e.g. 65000"
                    className="w-full pl-8 pr-3 py-2 text-sm bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white"
                  />
                </div>
                <p className="text-[10px] text-neutral-500 mt-1">
                  Displayed as "From ₹..." on service cards. Leave empty if quotation-only.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1.5">
                  Service Scope & Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Details of materials, finishes, on-site consultation, and delivery timeline..."
                  className="w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1.5">
                  Features & Inclusions
                </label>
                <textarea
                  rows={2}
                  value={formData.features}
                  onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                  placeholder="e.g. German soft-close fittings, 18mm BWP marine ply, Acrylic shutters, Quartz top"
                  className="w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white"
                />
              </div>

              {/* Multi-image Uploader */}
              <div className="pt-2">
                <ImageUploader
                  label="Service Portfolio Photographs"
                  helperText="Upload reference photos of completed work for this service category (max 8 images)"
                  images={formData.images}
                  coverImage={formData.coverImage}
                  uploadFolder="services"
                  maxImages={8}
                  allowMultiple={true}
                  onChangeImages={(imgs) => {
                    setFormData((prev) => ({
                      ...prev,
                      images: imgs,
                      coverImage:
                        prev.coverImage && imgs.includes(prev.coverImage)
                          ? prev.coverImage
                          : imgs[0] || '',
                    }));
                  }}
                  onChangeCoverImage={(img) => {
                    setFormData((prev) => ({
                      ...prev,
                      coverImage: img,
                    }));
                  }}
                />
              </div>

              {/* Toggles */}
              <div className="pt-3 border-t border-neutral-200 grid grid-cols-2 gap-4">
                <label className="flex items-center space-x-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) =>
                      setFormData({ ...formData, isFeatured: e.target.checked })
                    }
                    className="w-4 h-4 rounded text-neutral-900 focus:ring-neutral-900 border-neutral-300"
                  />
                  <div>
                    <span className="text-xs font-semibold text-neutral-900 block">
                      Feature on Homepage
                    </span>
                    <span className="text-[10px] text-neutral-500 block">
                      Show in homepage services section
                    </span>
                  </div>
                </label>

                <label className="flex items-center space-x-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.checked })
                    }
                    className="w-4 h-4 rounded text-neutral-900 focus:ring-neutral-900 border-neutral-300"
                  />
                  <div>
                    <span className="text-xs font-semibold text-neutral-900 block">
                      Active & Visible
                    </span>
                    <span className="text-[10px] text-neutral-500 block">
                      Live for customer quotation requests
                    </span>
                  </div>
                </label>
              </div>

              <div className="pt-4 border-t border-neutral-200 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-neutral-300 text-neutral-700 text-xs font-semibold hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-lg bg-neutral-900 text-white text-xs font-semibold hover:bg-neutral-800 disabled:opacity-50"
                >
                  {submitting
                    ? 'Saving...'
                    : editingService
                    ? 'Update Service'
                    : 'Create Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-xl max-w-sm w-full p-6 space-y-4">
            <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
              <Trash2 className="w-5 h-5" />
            </div>

            <div>
              <h3 className="text-base font-bold text-neutral-900">Delete Service</h3>
              <p className="text-xs text-neutral-500 mt-1">
                Are you sure you want to delete <span className="font-semibold text-neutral-800">"{deleteItem.title || deleteItem.name}"</span>?
              </p>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setDeleteItem(null)}
                className="px-3.5 py-1.5 rounded-lg border border-neutral-300 text-neutral-700 text-xs font-semibold hover:bg-neutral-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-1.5 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700"
              >
                Delete Service
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
