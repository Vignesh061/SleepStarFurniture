import React, { useState, useEffect, useRef } from 'react';
import {
  FolderGit2,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  RefreshCw,
  X,
  Star,
  MapPin,
  Calendar,
  Video,
  Eye,
  Image as ImageIcon,
  Layers,
  UploadCloud,
  FileVideo,
} from 'lucide-react';
import { projectService } from '../../services/projectService';
import { ImageUploader } from '../../components/common/ImageUploader';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { storageService } from '../../services/storageService';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const AdminProjects = () => {
  const [projects, setProjects] = useState(() => {
    try {
      const data = projectService.getCachedOrDefaults();
      return Array.isArray(data) ? data : [];
    } catch (_) {
      return [];
    }
  });
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all'); // all, published, draft

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Video Upload State
  const [videoUploading, setVideoUploading] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const videoInputRef = useRef(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    category: 'TV Units',
    location: 'Coimbatore, Tamil Nadu',
    description: '',
    materials: '',
    price: '',
    completionDate: 'November 2026',
    videoUrl: '',
    images: [],
    coverImage: '',
    status: 'published', // 'published', 'draft'
    isFeatured: false,
    displayOrder: 1,
  });

  // Delete State
  const [deleteItem, setDeleteItem] = useState(null);

  const loadProjects = async () => {
    try {
      setError(null);
      const data = await projectService.getAllForAdmin();
      setProjects(data);
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError('Could not retrieve projects from Firestore.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadProjects();
  };

  const openCreateModal = () => {
    setEditingProject(null);
    setFormData({
      title: '',
      category: 'TV Units',
      location: 'Coimbatore, Tamil Nadu',
      description: '',
      materials: 'Solid Teak Wood, PU Finish, Marine Grade Plywood',
      price: '',
      completionDate: 'November 2026',
      videoUrl: '',
      images: [],
      coverImage: '',
      status: 'published',
      isFeatured: false,
      displayOrder: projects.length + 1,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (proj) => {
    setEditingProject(proj);
    setFormData({
      title: proj.title || '',
      category: proj.category || 'TV Units',
      location: proj.location || 'Coimbatore, Tamil Nadu',
      description: proj.description || '',
      materials: typeof proj.materials === 'string' ? proj.materials : '',
      price: proj.price !== undefined ? proj.price : '',
      completionDate: proj.completionDate || '',
      videoUrl: proj.videoUrl || '',
      images: Array.isArray(proj.images) ? proj.images : [],
      coverImage: proj.coverImage || proj.imageUrl || (proj.images && proj.images[0]) || '',
      status: proj.status || 'published',
      isFeatured: Boolean(proj.isFeatured),
      displayOrder: proj.displayOrder || 1,
    });
    setIsModalOpen(true);
  };

  const handleVideoFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      setError('Please select a valid video file (MP4 or WebM).');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setError('Video file exceeds 50MB limit.');
      return;
    }

    setVideoUploading(true);
    setVideoProgress(0);
    setError(null);

    try {
      const url = await storageService.uploadProjectVideo(
        file,
        editingProject?.id || 'temp',
        (prog) => setVideoProgress(prog)
      );
      setFormData((prev) => ({ ...prev, videoUrl: url }));
      setSuccessMsg('Video uploaded successfully.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error('Video upload error:', err);
      setError(err.message || 'Failed to upload video.');
    } finally {
      setVideoUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    setSubmitting(true);
    setError(null);

    const priceVal = formData.price ? parseFloat(formData.price) : 0;

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
      price: !isNaN(priceVal) && priceVal > 0 ? priceVal : '',
      cost: !isNaN(priceVal) && priceVal > 0 ? priceVal : '',
      images: allImages,
      coverImage: formData.coverImage || allImages[0] || '',
    };

    try {
      if (editingProject) {
        await projectService.update(editingProject.id, payload);
        setProjects((prev) =>
          prev.map((p) => (p.id === editingProject.id ? { ...p, ...payload } : p))
        );
        setSuccessMsg(`Project "${formData.title}" updated.`);
      } else {
        const created = await projectService.create(payload);
        setProjects((prev) => [created, ...prev]);
        setSuccessMsg(`Project "${formData.title}" published to portfolio.`);
      }

      setIsModalOpen(false);
      setIsPreviewOpen(false);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error('Save project error:', err);
      setError(err.message || 'Failed to save project.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (proj) => {
    try {
      const nextStatus = proj.status === 'published' ? 'draft' : 'published';
      await projectService.update(proj.id, { status: nextStatus });
      setProjects((prev) =>
        prev.map((p) => (p.id === proj.id ? { ...p, status: nextStatus } : p))
      );
    } catch (err) {
      console.error('Toggle project status error:', err);
    }
  };

  const handleToggleFeatured = async (proj) => {
    try {
      const nextState = !proj.isFeatured;
      await projectService.update(proj.id, { isFeatured: nextState });
      setProjects((prev) =>
        prev.map((p) => (p.id === proj.id ? { ...p, isFeatured: nextState } : p))
      );
    } catch (err) {
      console.error('Toggle project featured error:', err);
    }
  };

  const confirmDelete = async () => {
    if (!deleteItem) return;
    const targetId = deleteItem.id;
    const targetImages = deleteItem.images || [];
    const targetVideo = deleteItem.videoUrl || '';

    // 1. Instantly remove from UI & close modal (0ms)
    setProjects((prev) => prev.filter((p) => p.id !== targetId));
    setDeleteItem(null);
    setSuccessMsg('Project post deleted.');
    setTimeout(() => setSuccessMsg(''), 3000);

    // 2. Perform background delete
    try {
      await projectService.delete(targetId, targetImages, targetVideo);
    } catch (err) {
      console.warn('Background delete warning:', err);
    }
  };

  // Distinct categories from existing projects
  const categoriesList = ['TV Units', 'Modular Kitchens', 'Wardrobes', 'Dining & Living', 'Full Interior'];

  const filteredProjects = projects.filter((proj) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      proj.title?.toLowerCase().includes(q) ||
      proj.location?.toLowerCase().includes(q) ||
      proj.category?.toLowerCase().includes(q) ||
      proj.description?.toLowerCase().includes(q);

    const matchesCat =
      selectedCategory === 'all' || proj.category === selectedCategory;

    const matchesStatus =
      selectedStatus === 'all' || proj.status === selectedStatus;

    return matchesSearch && matchesCat && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-neutral-200 shadow-2xs">
        <div>
          <div className="inline-flex items-center space-x-1.5 text-[11px] font-semibold uppercase tracking-wider text-neutral-500 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Social Publishing CMS</span>
          </div>
          <h2 className="text-xl font-bold text-neutral-900 tracking-tight">
            Completed Projects & Portfolio
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Publish completed installations with multi-photos, videos, locations, and enquiry deep links
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 rounded-lg border border-neutral-300 bg-white text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 transition-colors shadow-2xs cursor-pointer"
            title="Refresh projects"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={openCreateModal}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-neutral-900 text-white text-xs font-semibold hover:bg-neutral-800 transition-colors shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Publish New Project</span>
          </button>
        </div>
      </div>

      {/* Quick Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block">
            Total Projects
          </span>
          <span className="text-2xl font-bold text-neutral-900 mt-1 block">
            {projects.length}
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block">
            Published Live
          </span>
          <span className="text-2xl font-bold text-emerald-600 mt-1 block">
            {projects.filter((p) => p.status === 'published').length}
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block">
            Drafts Only
          </span>
          <span className="text-2xl font-bold text-amber-600 mt-1 block">
            {projects.filter((p) => p.status === 'draft').length}
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block">
            Featured Works
          </span>
          <span className="text-2xl font-bold text-neutral-900 mt-1 block">
            {projects.filter((p) => p.isFeatured).length}
          </span>
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs">
        <div className="relative">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, location (e.g. Coimbatore)..."
            className="w-full pl-9 pr-3 py-2 text-xs text-neutral-900 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white"
          />
        </div>

        <div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 text-xs text-neutral-800 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white"
          >
            <option value="all">All Project Categories</option>
            {categoriesList.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2 text-xs text-neutral-800 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white"
          >
            <option value="all">All Statuses</option>
            <option value="published">Published Live</option>
            <option value="draft">Drafts Only</option>
          </select>
        </div>
      </div>

      {/* Projects Showcase Cards / Table */}
      {loading ? (
        <div className="py-20 bg-white rounded-2xl border border-neutral-200 flex justify-center">
          <LoadingSpinner text="Loading completed projects from Firestore..." />
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-neutral-200 space-y-3">
          <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mx-auto text-neutral-400">
            <FolderGit2 className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-neutral-900">
            {searchQuery || selectedCategory !== 'all'
              ? 'No projects matching filter criteria'
              : 'No completed projects published yet'}
          </h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            {searchQuery || selectedCategory !== 'all'
              ? 'Try resetting the category or search filters.'
              : 'Publish your finished TV units, modular kitchens, and wardrobes like social posts.'}
          </p>
          {!searchQuery && selectedCategory === 'all' && (
            <div className="pt-2 flex justify-center gap-3">
              <button
                onClick={openCreateModal}
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-neutral-900 text-white text-xs font-semibold hover:bg-neutral-800 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create New Post</span>
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
                  <th className="py-3 px-4">Project Name & Category</th>
                  <th className="py-3 px-4">Pricing</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Featured</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredProjects.map((proj) => {
                  const cover =
                    proj.coverImage ||
                    proj.imageUrl ||
                    (proj.images && proj.images[0]) ||
                    '';

                  const photoCount = proj.images?.length || (cover ? 1 : 0);
                  const isPublished = proj.status === 'published';

                  return (
                    <tr key={proj.id} className="hover:bg-neutral-50/60 transition-colors">
                      {/* Image Thumbnail */}
                      <td className="py-3 px-4">
                        {cover ? (
                          <img
                            src={cover}
                            alt={proj.title}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&auto=format&fit=crop&q=80';
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
                        <div className="font-semibold text-neutral-900 text-sm">{proj.title}</div>
                        <div className="flex items-center space-x-2 mt-0.5 text-[11px] text-neutral-500">
                          <span className="font-medium text-neutral-700">
                            {proj.category || 'Interior'}
                          </span>
                          {proj.roomType && <span>• {proj.roomType}</span>}
                          {photoCount > 0 && (
                            <span>• {photoCount} {photoCount === 1 ? 'photo' : 'photos'}</span>
                          )}
                          {proj.videoUrl && (
                            <span className="inline-flex items-center text-red-500 font-medium">
                              • Video
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Pricing */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-neutral-900 text-sm">
                          {proj.price
                            ? (typeof proj.price === 'number'
                                ? formatCurrency(proj.price)
                                : proj.price)
                            : 'Custom Quote'}
                        </div>
                      </td>

                      {/* Location */}
                      <td className="py-3 px-4">
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {proj.location || 'Coimbatore'}
                        </span>
                      </td>

                      {/* Featured toggle */}
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleToggleFeatured(proj)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            proj.isFeatured
                              ? 'text-amber-500 bg-amber-50 hover:bg-amber-100'
                              : 'text-neutral-300 hover:text-neutral-500 hover:bg-neutral-100'
                          }`}
                          title="Toggle featured status"
                        >
                          <Star
                            className={`w-4 h-4 ${proj.isFeatured ? 'fill-amber-400' : ''}`}
                          />
                        </button>
                      </td>

                      {/* Published status */}
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleToggleStatus(proj)}
                          className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-semibold transition-colors ${
                            isPublished
                              ? 'bg-neutral-900 text-white hover:bg-neutral-800'
                              : 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300'
                          }`}
                          title="Click to toggle publish status"
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isPublished ? 'bg-emerald-400' : 'bg-neutral-400'
                            }`}
                          />
                          <span>{isPublished ? 'Published' : 'Draft'}</span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => openEditModal(proj)}
                            className="p-1.5 rounded-md text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
                            title="Edit project"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteItem(proj)}
                            className="p-1.5 rounded-md text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Delete project"
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

      {/* Project Creator / Editor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden">
            <div className="p-6 border-b border-neutral-200 flex items-center justify-between bg-white z-10">
              <div>
                <h3 className="text-base font-bold text-neutral-900">
                  {editingProject ? 'Edit Project Post' : 'Publish Completed Furniture Project'}
                </h3>
                <p className="text-[11px] text-neutral-500">
                  Create social-portfolio posts showcasing real installations
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setIsPreviewOpen(true)}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-neutral-300 text-neutral-700 text-xs font-semibold hover:bg-neutral-50"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Preview Card</span>
                </button>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 text-neutral-400 hover:text-neutral-700 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
              {/* Title */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1.5">
                  Project Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Modern Solid Teak TV Unit with Vertical Wall Slats"
                  className="w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white"
                />
              </div>

              {/* Category & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1.5">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white"
                  >
                    {categoriesList.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1.5">
                    Project Location
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="e.g. Coimbatore, Tamil Nadu"
                      className="w-full pl-9 pr-3 py-2 text-sm bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1.5">
                  Project Description & Story
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the room dimensions, client preferences, custom storage elements, and woodwork finish..."
                  className="w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white"
                />
              </div>

              {/* Materials & Approximate Price */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1.5">
                    Materials Used (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.materials}
                    onChange={(e) => setFormData({ ...formData, materials: e.target.value })}
                    placeholder="e.g. BWP Marine Ply, Teak Veneer, Blum Hinges"
                    className="w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1.5">
                    Project Price (₹ Optional)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-xs font-bold">
                      ₹
                    </span>
                    <input
                      type="number"
                      min={0}
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="e.g. 48000"
                      className="w-full pl-8 pr-3 py-2 text-sm bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white"
                    />
                  </div>
                  <p className="text-[10px] text-neutral-500 mt-1">
                    Leave empty if you prefer keeping pricing confidential.
                  </p>
                </div>
              </div>

              {/* Completion Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1.5">
                    Completion Date
                  </label>
                  <input
                    type="text"
                    value={formData.completionDate}
                    onChange={(e) =>
                      setFormData({ ...formData, completionDate: e.target.value })
                    }
                    placeholder="e.g. October 2026"
                    className="w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1.5">
                    Publication Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white"
                  >
                    <option value="published">Publish Live Now</option>
                    <option value="draft">Save as Draft</option>
                  </select>
                </div>
              </div>

              {/* Multi-Photo Uploader */}
              <div className="pt-2">
                <ImageUploader
                  label="Completed Work Photographs *"
                  helperText="Upload completed site photographs (JPEG, PNG, WebP up to 10MB each). Star the best cover angle."
                  images={formData.images}
                  coverImage={formData.coverImage}
                  uploadFolder="projects"
                  maxImages={15}
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

              {/* Video Walkthrough (Optional Direct Upload or URL) */}
              <div className="pt-2 space-y-2 bg-neutral-50 p-4 rounded-xl border border-neutral-200">
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700">
                  Optional Video Walkthrough
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="text"
                    value={formData.videoUrl}
                    onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                    placeholder="Enter video URL or upload MP4 below..."
                    className="flex-1 px-3 py-2 text-xs bg-white border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                  <input
                    ref={videoInputRef}
                    type="file"
                    accept="video/mp4,video/webm"
                    className="hidden"
                    onChange={handleVideoFileSelect}
                  />
                  <button
                    type="button"
                    onClick={() => videoInputRef.current?.click()}
                    disabled={videoUploading}
                    className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-white border border-neutral-300 text-neutral-700 text-xs font-semibold hover:bg-neutral-100 disabled:opacity-50"
                  >
                    <FileVideo className="w-3.5 h-3.5 text-neutral-600" />
                    <span>{videoUploading ? `Uploading ${videoProgress}%` : 'Upload Video'}</span>
                  </button>
                </div>
                {formData.videoUrl && (
                  <p className="text-[11px] text-emerald-700 flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Video attached and ready</span>
                  </p>
                )}
              </div>

              {/* Toggles */}
              <div className="pt-3 border-t border-neutral-200">
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
                      Feature on Homepage Showcase
                    </span>
                    <span className="text-[10px] text-neutral-500 block">
                      Spotlight this project in the recently completed works banner
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
                    ? 'Publishing...'
                    : editingProject
                    ? 'Update Project'
                    : 'Publish Project Post'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Live Preview Modal (Shows exactly how customers will see this completed project) */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-neutral-900/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-2xl max-w-sm w-full overflow-hidden flex flex-col">
            <div className="p-4 border-b border-neutral-200 flex items-center justify-between bg-white">
              <span className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                Live Portfolio Preview
              </span>
              <button
                onClick={() => setIsPreviewOpen(false)}
                className="p-1 text-neutral-400 hover:text-neutral-700 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="aspect-4/3 bg-neutral-100 relative">
              {formData.coverImage || formData.images[0] ? (
                <img
                  src={formData.coverImage || formData.images[0]}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-neutral-400">
                  <ImageIcon className="w-8 h-8" />
                </div>
              )}
              <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-neutral-900/80 text-white text-[10px] font-semibold">
                {formData.category}
              </span>
            </div>

            <div className="p-5 space-y-2">
              <div className="flex items-center space-x-1.5 text-[11px] text-neutral-500">
                <MapPin className="w-3 h-3 text-neutral-400" />
                <span>{formData.location || 'Coimbatore'}</span>
                <span>• {formData.completionDate}</span>
              </div>
              <h4 className="font-bold text-sm text-neutral-900">
                {formData.title || 'Untitled Project'}
              </h4>
              <p className="text-xs text-neutral-600 line-clamp-2">
                {formData.description || 'No description provided yet.'}
              </p>
              {formData.price && (
                <div className="pt-2 text-xs font-bold text-neutral-900">
                  {formatCurrency(Number(formData.price))}
                </div>
              )}
            </div>

            <div className="p-4 bg-neutral-50 border-t border-neutral-200 text-center">
              <button
                onClick={() => setIsPreviewOpen(false)}
                className="w-full py-2 bg-neutral-900 text-white rounded-lg text-xs font-semibold hover:bg-neutral-800"
              >
                Close Preview & Continue Editing
              </button>
            </div>
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
              <h3 className="text-base font-bold text-neutral-900">Delete Project Post</h3>
              <p className="text-xs text-neutral-500 mt-1">
                Are you sure you want to delete <span className="font-semibold text-neutral-800">"{deleteItem.title}"</span>? All associated photographs will be removed from storage.
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
                Delete Post
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
