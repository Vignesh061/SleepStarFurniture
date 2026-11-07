import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  MessageCircle,
  ShieldCheck,
  Truck,
  CheckCircle2,
  Share2,
  Heart,
  Star,
  Award,
  ChevronRight,
  ChevronLeft,
  PhoneCall,
  Sparkles,
  Package,
  FileText,
  Image as ImageIcon,
} from 'lucide-react';
import { productService } from '../../services/productService';
import { formatCurrency, formatWhatsAppLink } from '../../utils/formatters';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EnquiryModal } from '../../components/common/EnquiryModal';

export const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [activeImage, setActiveImage] = useState('');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isEnquiryModalOpen, setIsEnquiryModalOpen] = useState(false);

  const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '919876543210';
  const phone = import.meta.env.VITE_BUSINESS_PHONE || '+91 98765 43210';

  useEffect(() => {
    const fetchProductDetails = async () => {
      setLoading(true);
      try {
        const prod = await productService.getById(id);
        setProduct(prod);

        if (prod) {
          const cover =
            prod.coverImage ||
            prod.imageUrl ||
            (prod.images && prod.images[0]) ||
            '';
          setActiveImage(cover);

          // Fetch related products in the same category
          const allPublished = await productService.getAllPublished();
          const related = allPublished
            .filter((p) => p.id !== id && (p.categoryId === prod.categoryId || p.category === prod.category))
            .slice(0, 4);
          setRelatedProducts(related);
        }
      } catch (err) {
        console.error('Error fetching product details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [id]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product?.name,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  if (loading) {
    return (
      <div className="py-32 flex justify-center">
        <LoadingSpinner size="lg" text="Loading furniture specifications..." />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center space-y-4">
        <h2 className="text-2xl font-bold text-neutral-900">Product Not Found</h2>
        <p className="text-sm text-neutral-500">
          The furniture piece you are looking for may have been archived or is no longer listed.
        </p>
        <Link
          to="/products"
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-neutral-900 text-white text-xs font-semibold hover:bg-neutral-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Catalogue</span>
        </Link>
      </div>
    );
  }

  // Deduplicate and aggregate all raw images (coverImage, imageUrl, and images array)
  const allRawImages = [
    product.coverImage,
    product.imageUrl,
    ...(Array.isArray(product.images) ? product.images : []),
  ].filter(Boolean);
  const galleryImages = Array.from(new Set(allRawImages));

  const currentImageDisplay = activeImage || galleryImages[0] || '';
  const currentImageIdx = galleryImages.indexOf(currentImageDisplay);

  const handleNextImage = () => {
    if (galleryImages.length <= 1) return;
    const nextIdx = (currentImageIdx + 1) % galleryImages.length;
    setActiveImage(galleryImages[nextIdx]);
  };

  const handlePrevImage = () => {
    if (galleryImages.length <= 1) return;
    const prevIdx = (currentImageIdx - 1 + galleryImages.length) % galleryImages.length;
    setActiveImage(galleryImages[prevIdx]);
  };

  const hasDiscount =
    product.offerPrice &&
    product.regularPrice &&
    Number(product.offerPrice) < Number(product.regularPrice);

  const discountPct = hasDiscount
    ? Math.round(
        ((product.regularPrice - product.offerPrice) / product.regularPrice) * 100
      )
    : 0;

  const relevantPrice = formatCurrency(product.offerPrice || product.regularPrice);

  const whatsappInquiryUrl = formatWhatsAppLink(
    whatsappNumber,
    `Hello Sleep Star Furniture, I am inquiring about "${product.name}" (Price: ${relevantPrice}). Could you please share more photographs, exact dimensions, or arrange a showroom visit? Reference link: ${window.location.href}`
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-16">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center space-x-2 text-xs text-neutral-500">
        <Link to="/" className="hover:text-neutral-900">Home</Link>
        <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
        <Link to="/products" className="hover:text-neutral-900">Products</Link>
        {product.category && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
            <Link
              to={`/products?category=${product.categoryId || product.category}`}
              className="hover:text-neutral-900"
            >
              {product.category}
            </Link>
          </>
        )}
        <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
        <span className="text-neutral-900 font-semibold truncate max-w-xs">
          {product.name}
        </span>
      </nav>

      {/* Main Product Showcase Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left: Image Gallery (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Active Main View */}
          <div className="relative aspect-4/3 rounded-3xl bg-neutral-100 overflow-hidden border border-neutral-200 shadow-sm group">
            {currentImageDisplay ? (
              <img
                src={currentImageDisplay}
                alt={product.name}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=800&auto=format&fit=crop&q=80';
                }}
                className="w-full h-full object-cover transition-all duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-neutral-400 font-bold">
                Sleep Star Furniture
              </div>
            )}

            {/* Navigation Arrows for Multiple Photos */}
            {galleryImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrevImage}
                  aria-label="Previous photograph"
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-neutral-900 flex items-center justify-center shadow-lg transition-transform hover:scale-105 opacity-80 group-hover:opacity-100 focus:outline-none"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={handleNextImage}
                  aria-label="Next photograph"
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-neutral-900 flex items-center justify-center shadow-lg transition-transform hover:scale-105 opacity-80 group-hover:opacity-100 focus:outline-none"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                {/* Counter Pill */}
                <div className="absolute bottom-4 right-4 bg-brown-900/90 backdrop-blur-xs text-olive-200 text-xs font-semibold px-3 py-1.5 rounded-full shadow-md flex items-center space-x-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-olive-300" />
                  <span>
                    {currentImageIdx >= 0 ? currentImageIdx + 1 : 1} of {galleryImages.length} Photos
                  </span>
                </div>
              </>
            )}

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col space-y-1.5">
              {hasDiscount && (
                <span className="bg-olive-700 text-white text-xs font-bold px-3 py-1 rounded-md shadow-sm">
                  {discountPct}% SAVINGS
                </span>
              )}
              {product.isFeatured && (
                <span className="bg-brown-900 text-olive-300 text-xs font-bold px-3 py-1 rounded-md shadow-sm flex items-center space-x-1 border border-brown-800">
                  <Star className="w-3 h-3 fill-olive-400 text-olive-400" />
                  <span>Showroom Featured</span>
                </span>
              )}
            </div>

            <div className="absolute top-4 right-4">
              <span
                className={`text-xs font-bold px-3 py-1 rounded-md shadow-sm ${
                  product.inStock !== false
                    ? 'bg-olive-600 text-white'
                    : 'bg-brown-800 text-white'
                }`}
              >
                {product.inStock !== false ? 'In Stock' : 'Custom Built'}
              </span>
            </div>
          </div>

          {/* Thumbnails Row */}
          {galleryImages.length > 1 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-neutral-500 font-medium px-1">
                <span>All Available Angles ({galleryImages.length} Photos)</span>
                <span className="text-[11px] text-neutral-400">Click to preview</span>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2.5 pt-1">
                {galleryImages.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImage(img)}
                    className={`aspect-square rounded-xl overflow-hidden border-2 transition-all relative ${
                      currentImageDisplay === img
                        ? 'border-olive-700 ring-2 ring-olive-700/40 shadow-sm scale-102'
                        : 'border-brown-200 opacity-75 hover:opacity-100 hover:border-olive-400'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`View ${idx + 1}`}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=800&auto=format&fit=crop&q=80';
                      }}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-1 right-1 text-[9px] font-bold px-1 rounded bg-black/60 text-white leading-tight">
                      #{idx + 1}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Product Details & Enquiry Actions (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
              {product.category || 'Handcrafted Furniture'}
            </span>
            <h1 className="text-3xl font-bold tracking-tight text-neutral-900 leading-tight">
              {product.name}
            </h1>
            {product.material && (
              <p className="text-xs font-medium text-neutral-600">
                Primary Craft: <span className="text-neutral-900 font-semibold">{product.material}</span>
              </p>
            )}
          </div>

          {/* Pricing Card */}
          <div className="p-5 rounded-2xl bg-white border border-neutral-200 shadow-2xs space-y-2">
            <div className="flex items-baseline space-x-3">
              {hasDiscount ? (
                <>
                  <span className="text-3xl font-bold text-neutral-900">
                    {formatCurrency(product.offerPrice)}
                  </span>
                  <span className="text-sm line-through text-neutral-400">
                    {formatCurrency(product.regularPrice)}
                  </span>
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                    Save {formatCurrency(product.regularPrice - product.offerPrice)}
                  </span>
                </>
              ) : (
                <span className="text-3xl font-bold text-neutral-900">
                  {formatCurrency(product.regularPrice)}
                </span>
              )}
            </div>
            <p className="text-[11px] text-neutral-500">
              Direct factory showroom rate. All taxes included. Custom polish and dimensions available upon request.
            </p>
          </div>

          {/* WhatsApp Direct Enquiry Action */}
          <div className="space-y-3 pt-2">
            <a
              href={whatsappInquiryUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center space-x-2.5 px-6 py-4 rounded-xl bg-olive-700 text-white font-semibold hover:bg-olive-800 active:scale-98 transition-all shadow-md text-sm cursor-pointer"
            >
              <MessageCircle className="w-5 h-5 text-olive-200" />
              <span>Enquire via WhatsApp</span>
            </a>

            <button
              type="button"
              onClick={() => setIsEnquiryModalOpen(true)}
              className="w-full flex items-center justify-center space-x-2 px-6 py-3.5 rounded-xl border border-brown-300 bg-white text-brown-900 font-semibold hover:bg-olive-50 transition-colors text-xs shadow-2xs cursor-pointer"
            >
              <FileText className="w-4 h-4 text-olive-700" />
              <span>Submit Custom Dimensions / Request Quote Online</span>
            </button>

            <div className="grid grid-cols-2 gap-3">
              <a
                href={`tel:${phone.replace(/\s+/g, '')}`}
                className="flex items-center justify-center space-x-2 px-4 py-3 rounded-xl border border-neutral-300 bg-white text-neutral-800 text-xs font-semibold hover:bg-neutral-50 transition-colors shadow-2xs"
              >
                <PhoneCall className="w-3.5 h-3.5 text-neutral-600" />
                <span>Call Showroom</span>
              </a>

              <button
                onClick={handleShare}
                className="flex items-center justify-center space-x-2 px-4 py-3 rounded-xl border border-neutral-300 bg-white text-neutral-800 text-xs font-semibold hover:bg-neutral-50 transition-colors shadow-2xs cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5 text-neutral-600" />
                <span>{copied ? 'Link Copied!' : 'Share Design'}</span>
              </button>
            </div>
          </div>

          {/* Description */}
          {product.description && (
            <div className="pt-4 border-t border-neutral-200 space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900">
                Description
              </h3>
              <p className="text-xs text-neutral-600 leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>
          )}

          {/* Technical Specifications Table */}
          <div className="pt-4 border-t border-neutral-200 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900">
              Product Specifications
            </h3>

            <div className="divide-y divide-neutral-100 text-xs rounded-xl bg-neutral-50/70 p-4 border border-neutral-200">
              {product.dimensions && (
                <div className="py-2 flex justify-between">
                  <span className="text-neutral-500">Dimensions</span>
                  <span className="font-semibold text-neutral-900 text-right">{product.dimensions}</span>
                </div>
              )}
              {product.material && (
                <div className="py-2 flex justify-between">
                  <span className="text-neutral-500">Material Grade</span>
                  <span className="font-semibold text-neutral-900 text-right">{product.material}</span>
                </div>
              )}
              {product.woodType && (
                <div className="py-2 flex justify-between">
                  <span className="text-neutral-500">Wood Spec</span>
                  <span className="font-semibold text-neutral-900 text-right">{product.woodType}</span>
                </div>
              )}
              {product.warranty && (
                <div className="py-2 flex justify-between">
                  <span className="text-neutral-500">Warranty</span>
                  <span className="font-semibold text-neutral-900 text-right">{product.warranty}</span>
                </div>
              )}
              {product.specifications && (
                <div className="py-2 flex justify-between">
                  <span className="text-neutral-500">Features</span>
                  <span className="font-semibold text-neutral-900 text-right">{product.specifications}</span>
                </div>
              )}
            </div>
          </div>

          {/* Service Guarantee Badges */}
          <div className="grid grid-cols-2 gap-3 pt-2 text-xs text-neutral-600">
            <div className="flex items-center space-x-2">
              <Award className="w-4 h-4 text-neutral-900 flex-shrink-0" />
              <span>Direct Factory Guarantee</span>
            </div>
            <div className="flex items-center space-x-2">
              <Truck className="w-4 h-4 text-neutral-900 flex-shrink-0" />
              <span>Safe Delivery & Assembly</span>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <section className="pt-12 border-t border-neutral-200 space-y-8">
          <div className="flex justify-between items-end">
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
                You May Also Like
              </span>
              <h2 className="text-2xl font-bold text-neutral-900 tracking-tight mt-1">
                More in {product.category || 'This Collection'}
              </h2>
            </div>
            <Link
              to="/products"
              className="text-xs font-bold text-neutral-900 hover:underline"
            >
              Browse All →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((rel) => {
              const relCover = rel.coverImage || (rel.images && rel.images[0]) || '';
              return (
                <Link
                  key={rel.id}
                  to={`/products/${rel.id}`}
                  className="group bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="aspect-4/3 bg-neutral-100 overflow-hidden">
                    {relCover ? (
                      <img
                        src={relCover}
                        alt={rel.name}
                        className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-neutral-400">
                        Sleep Star
                      </div>
                    )}
                  </div>
                  <div className="p-4 space-y-1">
                    <h4 className="font-bold text-sm text-neutral-900 group-hover:text-neutral-700 truncate">
                      {rel.name}
                    </h4>
                    <div className="font-bold text-xs text-neutral-900">
                      {formatCurrency(rel.offerPrice || rel.regularPrice)}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Direct Online Enquiry Modal */}
      <EnquiryModal
        isOpen={isEnquiryModalOpen}
        onClose={() => setIsEnquiryModalOpen(false)}
        defaultType="Product Enquiry"
        relatedItemId={product.id}
        relatedItemName={product.name}
        title={`Enquiry for "${product.name}"`}
        subtitle="Share your room dimensions, preferred finish, or ask any question."
      />
    </div>
  );
};
