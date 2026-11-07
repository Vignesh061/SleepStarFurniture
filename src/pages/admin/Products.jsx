import React, { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Sparkles,
  RefreshCw,
  X,
  Star,
  Eye,
  EyeOff,
  Image as ImageIcon,
  IndianRupee,
} from 'lucide-react';
import { productService, DEFAULT_FURNITURE_PRODUCTS } from '../../services/productService';
import { categoryService, DEFAULT_FURNITURE_CATEGORIES } from '../../services/categoryService';
import { ImageUploader } from '../../components/common/ImageUploader';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const AdminProducts = () => {
  const [products, setProducts] = useState(() => {
    try {
      const data = productService.getCachedOrDefaults();
      return Array.isArray(data) ? data : DEFAULT_FURNITURE_PRODUCTS;
    } catch (_) {
      return DEFAULT_FURNITURE_PRODUCTS;
    }
  });
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
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all'); // all, published, draft
  const [selectedStock, setSelectedStock] = useState('all'); // all, inStock, outOfStock

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    category: '',
    description: '',
    regularPrice: '',
    offerPrice: '',
    material: '',
    dimensions: '',
    specifications: '',
    features: '',
    warranty: '',
    woodType: '',
    images: [],
    coverImage: '',
    isFeatured: false,
    isPublished: true,
    inStock: true,
  });

  // Delete State
  const [deleteProductItem, setDeleteProductItem] = useState(null);

  const loadData = async () => {
    try {
      setError(null);
      const [prodData, catData] = await Promise.all([
        productService.getAllForAdmin(),
        categoryService.getAllForAdmin(),
      ]);
      setProducts(prodData);
      setCategories(catData);
    } catch (err) {
      console.error('Failed to load products:', err);
      setError('Could not retrieve products. Check Firestore rules.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      categoryId: categories[0]?.id || '',
      category: categories[0]?.name || '',
      description: '',
      regularPrice: '',
      offerPrice: '',
      material: '',
      dimensions: '',
      specifications: '',
      features: '',
      warranty: '5 Years Manufacturer Warranty',
      woodType: 'Solid Teak Wood',
      images: [],
      coverImage: '',
      isFeatured: false,
      isPublished: true,
      inStock: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (prod) => {
    setEditingProduct(prod);
    setFormData({
      name: prod.name || prod.title || '',
      categoryId: prod.categoryId || '',
      category: prod.category || '',
      description: prod.description || '',
      regularPrice: prod.regularPrice || prod.price || '',
      offerPrice: prod.offerPrice || prod.salePrice || '',
      material: prod.material || '',
      dimensions: prod.dimensions || '',
      specifications: typeof prod.specifications === 'string' ? prod.specifications : '',
      features: typeof prod.features === 'string' ? prod.features : '',
      warranty: prod.warranty || '',
      woodType: prod.woodType || '',
      images: Array.isArray(prod.images) ? prod.images : [],
      coverImage: prod.coverImage || prod.imageUrl || (prod.images && prod.images[0]) || '',
      isFeatured: Boolean(prod.isFeatured),
      isPublished: Boolean(prod.isPublished),
      inStock: prod.inStock !== false,
    });
    setIsModalOpen(true);
  };

  const handleCategorySelect = (e) => {
    const selectedId = e.target.value;
    const catObj = categories.find((c) => c.id === selectedId);
    setFormData((prev) => ({
      ...prev,
      categoryId: selectedId,
      category: catObj ? catObj.name : '',
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    // Price validation
    const regular = parseFloat(formData.regularPrice);
    const offer = parseFloat(formData.offerPrice);

    if (isNaN(regular) || regular <= 0) {
      setError('Please provide a valid regular price greater than 0.');
      return;
    }

    if (!isNaN(offer) && offer > 0 && offer >= regular) {
      setError('Offer price must be strictly lower than regular price.');
      return;
    }

    setSubmitting(true);
    setError(null);

    const allImages = Array.from(
      new Set(
        [
          formData.coverImage,
          ...(Array.isArray(formData.images) ? formData.images : []),
        ].filter(Boolean)
      )
    );

    const payload = {
      ...formData,
      regularPrice: regular,
      offerPrice: !isNaN(offer) && offer > 0 ? offer : null,
      images: allImages,
      coverImage: formData.coverImage || allImages[0] || '',
    };

    try {
      if (editingProduct) {
        await productService.update(editingProduct.id, payload);
        setProducts((prev) =>
          prev.map((p) => (p.id === editingProduct.id ? { ...p, ...payload } : p))
        );
        setSuccessMsg(`Product "${formData.name}" updated successfully.`);
      } else {
        const created = await productService.create(payload);
        setProducts((prev) => [created, ...prev]);
        setSuccessMsg(`Product "${formData.name}" added to catalogue.`);
      }

      setIsModalOpen(false);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error('Error saving product:', err);
      setError(err.message || 'Failed to save product.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTogglePublished = async (prod) => {
    try {
      const nextState = !prod.isPublished;
      await productService.update(prod.id, { isPublished: nextState });
      setProducts((prev) =>
        prev.map((p) => (p.id === prod.id ? { ...p, isPublished: nextState } : p))
      );
    } catch (err) {
      console.error('Toggle published error:', err);
    }
  };

  const handleToggleFeatured = async (prod) => {
    try {
      const nextState = !prod.isFeatured;
      await productService.update(prod.id, { isFeatured: nextState });
      setProducts((prev) =>
        prev.map((p) => (p.id === prod.id ? { ...p, isFeatured: nextState } : p))
      );
    } catch (err) {
      console.error('Toggle featured error:', err);
    }
  };

  const confirmDelete = async () => {
    if (!deleteProductItem) return;
    const targetId = deleteProductItem.id;
    const targetImages = deleteProductItem.images || [];

    // 1. Instantly remove from UI & close modal (0ms)
    setProducts((prev) => prev.filter((p) => p.id !== targetId));
    setDeleteProductItem(null);
    setSuccessMsg('Product deleted successfully.');
    setTimeout(() => setSuccessMsg(''), 3000);

    // 2. Perform background delete
    try {
      await productService.delete(targetId, targetImages);
    } catch (err) {
      console.warn('Background delete warning:', err);
    }
  };

  // Filtered Products
  const filteredProducts = products.filter((prod) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      prod.name?.toLowerCase().includes(q) ||
      prod.category?.toLowerCase().includes(q) ||
      prod.description?.toLowerCase().includes(q);

    const matchesCat =
      selectedCategory === 'all' || prod.categoryId === selectedCategory;

    const matchesStatus =
      selectedStatus === 'all' ||
      (selectedStatus === 'published' && prod.isPublished) ||
      (selectedStatus === 'draft' && !prod.isPublished);

    const matchesStock =
      selectedStock === 'all' ||
      (selectedStock === 'inStock' && prod.inStock !== false) ||
      (selectedStock === 'outOfStock' && prod.inStock === false);

    return matchesSearch && matchesCat && matchesStatus && matchesStock;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-neutral-200 shadow-2xs">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 tracking-tight">
            Furniture Products Catalogue
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Manage ready-made furniture, prices, multi-image gallery, and showroom availability
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 rounded-lg border border-neutral-300 bg-white text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 transition-colors shadow-2xs"
            title="Refresh catalogue"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={openCreateModal}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-neutral-900 text-white text-xs font-semibold hover:bg-neutral-800 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
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

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by product name..."
            className="w-full pl-9 pr-3 py-2 text-xs text-neutral-900 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white"
          />
        </div>

        {/* Category filter */}
        <div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 text-xs text-neutral-800 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Publication Status */}
        <div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2 text-xs text-neutral-800 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white"
          >
            <option value="all">All Visibility</option>
            <option value="published">Published Live</option>
            <option value="draft">Drafts Only</option>
          </select>
        </div>

        {/* Stock Status */}
        <div>
          <select
            value={selectedStock}
            onChange={(e) => setSelectedStock(e.target.value)}
            className="w-full px-3 py-2 text-xs text-neutral-800 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white"
          >
            <option value="all">All Inventory</option>
            <option value="inStock">In Stock</option>
            <option value="outOfStock">Out of Stock</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      {loading ? (
        <div className="py-20 bg-white rounded-2xl border border-neutral-200 flex justify-center">
          <LoadingSpinner text="Loading products from Firestore..." />
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-neutral-200 space-y-3">
          <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mx-auto text-neutral-400">
            <Package className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-neutral-900">
            {searchQuery || selectedCategory !== 'all'
              ? 'No products match the selected filters'
              : 'No products added yet'}
          </h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            {searchQuery || selectedCategory !== 'all'
              ? 'Try resetting the search or category filters.'
              : 'Start by clicking "Add New Product" to populate your dining sets, cots, wardrobes, and TV units.'}
          </p>
          {!searchQuery && selectedCategory === 'all' && (
            <div className="pt-2">
              <button
                onClick={openCreateModal}
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-neutral-900 text-white text-xs font-semibold hover:bg-neutral-800 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add First Product</span>
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
                  <th className="py-3 px-4">Product Name & Category</th>
                  <th className="py-3 px-4">Pricing</th>
                  <th className="py-3 px-4">Stock</th>
                  <th className="py-3 px-4">Featured</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredProducts.map((prod) => {
                  const hasDiscount =
                    prod.offerPrice &&
                    prod.regularPrice &&
                    Number(prod.offerPrice) < Number(prod.regularPrice);

                  const discountPct = hasDiscount
                    ? Math.round(
                        ((prod.regularPrice - prod.offerPrice) / prod.regularPrice) * 100
                      )
                    : 0;

                  const cover =
                    prod.coverImage ||
                    prod.imageUrl ||
                    (prod.images && prod.images[0]) ||
                    '';

                  return (
                    <tr key={prod.id} className="hover:bg-neutral-50/60 transition-colors">
                      {/* Image Thumbnail */}
                      <td className="py-3 px-4">
                        {cover ? (
                          <img
                            src={cover}
                            alt={prod.name}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=600&auto=format&fit=crop&q=80';
                            }}
                            className="w-12 h-12 rounded-lg object-cover border border-neutral-200 bg-neutral-50"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-400">
                            <ImageIcon className="w-5 h-5" />
                          </div>
                        )}
                      </td>

                      {/* Name & Category */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-neutral-900 text-sm">{prod.name}</div>
                        <div className="flex items-center space-x-2 mt-0.5 text-[11px] text-neutral-500">
                          <span className="font-medium text-neutral-700">
                            {prod.category || 'Uncategorized'}
                          </span>
                          {prod.material && <span>• {prod.material}</span>}
                          {prod.images && prod.images.length > 0 && (
                            <span>• {prod.images.length} photos</span>
                          )}
                        </div>
                      </td>

                      {/* Pricing */}
                      <td className="py-3 px-4">
                        {hasDiscount ? (
                          <div className="space-y-0.5">
                            <div className="font-bold text-neutral-900 text-sm">
                              {formatCurrency(prod.offerPrice)}
                            </div>
                            <div className="flex items-center space-x-1.5 text-[11px]">
                              <span className="line-through text-neutral-400">
                                {formatCurrency(prod.regularPrice)}
                              </span>
                              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded">
                                {discountPct}% off
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="font-bold text-neutral-900 text-sm">
                            {formatCurrency(prod.regularPrice)}
                          </div>
                        )}
                      </td>

                      {/* Stock availability */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                            prod.inStock !== false
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-red-50 text-red-700 border border-red-200'
                          }`}
                        >
                          {prod.inStock !== false ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </td>

                      {/* Featured toggle */}
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleToggleFeatured(prod)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            prod.isFeatured
                              ? 'text-amber-500 bg-amber-50 hover:bg-amber-100'
                              : 'text-neutral-300 hover:text-neutral-500 hover:bg-neutral-100'
                          }`}
                          title="Toggle featured status"
                        >
                          <Star
                            className={`w-4 h-4 ${prod.isFeatured ? 'fill-amber-400' : ''}`}
                          />
                        </button>
                      </td>

                      {/* Published status */}
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleTogglePublished(prod)}
                          className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-semibold transition-colors ${
                            prod.isPublished
                              ? 'bg-neutral-900 text-white hover:bg-neutral-800'
                              : 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300'
                          }`}
                          title="Click to toggle publish status"
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              prod.isPublished ? 'bg-emerald-400' : 'bg-neutral-400'
                            }`}
                          />
                          <span>{prod.isPublished ? 'Published' : 'Draft'}</span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => openEditModal(prod)}
                            className="p-1.5 rounded-md text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
                            title="Edit product"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteProductItem(prod)}
                            className="p-1.5 rounded-md text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Delete product"
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

      {/* Product Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden">
            <div className="p-6 border-b border-neutral-200 flex items-center justify-between bg-white z-10">
              <h3 className="text-base font-bold text-neutral-900">
                {editingProduct ? 'Edit Furniture Product' : 'Add Furniture Product'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-neutral-400 hover:text-neutral-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
              {/* Product Name */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1.5">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Royal Solid Teak 6-Seater Dining Table"
                  className="w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white"
                />
              </div>

              {/* Category & Availability */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1.5">
                    Category *
                  </label>
                  <select
                    required
                    value={formData.categoryId}
                    onChange={handleCategorySelect}
                    className="w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white"
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1.5">
                    Stock Availability
                  </label>
                  <select
                    value={formData.inStock ? 'true' : 'false'}
                    onChange={(e) =>
                      setFormData({ ...formData, inStock: e.target.value === 'true' })
                    }
                    className="w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white"
                  >
                    <option value="true">In Stock & Available</option>
                    <option value="false">Out of Stock / Custom Order</option>
                  </select>
                </div>
              </div>

              {/* Pricing (Regular & Offer) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-neutral-50 p-4 rounded-xl border border-neutral-200">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1.5">
                    Regular Price (₹ INR) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-xs font-bold">
                      ₹
                    </span>
                    <input
                      type="number"
                      required
                      min={1}
                      step={1}
                      value={formData.regularPrice}
                      onChange={(e) =>
                        setFormData({ ...formData, regularPrice: e.target.value })
                      }
                      placeholder="45000"
                      className="w-full pl-8 pr-3 py-2 text-sm bg-white border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1.5">
                    Discount Price (₹ Optional)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-xs font-bold">
                      ₹
                    </span>
                    <input
                      type="number"
                      min={0}
                      step={1}
                      value={formData.offerPrice}
                      onChange={(e) =>
                        setFormData({ ...formData, offerPrice: e.target.value })
                      }
                      placeholder="Optional, e.g. 39999"
                      className="w-full pl-8 pr-3 py-2 text-sm bg-white border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
                    />
                  </div>
                  <p className="text-[10px] text-neutral-500 mt-1">
                    Leave blank if no discount applies. No fake discounts will be displayed.
                  </p>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1.5">
                  Product Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed description of craftsmanship, comfort, seating capacity..."
                  className="w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white"
                />
              </div>

              {/* Material & Dimensions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1.5">
                    Material / Wood
                  </label>
                  <input
                    type="text"
                    value={formData.material}
                    onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                    placeholder="e.g. 100% Solid Teak Wood, PU Finish"
                    className="w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1.5">
                    Dimensions
                  </label>
                  <input
                    type="text"
                    value={formData.dimensions}
                    onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                    placeholder="e.g. 78L x 72W x 36H inches"
                    className="w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white"
                  />
                </div>
              </div>

              {/* Specifications / Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1.5">
                    Technical Specifications
                  </label>
                  <textarea
                    rows={2}
                    value={formData.specifications}
                    onChange={(e) =>
                      setFormData({ ...formData, specifications: e.target.value })
                    }
                    placeholder="e.g. Hydraulic lift, termite treated, 18mm ply"
                    className="w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1.5">
                    Warranty & Polish
                  </label>
                  <textarea
                    rows={2}
                    value={formData.warranty}
                    onChange={(e) => setFormData({ ...formData, warranty: e.target.value })}
                    placeholder="e.g. 5 Years Termite Warranty, Matte Walnut Stain"
                    className="w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white"
                  />
                </div>
              </div>

              {/* Firebase Image Uploader */}
              <div className="pt-2">
                <ImageUploader
                  label="Multiple Product Images"
                  helperText="Upload photographs (JPEG, PNG, WebP up to 10MB each). Click star icon to designate cover photo."
                  images={formData.images}
                  coverImage={formData.coverImage}
                  uploadFolder="products"
                  maxImages={12}
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
                      Showcase in featured furniture slider
                    </span>
                  </div>
                </label>

                <label className="flex items-center space-x-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isPublished}
                    onChange={(e) =>
                      setFormData({ ...formData, isPublished: e.target.checked })
                    }
                    className="w-4 h-4 rounded text-neutral-900 focus:ring-neutral-900 border-neutral-300"
                  />
                  <div>
                    <span className="text-xs font-semibold text-neutral-900 block">
                      Publish to Catalogue
                    </span>
                    <span className="text-[10px] text-neutral-500 block">
                      Live on customer website immediately
                    </span>
                  </div>
                </label>
              </div>

              {/* Submit Buttons */}
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
                    : editingProduct
                    ? 'Update Product'
                    : 'Publish Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteProductItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-xl max-w-sm w-full p-6 space-y-4">
            <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
              <Trash2 className="w-5 h-5" />
            </div>

            <div>
              <h3 className="text-base font-bold text-neutral-900">Delete Product</h3>
              <p className="text-xs text-neutral-500 mt-1">
                Are you sure you want to delete <span className="font-semibold text-neutral-800">"{deleteProductItem.name}"</span>? All associated images will also be removed from storage.
              </p>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setDeleteProductItem(null)}
                className="px-3.5 py-1.5 rounded-lg border border-neutral-300 text-neutral-700 text-xs font-semibold hover:bg-neutral-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-1.5 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700"
              >
                Delete Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
