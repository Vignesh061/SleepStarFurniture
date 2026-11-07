import React, { useState, useEffect } from 'react';
import {
  Layers,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Sparkles,
  RefreshCw,
  X,
  Image as ImageIcon,
} from 'lucide-react';
import { categoryService, DEFAULT_FURNITURE_CATEGORIES } from '../../services/categoryService';
import { ImageUploader } from '../../components/common/ImageUploader';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { formatDate } from '../../utils/formatters';

export const AdminCategories = () => {
  const [categories, setCategories] = useState(() => {
    try {
      const data = categoryService.getCachedOrDefaults();
      return Array.isArray(data) ? data : DEFAULT_FURNITURE_CATEGORIES;
    } catch (_) {
      return DEFAULT_FURNITURE_CATEGORIES;
    }
  });
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    imageUrl: '',
    isActive: true,
    displayOrder: 1,
  });

  // Delete confirmation
  const [deleteId, setDeleteId] = useState(null);
  const [deleteWarning, setDeleteWarning] = useState('');

  const loadCategories = async () => {
    try {
      setError(null);
      const data = await categoryService.getAllForAdmin();
      setCategories(data);
    } catch (err) {
      console.error('Failed to load categories:', err);
      setError('Failed to fetch categories. Please check Firestore permissions.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadCategories();
  };

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      imageUrl: '',
      isActive: true,
      displayOrder: categories.length + 1,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (cat) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name || '',
      slug: cat.slug || '',
      description: cat.description || '',
      imageUrl: cat.imageUrl || '',
      isActive: cat.isActive !== false,
      displayOrder: cat.displayOrder || 1,
    });
    setIsModalOpen(true);
  };

  const handleNameChange = (e) => {
    const val = e.target.value;
    const autoSlug = val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    setFormData((prev) => ({
      ...prev,
      name: val,
      // only auto-update slug if not manually edited or empty
      slug: !editingCategory ? autoSlug : prev.slug,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setSubmitting(true);
    setError(null);

    try {
      if (editingCategory) {
        await categoryService.update(editingCategory.id, formData);
        setSuccessMsg(`Category "${formData.name}" updated successfully.`);
      } else {
        await categoryService.create(formData);
        setSuccessMsg(`Category "${formData.name}" created successfully.`);
      }
      setIsModalOpen(false);
      await loadCategories();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error('Save category error:', err);
      setError(err.message || 'Failed to save category.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (cat) => {
    try {
      const nextActive = !cat.isActive;
      await categoryService.update(cat.id, { isActive: nextActive });
      setCategories((prev) =>
        prev.map((c) => (c.id === cat.id ? { ...c, isActive: nextActive } : c))
      );
    } catch (err) {
      console.error('Toggle category active error:', err);
    }
  };

  const handlePromptDelete = async (cat) => {
    setDeleteId(cat.id);
    const canDelete = await categoryService.canDeleteCategory(cat.id);
    if (!canDelete) {
      setDeleteWarning(
        `Warning: Products currently reference "${cat.name}". Deleting may orphan those items.`
      );
    } else {
      setDeleteWarning('');
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    const targetId = deleteId;

    // 1. Instantly remove from UI & close modal (0ms)
    setCategories((prev) => prev.filter((c) => c.id !== targetId));
    setDeleteId(null);
    setDeleteWarning('');
    setSuccessMsg('Category deleted successfully.');
    setTimeout(() => setSuccessMsg(''), 3000);

    // 2. Background delete
    try {
      await categoryService.delete(targetId);
    } catch (err) {
      console.warn('Background delete warning:', err);
    }
  };

  // Filtered categories
  const filteredCategories = categories.filter((c) => {
    const q = searchQuery.toLowerCase();
    return (
      c.name?.toLowerCase().includes(q) ||
      c.slug?.toLowerCase().includes(q) ||
      c.description?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-neutral-200 shadow-2xs">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 tracking-tight">
            Furniture Categories
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Manage product collections (Dining Sets, Cots & Beds, Wardrobes, TV Units)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 rounded-lg border border-neutral-300 bg-white text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 transition-colors shadow-2xs"
            title="Refresh categories"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={openCreateModal}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-neutral-900 text-white text-xs font-semibold hover:bg-neutral-800 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Category</span>
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

      {/* Search & Filters */}
      <div className="flex items-center space-x-3 bg-white p-3 rounded-xl border border-neutral-200">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search categories by name, slug or description..."
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

      {/* Category List / Table */}
      {loading ? (
        <div className="py-16 bg-white rounded-2xl border border-neutral-200 flex justify-center">
          <LoadingSpinner text="Loading categories from Firestore..." />
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-neutral-200 space-y-3">
          <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mx-auto text-neutral-400">
            <Layers className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-neutral-900">
            {searchQuery ? 'No categories matching your search' : 'No categories configured yet'}
          </h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            {searchQuery
              ? 'Try searching with a different term.'
              : 'Add your primary furniture collections to organize your showroom inventory.'}
          </p>
          {!searchQuery && (
            <div className="pt-2 flex justify-center gap-3">
              <button
                onClick={openCreateModal}
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-neutral-900 text-white text-xs font-semibold hover:bg-neutral-800 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Custom Category</span>
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
                  <th className="py-3 px-4">Display</th>
                  <th className="py-3 px-4">Category Name</th>
                  <th className="py-3 px-4">Slug</th>
                  <th className="py-3 px-4">Order</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredCategories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-neutral-50/60 transition-colors">
                    {/* Thumbnail */}
                    <td className="py-3 px-4">
                      {cat.imageUrl ? (
                        <img
                          src={cat.imageUrl}
                          alt={cat.name}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=600&auto=format&fit=crop&q=80';
                          }}
                          className="w-10 h-10 rounded-lg object-cover border border-neutral-200"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-400">
                          <ImageIcon className="w-4 h-4" />
                        </div>
                      )}
                    </td>

                    {/* Name & description */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-neutral-900 text-sm">{cat.name}</div>
                      {cat.description && (
                        <p className="text-neutral-500 text-[11px] max-w-sm truncate mt-0.5">
                          {cat.description}
                        </p>
                      )}
                    </td>

                    {/* Slug */}
                    <td className="py-3 px-4 font-mono text-[11px] text-neutral-500">
                      {cat.slug || '—'}
                    </td>

                    {/* Order */}
                    <td className="py-3 px-4 font-medium text-neutral-700">
                      {cat.displayOrder || 1}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleToggleActive(cat)}
                        className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-semibold transition-colors ${
                          cat.isActive
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300'
                        }`}
                        title="Click to toggle active status"
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            cat.isActive ? 'bg-emerald-600' : 'bg-neutral-500'
                          }`}
                        />
                        <span>{cat.isActive ? 'Active' : 'Hidden'}</span>
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => openEditModal(cat)}
                          className="p-1.5 rounded-md text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
                          title="Edit category"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handlePromptDelete(cat)}
                          className="p-1.5 rounded-md text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Delete category"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-neutral-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <h3 className="text-base font-bold text-neutral-900">
                {editingCategory ? 'Edit Category' : 'Create New Category'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-neutral-400 hover:text-neutral-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1.5">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleNameChange}
                  placeholder="e.g. Dining Sets, Cots & Beds, Wardrobes"
                  className="w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1.5">
                  Slug (URL parameter)
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="dining-sets"
                  className="w-full px-3 py-2 text-sm font-mono bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1.5">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief summary of items in this category..."
                  className="w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white"
                />
              </div>

              {/* Image Uploader */}
              <ImageUploader
                label="Category Cover Image"
                helperText="Upload a representative banner for this collection (max 1 image)"
                images={formData.imageUrl ? [formData.imageUrl] : []}
                coverImage={formData.imageUrl}
                maxImages={1}
                allowMultiple={false}
                uploadFolder="categories"
                onChangeImages={(imgs) => setFormData({ ...formData, imageUrl: imgs[0] || '' })}
                onChangeCoverImage={(img) => setFormData({ ...formData, imageUrl: img })}
              />

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1.5">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={formData.displayOrder}
                    onChange={(e) =>
                      setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 1 })
                    }
                    className="w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white"
                  />
                </div>

                <div className="flex flex-col justify-end">
                  <label className="flex items-center space-x-2 cursor-pointer pb-2.5">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-4 h-4 rounded text-neutral-900 focus:ring-neutral-900 border-neutral-300"
                    />
                    <span className="text-xs font-semibold text-neutral-800">
                      Active & Visible on Site
                    </span>
                  </label>
                </div>
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
                  {submitting ? 'Saving...' : editingCategory ? 'Update Category' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-xl max-w-sm w-full p-6 space-y-4">
            <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
              <Trash2 className="w-5 h-5" />
            </div>

            <div>
              <h3 className="text-base font-bold text-neutral-900">Delete Category</h3>
              <p className="text-xs text-neutral-500 mt-1">
                Are you sure you want to delete this category? This action cannot be undone.
              </p>
              {deleteWarning && (
                <div className="mt-2.5 p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-[11px]">
                  {deleteWarning}
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setDeleteId(null)}
                className="px-3.5 py-1.5 rounded-lg border border-neutral-300 text-neutral-700 text-xs font-semibold hover:bg-neutral-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-1.5 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
