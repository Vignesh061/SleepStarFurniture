import React, { useState, useEffect, useMemo } from 'react';
import {
  Tag,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Sparkles,
  Calendar,
  Percent,
  Package,
  Layers,
  ArrowRight,
  ExternalLink,
  RefreshCw,
  X,
} from 'lucide-react';
import { offerService } from '../../services/offerService';
import { productService } from '../../services/productService';
import { formatCurrency } from '../../utils/formatters';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const AdminOffers = () => {
  const [offers, setOffers] = useState(() => {
    try {
      const data = offerService.getCachedOrDefaults();
      return Array.isArray(data) ? data : [];
    } catch (_) {
      return [];
    }
  });
  const [products, setProducts] = useState(() => {
    try {
      const data = productService.getCachedOrDefaults();
      return Array.isArray(data) ? data : [];
    } catch (_) {
      return [];
    }
  });
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [successNotice, setSuccessNotice] = useState('');

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All'); // 'All', 'Active', 'Inactive'

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [saving, setSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    discountPercentage: '',
    offerPrice: '',
    regularPrice: '',
    productId: '',
    code: '',
    isActive: true,
    isFeatured: false,
    displayOrder: 1,
  });

  // Delete Modal
  const [offerToDelete, setOfferToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadData = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);
    setError('');

    try {
      const [offersData, productsData] = await Promise.all([
        offerService.getAll(),
        productService.getAll(),
      ]);
      setOffers(offersData);
      setProducts(productsData);
    } catch (err) {
      console.error('Error loading offers or products:', err);
      setError('Failed to load offers. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showNotice = (msg) => {
    setSuccessNotice(msg);
    setTimeout(() => setSuccessNotice(''), 4000);
  };

  const handleOpenCreateModal = () => {
    setEditingOffer(null);
    setFormData({
      title: '',
      description: '',
      discountPercentage: '',
      offerPrice: '',
      regularPrice: '',
      productId: '',
      code: '',
      isActive: true,
      isFeatured: false,
      displayOrder: offers.length + 1,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (offer) => {
    setEditingOffer(offer);
    setFormData({
      title: offer.title || '',
      description: offer.description || '',
      discountPercentage: offer.discountPercentage !== undefined ? offer.discountPercentage : '',
      offerPrice: offer.offerPrice !== undefined ? offer.offerPrice : '',
      regularPrice: offer.regularPrice !== undefined ? offer.regularPrice : '',
      productId: offer.productId || '',
      code: offer.code || '',
      isActive: offer.isActive !== undefined ? offer.isActive : true,
      isFeatured: Boolean(offer.isFeatured),
      displayOrder: offer.displayOrder || 1,
    });
    setIsModalOpen(true);
  };

  const handleProductSelect = (productId) => {
    const selectedProd = products.find((p) => p.id === productId);
    if (selectedProd) {
      setFormData((prev) => ({
        ...prev,
        productId,
        regularPrice: selectedProd.regularPrice || prev.regularPrice,
        offerPrice: selectedProd.offerPrice || prev.offerPrice,
      }));
    } else {
      setFormData((prev) => ({ ...prev, productId }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('Please provide an offer title.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      if (editingOffer) {
        await offerService.update(editingOffer.id, formData);
        showNotice(`Offer "${formData.title}" updated successfully.`);
      } else {
        await offerService.create(formData);
        showNotice(`Promotional campaign "${formData.title}" created.`);
      }
      setIsModalOpen(false);
      await loadData();
    } catch (err) {
      console.error('Error saving offer:', err);
      setError(err.message || 'Failed to save offer.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (offer) => {
    try {
      await offerService.toggleActive(offer.id, offer.isActive);
      setOffers((prev) =>
        prev.map((o) => (o.id === offer.id ? { ...o, isActive: !o.isActive } : o))
      );
      showNotice(
        `Offer "${offer.title}" ${offer.isActive ? 'deactivated' : 'activated'}.`
      );
    } catch (err) {
      console.error('Error toggling offer:', err);
      setError('Could not update offer status.');
    }
  };

  const handleDelete = async () => {
    if (!offerToDelete) return;
    const targetId = offerToDelete.id;

    // 1. Instantly remove from UI & close modal (0ms)
    setOffers((prev) => prev.filter((o) => o.id !== targetId));
    setOfferToDelete(null);
    showNotice('Offer deleted.');

    // 2. Perform background delete
    try {
      await offerService.delete(targetId);
    } catch (err) {
      console.warn('Delete warning:', err);
    }
  };

  // Filtered
  const filteredOffers = useMemo(() => {
    return offers.filter((o) => {
      const matchSearch =
        !searchTerm ||
        o.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.description?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus =
        statusFilter === 'All'
          ? true
          : statusFilter === 'Active'
          ? o.isActive
          : !o.isActive;

      return matchSearch && matchStatus;
    });
  }, [offers, searchTerm, statusFilter]);

  const activeCount = offers.filter((o) => o.isActive).length;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">
            <Tag className="w-3.5 h-3.5" />
            <span>Promotions & Campaigns</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900">
            Offers & Discount Management
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Configure seasonal campaigns, assign discounts to products, and manage promo codes.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            type="button"
            onClick={() => loadData(true)}
            disabled={refreshing}
            className="p-2.5 rounded-xl border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50 text-xs font-semibold disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw
              className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`}
            />
          </button>

          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-neutral-900 text-white text-xs font-semibold hover:bg-neutral-800 transition-colors shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Promotional Offer</span>
          </button>
        </div>
      </div>

      {/* Global Alerts */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start space-x-2 text-xs text-red-700 animate-fadeIn">
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

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-neutral-200 p-4 space-y-1 shadow-2xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 block">
            Total Campaigns
          </span>
          <div className="text-2xl font-bold text-neutral-900">{offers.length}</div>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200 p-4 space-y-1 shadow-2xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 block">
            Active Campaigns
          </span>
          <div className="text-2xl font-bold text-neutral-900">{activeCount}</div>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200 p-4 space-y-1 shadow-2xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 block">
            Catalogue Products
          </span>
          <div className="text-2xl font-bold text-neutral-900">{products.length}</div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-4 shadow-2xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search offers by title, promo code, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active Only</option>
            <option value="Inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Offers Table / Cards */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <LoadingSpinner size="lg" message="Loading promotional campaigns..." />
        </div>
      ) : filteredOffers.length === 0 ? (
        <div className="bg-white rounded-3xl border border-neutral-200 p-12 text-center space-y-4 shadow-2xs">
          <Tag className="w-12 h-12 text-neutral-400 mx-auto" />
          <div className="space-y-1 max-w-sm mx-auto">
            <h3 className="text-base font-bold text-neutral-900">
              No Promotional Offers Found
            </h3>
            <p className="text-xs text-neutral-500">
              Create a custom campaign or festival discount for your showroom.
            </p>
          </div>
          <div className="pt-2 flex justify-center gap-3">
            <button
              onClick={handleOpenCreateModal}
              className="px-4 py-2 rounded-xl bg-neutral-900 text-white text-xs font-semibold hover:bg-neutral-800"
            >
              Create New Offer
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOffers.map((offer) => {
            const matchedProduct = offer.productId
              ? products.find((p) => p.id === offer.productId)
              : null;

            return (
              <div
                key={offer.id}
                className="bg-white rounded-3xl border border-neutral-200 p-6 shadow-2xs flex flex-col justify-between space-y-4 hover:border-neutral-300 transition-all"
              >
                <div className="space-y-3">
                  {/* Top tags row */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                        offer.isActive
                          ? 'bg-neutral-900 text-white'
                          : 'bg-neutral-200 text-neutral-600'
                      }`}
                    >
                      {offer.isActive ? 'Active' : 'Inactive'}
                    </span>

                    {offer.isFeatured && (
                      <span className="text-[10px] font-bold text-neutral-900 bg-neutral-100 border border-neutral-300 px-2 py-0.5 rounded-md flex items-center space-x-1">
                        <Sparkles className="w-3 h-3 text-neutral-900" />
                        <span>Featured</span>
                      </span>
                    )}
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-base font-bold text-neutral-900 line-clamp-1">
                      {offer.title}
                    </h3>
                    {offer.description && (
                      <p className="text-xs text-neutral-600 line-clamp-2 mt-1 leading-relaxed">
                        {offer.description}
                      </p>
                    )}
                  </div>

                  {/* Discount / Pricing Details */}
                  <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-1.5 text-xs">
                    {offer.discountPercentage !== undefined &&
                      offer.discountPercentage !== '' && (
                        <div className="flex justify-between items-center font-bold text-neutral-900">
                          <span className="text-neutral-500 font-normal">
                            Discount Rate:
                          </span>
                          <span className="text-base">
                            {offer.discountPercentage}% OFF
                          </span>
                        </div>
                      )}

                    {offer.offerPrice && (
                      <div className="flex justify-between items-center">
                        <span className="text-neutral-500">Deal Price:</span>
                        <span className="font-bold text-neutral-900">
                          {formatCurrency(offer.offerPrice)}
                        </span>
                      </div>
                    )}

                    {offer.code && (
                      <div className="flex justify-between items-center pt-1 border-t border-neutral-200">
                        <span className="text-neutral-500">Promo Code:</span>
                        <span className="font-mono font-bold text-neutral-900 bg-neutral-200 px-1.5 py-0.5 rounded text-[11px]">
                          {offer.code}
                        </span>
                      </div>
                    )}

                    {matchedProduct && (
                      <div className="flex items-center space-x-1.5 pt-1 text-[11px] text-neutral-600">
                        <Package className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
                        <span className="truncate">
                          Applies to: <strong>{matchedProduct.name}</strong>
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-neutral-100 flex items-center justify-between">
                  {/* Toggle Active Switch */}
                  <button
                    type="button"
                    onClick={() => handleToggleActive(offer)}
                    className="text-xs font-semibold text-neutral-700 hover:text-neutral-900 flex items-center space-x-1"
                  >
                    <span>{offer.isActive ? 'Deactivate' : 'Activate'}</span>
                  </button>

                  <div className="flex items-center space-x-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(offer)}
                      className="p-1.5 text-neutral-500 hover:text-neutral-900 rounded-lg hover:bg-neutral-100 transition-colors"
                      title="Edit Offer"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setOfferToDelete(offer)}
                      className="p-1.5 text-neutral-500 hover:text-red-600 rounded-lg hover:bg-neutral-100 transition-colors"
                      title="Delete Offer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl border border-neutral-200 shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-neutral-200 flex justify-between items-center bg-white">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 block">
                  {editingOffer ? 'Modify Campaign' : 'New Promotional Campaign'}
                </span>
                <h3 className="text-lg font-bold text-neutral-900">
                  {editingOffer ? 'Edit Offer' : 'Create Offer'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-neutral-400 hover:text-neutral-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
              {/* Title */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1.5">
                  Campaign / Offer Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="e.g. Diwali Woodwork Festival Sale"
                  className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1.5">
                  Description / Terms
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Details of the offer, material warranty, or terms..."
                  className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white"
                />
              </div>

              {/* Discount % & Promo Code */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1.5">
                    Discount Percentage (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.discountPercentage}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        discountPercentage: e.target.value,
                      })
                    }
                    placeholder="e.g. 15"
                    className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1.5">
                    Promo Code (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        code: e.target.value.toUpperCase(),
                      })
                    }
                    placeholder="e.g. STAR15"
                    className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white font-mono"
                  />
                </div>
              </div>

              {/* Assign to Specific Product */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1.5">
                  Assign to Specific Product (Optional)
                </label>
                <select
                  value={formData.productId}
                  onChange={(e) => handleProductSelect(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white"
                >
                  <option value="">-- Applies to General Collection --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({formatCurrency(p.regularPrice)})
                    </option>
                  ))}
                </select>
              </div>

              {/* Pricing Overrides if assigning product */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1.5">
                    Regular Price (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.regularPrice}
                    onChange={(e) =>
                      setFormData({ ...formData, regularPrice: e.target.value })
                    }
                    placeholder="e.g. 45000"
                    className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1.5">
                    Offer Deal Price (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.offerPrice}
                    onChange={(e) =>
                      setFormData({ ...formData, offerPrice: e.target.value })
                    }
                    placeholder="e.g. 38250"
                    className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <label className="flex items-center space-x-2 text-xs font-medium text-neutral-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.checked })
                    }
                    className="rounded text-neutral-900 focus:ring-neutral-900"
                  />
                  <span>Active Offer</span>
                </label>

                <label className="flex items-center space-x-2 text-xs font-medium text-neutral-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) =>
                      setFormData({ ...formData, isFeatured: e.target.checked })
                    }
                    className="rounded text-neutral-900 focus:ring-neutral-900"
                  />
                  <span>Featured Campaign</span>
                </label>
              </div>

              {/* Submit Row */}
              <div className="pt-4 border-t border-neutral-200 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-neutral-300 text-neutral-700 text-xs font-semibold hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-neutral-900 text-white text-xs font-semibold hover:bg-neutral-800 disabled:opacity-50 cursor-pointer"
                >
                  {saving ? 'Saving...' : editingOffer ? 'Save Changes' : 'Create Offer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {offerToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl border border-neutral-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-neutral-900">
              Confirm Offer Deletion
            </h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Are you sure you want to permanently remove{' '}
              <span className="font-bold text-neutral-900">
                "{offerToDelete.title}"
              </span>
              ?
            </p>
            <div className="pt-2 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setOfferToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl border border-neutral-300 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-5 py-2 rounded-xl bg-red-600 text-white text-xs font-semibold hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete Offer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
