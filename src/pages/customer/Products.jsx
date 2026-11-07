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
  Package,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
} from 'lucide-react';
import { productService } from '../../services/productService';
import { categoryService } from '../../services/categoryService';
import { formatCurrency, formatWhatsAppLink } from '../../utils/formatters';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [selectedSort, setSelectedSort] = useState('featured'); // featured, priceAsc, priceDesc, newest
  const [inStockOnly, setInStockOnly] = useState(false);

  const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '919876543210';

  useEffect(() => {
    const loadCatalogue = async () => {
      try {
        const [prodList, catList] = await Promise.all([
          productService.getAllPublished(),
          categoryService.getActive(),
        ]);
        setProducts(prodList);
        setCategories(catList);
      } catch (err) {
        console.error('Error loading products catalogue:', err);
      } finally {
        setLoading(false);
      }
    };

    loadCatalogue();
  }, []);

  // Sync category param from URL
  useEffect(() => {
    const catParam = searchParams.get('category');
    if (catParam) {
      setSelectedCategory(catParam);
    }
  }, [searchParams]);

  const handleCategoryChange = (catIdOrSlug) => {
    setSelectedCategory(catIdOrSlug);
    if (catIdOrSlug === 'all') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', catIdOrSlug);
    }
    setSearchParams(searchParams);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedSort('featured');
    setInStockOnly(false);
    setSearchParams({});
  };

  // Filter & Sort Logic
  const filteredProducts = products.filter((prod) => {
    // Search
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      prod.name?.toLowerCase().includes(q) ||
      prod.category?.toLowerCase().includes(q) ||
      prod.material?.toLowerCase().includes(q) ||
      prod.description?.toLowerCase().includes(q);

    // Category
    const matchesCat =
      selectedCategory === 'all' ||
      prod.categoryId === selectedCategory ||
      prod.category?.toLowerCase().replace(/\s+/g, '-') === selectedCategory.toLowerCase();

    // Stock
    const matchesStock = !inStockOnly || prod.inStock !== false;

    return matchesSearch && matchesCat && matchesStock;
  });

  // Sort
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const priceA = a.offerPrice || a.regularPrice || 0;
    const priceB = b.offerPrice || b.regularPrice || 0;

    if (selectedSort === 'priceAsc') return priceA - priceB;
    if (selectedSort === 'priceDesc') return priceB - priceA;
    if (selectedSort === 'newest') {
      const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
      const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
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
            Showroom Catalogue
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 tracking-tight mt-1">
            Ready-Made Furniture Collection
          </h1>
          <p className="mt-2 text-sm sm:text-base text-neutral-600 max-w-2xl">
            Explore solid wood dining sets, luxury cots, modern modular wardrobes, and TV consoles crafted directly at our Coimbatore workshop.
          </p>
        </div>

        <div className="text-xs text-neutral-500 font-medium bg-neutral-100 px-4 py-2 rounded-xl">
          Showing <span className="font-bold text-neutral-900">{sortedProducts.length}</span> pieces
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
              placeholder="Search by furniture name, teakwood, dining, cot, wardrobe..."
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
              className="flex-1 px-3 py-2.5 text-xs font-medium text-neutral-800 bg-white border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 shadow-2xs"
            >
              <option value="featured">Featured First</option>
              <option value="newest">Newest Additions</option>
              <option value="priceAsc">Price: Low to High</option>
              <option value="priceDesc">Price: High to Low</option>
            </select>

            <button
              onClick={() => setInStockOnly(!inStockOnly)}
              className={`px-3 py-2.5 rounded-xl border text-xs font-semibold whitespace-nowrap transition-colors shadow-2xs ${
                inStockOnly
                  ? 'bg-olive-700 text-white border-olive-700 shadow-sm'
                  : 'bg-white text-brown-800 border-brown-300 hover:bg-olive-50'
              }`}
            >
              In Stock Only
            </button>
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
          {categories.map((cat) => {
            const isSelected =
              selectedCategory === cat.id ||
              selectedCategory === cat.slug ||
              selectedCategory.toLowerCase() === cat.name.toLowerCase().replace(/\s+/g, '-');

            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id || cat.slug)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors shadow-2xs ${
                  isSelected
                    ? 'bg-olive-700 text-white shadow-sm'
                    : 'bg-white border border-brown-200 text-brown-800 hover:bg-olive-50/60'
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Filter Chips */}
      {(searchQuery || selectedCategory !== 'all' || inStockOnly) && (
        <div className="flex items-center space-x-2 text-xs">
          <span className="text-neutral-500">Active filters:</span>
          {selectedCategory !== 'all' && (
            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-neutral-200 text-neutral-800 text-[11px] font-medium">
              <span>Category</span>
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
          {inStockOnly && (
            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-neutral-200 text-neutral-800 text-[11px] font-medium">
              <span>In Stock</span>
              <button onClick={() => setInStockOnly(false)}>
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

      {/* Product Grid */}
      {loading ? (
        <div className="py-24 flex justify-center">
          <LoadingSpinner text="Loading furniture pieces..." />
        </div>
      ) : sortedProducts.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-3xl border border-neutral-200 space-y-4">
          <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mx-auto text-neutral-400">
            <Package className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-neutral-900">
              No furniture pieces match your current filters
            </h3>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              Try searching with a broader keyword, removing the stock filter, or switching categories.
            </p>
          </div>
          <button
            onClick={handleClearFilters}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-neutral-900 text-white text-xs font-semibold hover:bg-neutral-800 transition-colors"
          >
            <span>Reset Catalogue Filters</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedProducts.map((prod) => (
            <ProductGridCard key={prod.id} prod={prod} whatsappNumber={whatsappNumber} />
          ))}
        </div>
      )}
    </div>
  );
};

const ProductGridCard = ({ prod, whatsappNumber }) => {
  const allImages = Array.from(
    new Set(
      [
        prod.coverImage,
        prod.imageUrl,
        ...(Array.isArray(prod.images) ? prod.images : []),
      ].filter(Boolean)
    )
  );

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

  const hasDiscount =
    prod.offerPrice &&
    prod.regularPrice &&
    Number(prod.offerPrice) < Number(prod.regularPrice);

  const discountPct = hasDiscount
    ? Math.round(((prod.regularPrice - prod.offerPrice) / prod.regularPrice) * 100)
    : 0;

  const relevantPrice = formatCurrency(prod.offerPrice || prod.regularPrice);

  const whatsappMessage = formatWhatsAppLink(
    whatsappNumber,
    `Hello Sleep Star Furniture, I am interested in: "${prod.name}" (Price: ${relevantPrice}). Could you please share more details or availability?`
  );

  return (
    <div className="group bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
      {/* Image Container */}
      <div className="relative aspect-4/3 bg-neutral-100 overflow-hidden">
        <Link to={`/products/${prod.id}`} className="block w-full h-full">
          {currentImg ? (
            <img
              src={currentImg}
              alt={prod.name}
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

        {/* Carousel arrows on card when multiple images exist */}
        {totalPhotos > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous photo"
              className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/90 hover:bg-white text-neutral-900 flex items-center justify-center shadow-md transition-all opacity-0 group-hover:opacity-100 hover:scale-110 focus:outline-none z-10"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next photo"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/90 hover:bg-white text-neutral-900 flex items-center justify-center shadow-md transition-all opacity-0 group-hover:opacity-100 hover:scale-110 focus:outline-none z-10"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Dot indicators */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center space-x-1 z-10 bg-black/40 backdrop-blur-xs px-2 py-0.5 rounded-full">
              {allImages.slice(0, 5).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={(e) => handleSelectDot(e, i)}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    activeIdx === i ? 'bg-white w-3' : 'bg-white/60 hover:bg-white'
                  }`}
                />
              ))}
              {totalPhotos > 5 && (
                <span className="text-[9px] text-white/90 font-bold pl-0.5">+{totalPhotos - 5}</span>
              )}
            </div>

            {/* Photo count indicator */}
            <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-brown-900/85 backdrop-blur-xs text-olive-200 text-[10px] font-semibold flex items-center space-x-1 z-10">
              <ImageIcon className="w-3 h-3 text-olive-300" />
              <span>{activeIdx + 1}/{totalPhotos}</span>
            </div>
          </>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col space-y-1 pointer-events-none z-10">
          {hasDiscount && (
            <span className="bg-olive-700 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
              {discountPct}% OFF
            </span>
          )}
          {prod.isFeatured && (
            <span className="bg-brown-900 text-olive-300 text-[10px] font-bold px-2 py-0.5 rounded shadow-sm flex items-center space-x-1 border border-brown-800">
              <Star className="w-2.5 h-2.5 fill-olive-400 text-olive-400" />
              <span>Featured</span>
            </span>
          )}
        </div>

        <div className="absolute top-3 right-3 pointer-events-none z-10">
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded shadow-sm ${
              prod.inStock !== false
                ? 'bg-olive-600 text-white'
                : 'bg-brown-800 text-white'
            }`}
          >
            {prod.inStock !== false ? 'In Stock' : 'Made to Order'}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <span className="text-[10px] uppercase tracking-wider font-semibold text-neutral-500 block mb-1">
            {prod.category || 'Furniture'}
          </span>
          <Link to={`/products/${prod.id}`}>
            <h3 className="font-bold text-sm text-neutral-900 hover:text-neutral-700 transition-colors line-clamp-1">
              {prod.name}
            </h3>
          </Link>
          {prod.material && (
            <p className="text-[11px] text-neutral-500 line-clamp-1 mt-0.5">
              {prod.material}
            </p>
          )}
        </div>

        <div className="pt-3 border-t border-neutral-100 flex items-center justify-between">
          <div>
            {hasDiscount ? (
              <div className="space-y-0.5">
                <div className="font-bold text-neutral-900 text-sm">
                  {formatCurrency(prod.offerPrice)}
                </div>
                <div className="line-through text-neutral-400 text-[11px]">
                  {formatCurrency(prod.regularPrice)}
                </div>
              </div>
            ) : (
              <div className="font-bold text-neutral-900 text-sm">
                {formatCurrency(prod.regularPrice)}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-1.5">
            <a
              href={whatsappMessage}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl bg-olive-50 text-olive-700 hover:bg-olive-600 hover:text-white transition-colors"
              title="Enquire on WhatsApp"
            >
              <MessageCircle className="w-4 h-4 text-olive-600 group-hover:text-olive-700" />
            </a>
            <Link
              to={`/products/${prod.id}`}
              className="p-2 rounded-xl bg-brown-900 text-white hover:bg-olive-700 transition-colors shadow-2xs"
              title="View Full Product Details"
            >
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
