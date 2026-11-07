import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  MessageCircle,
  Star,
  ArrowRight,
  SlidersHorizontal,
  X,
  FolderGit2,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  MapPin,
  Calendar,
  Layers,
  Video,
} from 'lucide-react';
import { projectService } from '../../services/projectService';
import { formatCurrency, formatWhatsAppLink } from '../../utils/formatters';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const Projects = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [selectedSort, setSelectedSort] = useState('featured'); // featured, newest, priceAsc, priceDesc

  const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '919876543210';

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const data = await projectService.getAllPublished();
        setProjects(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error loading published projects:', err);
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, []);

  // Sync category param from URL
  useEffect(() => {
    const catParam = searchParams.get('category');
    if (catParam) {
      setSelectedCategory(catParam);
    }
  }, [searchParams]);

  const handleCategoryChange = (catName) => {
    setSelectedCategory(catName);
    if (catName === 'all') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', catName);
    }
    setSearchParams(searchParams);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedSort('featured');
    setSearchParams({});
  };

  // Dynamically extract categories from existing projects
  const categories = Array.from(
    new Set(projects.map((p) => p.category).filter(Boolean))
  );

  // Filter & Sort Logic
  const filteredProjects = projects.filter((proj) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      proj.title?.toLowerCase().includes(q) ||
      proj.category?.toLowerCase().includes(q) ||
      proj.location?.toLowerCase().includes(q) ||
      proj.materials?.toLowerCase().includes(q) ||
      proj.description?.toLowerCase().includes(q);

    const matchesCat =
      selectedCategory === 'all' ||
      proj.category?.toLowerCase() === selectedCategory.toLowerCase();

    return matchesSearch && matchesCat;
  });

  // Sort
  const sortedProjects = [...filteredProjects].sort((a, b) => {
    const priceA = Number(a.price || a.cost) || 0;
    const priceB = Number(b.price || b.cost) || 0;

    if (selectedSort === 'priceAsc') return priceA - priceB;
    if (selectedSort === 'priceDesc') return priceB - priceA;
    if (selectedSort === 'newest') {
      const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : new Date(a.createdAt || 0).getTime();
      const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : new Date(b.createdAt || 0).getTime();
      return timeB - timeA;
    }
    // featured: featured items first
    return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10">
      {/* Header */}
      <div className="border-b border-neutral-200 pb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
            Social Portfolio
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 tracking-tight mt-1">
            Completed Projects Gallery
          </h1>
          <p className="mt-2 text-sm sm:text-base text-neutral-600 max-w-2xl">
            Browse real custom furniture installations, TV unit paneling, and modular kitchens completed for homes across Coimbatore, Tamil Nadu.
          </p>
        </div>

        <div className="text-xs text-neutral-500 font-medium bg-neutral-100 px-4 py-2 rounded-xl">
          Showing <span className="font-bold text-neutral-900">{sortedProjects.length}</span> pieces
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="space-y-4">
        {/* Top search & Sort */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-8 relative">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by project name, location, TV unit, kitchen, materials..."
              className="w-full pl-10 pr-10 py-2.5 text-xs text-neutral-900 bg-white border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 shadow-2xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="sm:col-span-4 flex items-center space-x-2">
            <select
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value)}
              className="w-full px-3 py-2.5 text-xs font-medium text-neutral-800 bg-white border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 shadow-2xs"
            >
              <option value="featured">Featured First</option>
              <option value="newest">Newest Additions</option>
              <option value="priceAsc">Price: Low to High</option>
              <option value="priceDesc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Category Pill Filters */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => handleCategoryChange('all')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors shadow-2xs ${
              selectedCategory === 'all'
                ? 'bg-olive-700 text-white shadow-sm'
                : 'bg-white border border-brown-200 text-brown-800 hover:bg-olive-50/60'
            }`}
          >
            All Collections
          </button>
          {categories.map((catName) => {
            const isSelected = selectedCategory.toLowerCase() === catName.toLowerCase();

            return (
              <button
                key={catName}
                onClick={() => handleCategoryChange(catName)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors shadow-2xs ${
                  isSelected
                    ? 'bg-olive-700 text-white shadow-sm'
                    : 'bg-white border border-brown-200 text-brown-800 hover:bg-olive-50/60'
                }`}
              >
                {catName}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Filter Chips */}
      {(searchQuery || selectedCategory !== 'all') && (
        <div className="flex items-center space-x-2 text-xs">
          <span className="text-neutral-500">Active filters:</span>
          {selectedCategory !== 'all' && (
            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-neutral-200 text-neutral-800 text-[11px] font-medium">
              <span>{selectedCategory}</span>
              <button onClick={() => handleCategoryChange('all')}>
                <X className="w-3 h-3 ml-0.5" />
              </button>
            </span>
          )}
          {searchQuery && (
            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-neutral-200 text-neutral-800 text-[11px] font-medium">
              <span>"{searchQuery}"</span>
              <button onClick={() => setSearchQuery('')}>
                <X className="w-3 h-3 ml-0.5" />
              </button>
            </span>
          )}
          <button
            onClick={handleClearFilters}
            className="text-xs text-neutral-600 hover:text-neutral-900 underline ml-2"
          >
            Reset all
          </button>
        </div>
      )}

      {/* Projects Grid */}
      {loading ? (
        <div className="py-24 flex justify-center">
          <LoadingSpinner text="Loading completed projects..." />
        </div>
      ) : sortedProjects.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-3xl border border-neutral-200 space-y-4">
          <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mx-auto text-neutral-400">
            <FolderGit2 className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-neutral-900">
              No completed projects found
            </h3>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              {searchQuery || selectedCategory !== 'all'
                ? 'Try searching with a broader keyword or resetting filters.'
                : 'New project installations will be published here soon.'}
            </p>
          </div>
          {(searchQuery || selectedCategory !== 'all') && (
            <button
              onClick={handleClearFilters}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-neutral-900 text-white text-xs font-semibold hover:bg-neutral-800 transition-colors"
            >
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedProjects.map((proj) => (
            <ProjectGridCard key={proj.id} proj={proj} whatsappNumber={whatsappNumber} />
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * ProjectGridCard matching ProductGridCard structure from Products.jsx:
 * - Aspect 4/3 image container
 * - Interactive multi-image carousel on hover (< and > buttons + dots + count badge)
 * - Safe image extraction
 * - Badges: Category, Location, Video, Featured
 * - Clean WhatsApp enquiry CTA
 */
const ProjectGridCard = ({ proj, whatsappNumber }) => {
  // Extract all images safely
  const allImages = React.useMemo(() => {
    const raw = [
      proj.coverImage,
      proj.imageUrl,
      ...(Array.isArray(proj.images) ? proj.images : []),
    ];

    const clean = [];
    raw.forEach((item) => {
      let url = '';
      if (typeof item === 'string') url = item;
      else if (item && typeof item === 'object') url = item.url || item.src || item.downloadURL || '';
      if (url && !clean.includes(url)) clean.push(url);
    });

    return clean;
  }, [proj]);

  const [activeIdx, setActiveIdx] = useState(0);

  const currentImg = allImages[activeIdx] || allImages[0] || '';
  const totalPhotos = allImages.length;

  const handlePrev = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveIdx((prev) => (prev - 1 + totalPhotos) % totalPhotos);
  };

  const handleNext = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveIdx((prev) => (prev + 1) % totalPhotos);
  };

  const handleSelectDot = (e, idx) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveIdx(idx);
  };

  const relevantPrice = proj.price || proj.cost;
  const priceDisplay = relevantPrice
    ? typeof relevantPrice === 'number'
      ? formatCurrency(relevantPrice)
      : relevantPrice
    : null;

  const whatsappMessage = formatWhatsAppLink(
    whatsappNumber,
    `Hello Sleep Star Furniture, I am interested in your completed project: "${proj.title}" in ${proj.location || 'Coimbatore'}. Could you please share more details or quotation?`
  );

  return (
    <div className="group bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-2xs hover:shadow-md hover:bg-neutral-50/60 transition-all flex flex-col justify-between">
      {/* Image Container */}
      <div className="relative aspect-4/3 bg-neutral-100 overflow-hidden">
        <Link to={`/projects/${proj.id}`} className="block w-full h-full">
          {currentImg ? (
            <img
              src={currentImg}
              alt={proj.title}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=800&auto=format&fit=crop&q=80';
              }}
              className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-neutral-400 font-bold">
              Sleep Star
            </div>
          )}
        </Link>

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex items-center space-x-1.5 z-10 pointer-events-none">
          {proj.category && (
            <span className="bg-olive-700 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
              {proj.category}
            </span>
          )}
          {proj.isFeatured && (
            <span className="bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm flex items-center space-x-0.5">
              <Star className="w-3 h-3 fill-white" />
              <span>Featured</span>
            </span>
          )}
        </div>

        {/* Video indicator */}
        {proj.videoUrl && (
          <div className="absolute top-2.5 right-2.5 p-1 rounded-full bg-black/60 backdrop-blur-xs text-white z-10 pointer-events-none" title="Video available">
            <Video className="w-3 h-3 text-red-400" />
          </div>
        )}

        {/* Carousel arrows on card when multiple images exist */}
        {totalPhotos > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous photo"
              className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/90 hover:bg-white text-neutral-900 flex items-center justify-center shadow-md transition-all opacity-0 group-hover:opacity-100 hover:scale-110 focus:outline-none z-10 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next photo"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/90 hover:bg-white text-neutral-900 flex items-center justify-center shadow-md transition-all opacity-0 group-hover:opacity-100 hover:scale-110 focus:outline-none z-10 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Dot indicators */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center space-x-1 z-10 bg-black/40 backdrop-blur-xs px-2 py-0.5 rounded-full pointer-events-auto">
              {allImages.slice(0, 5).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={(e) => handleSelectDot(e, i)}
                  className={`w-1.5 h-1.5 rounded-full transition-all cursor-pointer ${
                    activeIdx === i ? 'bg-white w-3' : 'bg-white/60 hover:bg-white'
                  }`}
                />
              ))}
              {totalPhotos > 5 && (
                <span className="text-[9px] text-white/90 font-bold pl-0.5">+{totalPhotos - 5}</span>
              )}
            </div>

            {/* Photo count indicator */}
            <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-brown-900/85 backdrop-blur-xs text-olive-200 text-[10px] font-semibold flex items-center space-x-1 z-10 pointer-events-none">
              <ImageIcon className="w-3 h-3 text-olive-300" />
              <span>{activeIdx + 1}/{totalPhotos}</span>
            </div>
          </>
        )}
      </div>

      {/* Card Content Body */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1">
          {proj.location && (
            <div className="flex items-center space-x-1 text-[11px] text-neutral-500 font-medium">
              <MapPin className="w-3 h-3 text-neutral-400" />
              <span className="truncate">{proj.location}</span>
            </div>
          )}

          <Link to={`/projects/${proj.id}`} className="block">
            <h3 className="font-bold text-sm text-neutral-900 hover:text-neutral-700 transition-colors line-clamp-1">
              {proj.title}
            </h3>
          </Link>

          {proj.materials && (
            <p className="text-xs text-neutral-500 line-clamp-1">
              {proj.materials}
            </p>
          )}

          {priceDisplay && (
            <div className="pt-1">
              <span className="text-sm font-extrabold text-neutral-900">
                {priceDisplay}
              </span>
            </div>
          )}
        </div>

        {/* WhatsApp & Details Action Buttons */}
        <div className="pt-3 border-t border-neutral-100 flex items-center space-x-2">
          <a
            href={whatsappMessage}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl bg-olive-700 text-white text-xs font-semibold hover:bg-olive-800 transition-colors shadow-2xs"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Enquire</span>
          </a>

          <Link
            to={`/projects/${proj.id}`}
            className="p-2 rounded-xl border border-neutral-300 text-neutral-700 hover:text-neutral-950 hover:bg-neutral-50 transition-colors"
            title="View Details"
          >
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};
