import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Layers,
  Wrench,
  CheckCircle2,
  Clock,
  PhoneCall,
  MessageCircle,
  Star,
  MapPin,
  ChevronRight,
  Award,
  Truck,
  IndianRupee,
  FolderGit2,
  SlidersHorizontal,
  ChevronDown,
} from 'lucide-react';
import { productService } from '../../services/productService';
import { categoryService } from '../../services/categoryService';
import { serviceService } from '../../services/serviceService';
import { projectService } from '../../services/projectService';
import { formatCurrency, formatWhatsAppLink } from '../../utils/formatters';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useSettings } from '../../context/SettingsContext';
import { HomeBannerSlider } from '../../components/home/HomeBannerSlider';

export const Home = () => {
  const { settings } = useSettings();
  const [categories, setCategories] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [showAllProducts, setShowAllProducts] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [services, setServices] = useState([]);
  const [recentProjects, setRecentProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const whatsappNumber =
    settings?.whatsappNumber ||
    import.meta.env.VITE_WHATSAPP_NUMBER ||
    '919876543210';
  const whatsappUrl = formatWhatsAppLink(
    whatsappNumber,
    'Hello Sleep Star Furniture, I am interested in exploring your custom furniture solutions and ready-made collections.'
  );

  const heroHeadline =
    settings?.banners?.[0]?.title || 'Master Woodwork, Tailored For Living.';
  const heroSubtitle =
    settings?.banners?.[0]?.subtitle ||
    'Sleep Star Furniture brings premium ready-made dining sets, luxury beds, modular wardrobes, and custom interior design to residences across Coimbatore and surrounding regions.';

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const [cats, prods, servs, projs] = await Promise.all([
          categoryService.getActive(),
          productService.getAllPublished(),
          serviceService.getActive(),
          projectService.getAllPublished(),
        ]);

        setCategories(cats || []);

        // Sort products so featured pieces appear first, followed by all other products
        const sorted = Array.isArray(prods)
          ? [...prods].sort((a, b) => {
              if (a.isFeatured && !b.isFeatured) return -1;
              if (!a.isFeatured && b.isFeatured) return 1;
              return 0;
            })
          : [];

        setAllProducts(sorted);

        // Featured services or top 4 services
        const featuredServs = servs.filter((s) => s.isFeatured);
        setServices(featuredServs.length > 0 ? featuredServs.slice(0, 4) : servs.slice(0, 4));

        // Featured completed projects or top 3 projects
        const featuredProjs = projs.filter((p) => p.isFeatured);
        setRecentProjects(featuredProjs.length > 0 ? featuredProjs.slice(0, 3) : projs.slice(0, 3));
      } catch (err) {
        console.error('Error loading home data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadHomeData();
  }, []);

  // Collect all unique categories from products & active categories
  const availableCategories = useMemo(() => {
    const map = new Map();
    categories.forEach((cat) => {
      const name = cat.name || cat.title;
      if (name) map.set(name.toLowerCase(), name);
    });
    allProducts.forEach((p) => {
      if (p.category && p.category.trim()) {
        map.set(p.category.toLowerCase(), p.category.trim());
      }
    });
    return Array.from(map.values());
  }, [categories, allProducts]);

  // Filtered products list to render
  const displayedProducts = useMemo(() => {
    let list = allProducts;
    if (selectedCategory !== 'all') {
      list = list.filter(
        (p) =>
          p.category?.toLowerCase() === selectedCategory.toLowerCase() ||
          p.categoryId === selectedCategory
      );
    }

    // Initially show multiple products (first 4 items for 4 columns, or all if <= 4).
    // When showAllProducts is true or user filtered by category, show all matching products!
    if (!showAllProducts && selectedCategory === 'all') {
      return list.slice(0, 4);
    }
    return list;
  }, [allProducts, selectedCategory, showAllProducts]);

  return (
    <div className="space-y-16 sm:space-y-24 pb-20">
      {/* 1. HERO SLIDING BANNER */}
      <HomeBannerSlider
        customBanners={settings?.banners}
        whatsappUrl={whatsappUrl}
      />

      {/* 2. FEATURED PRODUCTS SHOWCASE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 gap-4">
          <div>
            <div className="inline-flex items-center space-x-1.5 text-xs font-semibold uppercase tracking-widest text-olive-700 mb-1">
              <Star className="w-3.5 h-3.5 text-olive-600 fill-olive-600" />
              <span>Showroom Highlights</span>
            </div>
            <h2 className="text-3xl font-bold text-brown-950 tracking-tight">
              Featured Furniture Pieces
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setShowAllProducts((prev) => !prev);
                if (showAllProducts) {
                  setSelectedCategory('all');
                }
              }}
              className={`inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-2xs ${
                showAllProducts
                  ? 'bg-neutral-900 text-white hover:bg-neutral-800'
                  : 'bg-olive-700 text-white hover:bg-olive-800'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>{showAllProducts ? 'Showing All Products' : 'Explore Categories'}</span>
              {allProducts.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 font-semibold">
                  {allProducts.length}
                </span>
              )}
            </button>
            <Link
              to="/products"
              className="inline-flex items-center space-x-1 text-xs font-bold text-olive-700 hover:text-olive-800"
            >
              <span>Full Catalogue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Dynamic Category Filter Pills (Shown when Explore Categories is clicked or active) */}
        {showAllProducts && availableCategories.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-4 scrollbar-none animate-fadeIn">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-olive-700 text-white shadow-2xs'
                  : 'bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50'
              }`}
            >
              All Products ({allProducts.length})
            </button>
            {availableCategories.map((cat) => {
              const count = allProducts.filter(
                (p) => p.category?.toLowerCase() === cat.toLowerCase()
              ).length;
              const isSelected = selectedCategory.toLowerCase() === cat.toLowerCase();
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                    isSelected
                      ? 'bg-olive-700 text-white shadow-2xs'
                      : 'bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                  }`}
                >
                  {cat} {count > 0 && <span className="opacity-75 font-normal">({count})</span>}
                </button>
              );
            })}
          </div>
        )}

        {loading ? (
          <div className="py-16 flex justify-center">
            <LoadingSpinner text="Loading showroom pieces..." />
          </div>
        ) : displayedProducts.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-neutral-200 text-center space-y-2">
            <p className="text-sm font-semibold text-neutral-800">No Furniture Pieces Found</p>
            <p className="text-xs text-neutral-500">
              {selectedCategory !== 'all'
                ? `No products found in the "${selectedCategory}" category.`
                : 'Visit our catalogue to browse the latest ready-made collections.'}
            </p>
            {selectedCategory !== 'all' && (
              <button
                onClick={() => setSelectedCategory('all')}
                className="mt-2 text-xs font-bold text-olive-700 hover:underline"
              >
                Clear filter & show all products
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {displayedProducts.map((prod) => {
                const cover = prod.coverImage || (prod.images && prod.images[0]) || '';
                const hasDiscount = prod.offerPrice && prod.regularPrice && Number(prod.offerPrice) < Number(prod.regularPrice);
                const discountPct = hasDiscount ? Math.round(((prod.regularPrice - prod.offerPrice) / prod.regularPrice) * 100) : 0;

                const prodWhatsappUrl = formatWhatsAppLink(
                  whatsappNumber,
                  `Hello Sleep Star Furniture, I am interested in: "${prod.name}" (Price: ${formatCurrency(prod.offerPrice || prod.regularPrice)}). Is this available?`
                );

                return (
                  <div
                    key={prod.id}
                    className="group bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <Link to={`/products/${prod.id}`} className="block relative aspect-4/3 bg-neutral-100 overflow-hidden">
                      {cover ? (
                        <img
                          src={cover}
                          alt={prod.name}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=600&auto=format&fit=crop&q=80';
                          }}
                          className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-neutral-400 font-bold">
                          Sleep Star
                        </div>
                      )}
                      {hasDiscount && (
                        <div className="absolute top-3 left-3 bg-neutral-900 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
                          {discountPct}% OFF
                        </div>
                      )}
                      {prod.inStock === false && (
                        <div className="absolute top-3 right-3 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
                          Made to Order
                        </div>
                      )}
                      {Array.isArray(prod.images) && prod.images.length > 1 && (
                        <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded bg-neutral-900/80 backdrop-blur-xs text-white text-[10px] font-semibold">
                          {prod.images.length} photos
                        </div>
                      )}
                    </Link>

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

                        <a
                          href={prodWhatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-xl bg-neutral-100 text-neutral-800 hover:bg-neutral-900 hover:text-white transition-colors"
                          title="Enquire on WhatsApp"
                        >
                          <MessageCircle className="w-4 h-4 text-emerald-600 hover:text-white" />
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom CTA when not showing all */}
            {!showAllProducts && allProducts.length > displayedProducts.length && (
              <div className="pt-8 flex justify-center">
                <button
                  onClick={() => {
                    setShowAllProducts(true);
                    setSelectedCategory('all');
                  }}
                  className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-white border border-neutral-300 text-neutral-800 hover:bg-olive-50 hover:text-olive-700 hover:border-olive-300 font-bold text-xs transition-all shadow-2xs"
                >
                  <SlidersHorizontal className="w-4 h-4 text-olive-600" />
                  <span>Explore Categories & Show All Products ({allProducts.length})</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* 4. CUSTOM INTERIOR SERVICES HIGHLIGHT */}
      <section className="bg-brown-950 text-white py-20 border-y border-brown-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
            <div className="max-w-xl space-y-2">
              <span className="text-xs font-semibold uppercase tracking-widest text-olive-300">
                Custom Furniture & Interiors
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
                Engineered For Your Exact Room Dimensions
              </h2>
              <p className="text-brown-200/80 text-sm leading-relaxed">
                Beyond ready-made furniture, we design and manufacture custom modular kitchens, bespoke master wardrobes, and acoustic TV wall panels tailored to your architectural floor plan.
              </p>
            </div>
            <Link
              to="/services"
              className="inline-flex items-center space-x-2 px-5 py-3 rounded-xl bg-olive-600 text-white text-xs font-bold hover:bg-olive-500 transition-colors shadow-md"
            >
              <span>Explore All Services</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {(services.length > 0 ? services : [
              { title: 'Modular Kitchens', startingPrice: 120000, description: 'Acrylic and PU finish with soft-close German fittings.' },
              { title: 'Custom Wardrobes', startingPrice: 65000, description: 'Floor to ceiling sliding wardrobes with internal organisers.' },
              { title: 'Custom TV Units', startingPrice: 35000, description: 'Fluted wood panels and floating consoles with ambient LED.' },
              { title: 'On-Site Fitting', startingPrice: 15000, description: 'Turnkey carpentry and installation by master craftsmen.' },
            ]).map((srv, idx) => (
              <div
                key={srv.id || idx}
                className="bg-brown-900/90 rounded-2xl border border-brown-800 p-6 space-y-4 hover:border-olive-500 transition-all flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="text-xs text-olive-300 font-semibold uppercase tracking-wider">
                    {srv.startingPrice ? `From ${formatCurrency(srv.startingPrice)}` : 'Custom Quote'}
                  </div>
                  <h3 className="text-lg font-bold text-white">
                    {srv.title || srv.name}
                  </h3>
                  <p className="text-xs text-brown-200/80 leading-relaxed line-clamp-3">
                    {srv.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-brown-800">
                  <Link
                    to="/services"
                    className="inline-flex items-center space-x-1.5 text-xs font-semibold text-olive-300 hover:text-white"
                  >
                    <span>Request Quotation</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. RECENTLY COMPLETED PROJECTS PORTFOLIO */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 gap-4">
          <div>
            <div className="inline-flex items-center space-x-1.5 text-xs font-semibold uppercase tracking-widest text-olive-700 mb-1">
              <FolderGit2 className="w-3.5 h-3.5" />
              <span>Real Customer Installations</span>
            </div>
            <h2 className="text-3xl font-bold text-brown-950 tracking-tight">
              Recently Completed Projects
            </h2>
          </div>
          <Link
            to="/projects"
            className="inline-flex items-center space-x-1.5 text-xs font-bold text-olive-700 hover:text-olive-800"
          >
            <span>View Full Portfolio Gallery</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {recentProjects.length === 0 ? (
          <div className="p-8 bg-white rounded-2xl border border-brown-200 text-center space-y-2">
            <p className="text-sm font-semibold text-brown-900">Portfolio Updating</p>
            <p className="text-xs text-brown-600">Completed furniture installations will be showcased here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recentProjects.map((proj) => {
              const cover = proj.coverImage || (proj.images && proj.images[0]) || '';
              const exactEnquiryUrl = formatWhatsAppLink(
                whatsappNumber,
                `Hello Sleep Star Furniture, I want to enquire about creating the exact same design as your completed project: "${proj.title}" in ${proj.location || 'Coimbatore'}.`
              );

              return (
                <div
                  key={proj.id}
                  className="group bg-white rounded-2xl border border-brown-200/80 overflow-hidden shadow-2xs hover:shadow-md hover:border-olive-400 transition-all flex flex-col justify-between"
                >
                  <Link to={`/projects/${proj.id}`} className="block relative aspect-4/3 bg-brown-50 overflow-hidden">
                    {cover ? (
                      <img
                        src={cover}
                        alt={proj.title}
                        className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-brown-400">
                        Sleep Star Project
                      </div>
                    )}
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-olive-700/90 text-white text-[10px] font-semibold">
                      {proj.category || 'Custom Work'}
                    </span>
                  </Link>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-1.5">
                      <div className="flex items-center space-x-1 text-[11px] text-olive-800/80 font-medium">
                        <MapPin className="w-3 h-3 text-olive-700" />
                        <span>{proj.location || 'Coimbatore'}</span>
                      </div>
                      <Link to={`/projects/${proj.id}`}>
                        <h3 className="font-bold text-sm text-brown-900 hover:text-olive-700 transition-colors line-clamp-2">
                          {proj.title}
                        </h3>
                      </Link>
                      {proj.description && (
                        <p className="text-xs text-brown-700/80 line-clamp-2 leading-relaxed">
                          {proj.description}
                        </p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-brown-100 flex items-center justify-between">
                      <Link
                        to={`/projects/${proj.id}`}
                        className="text-xs font-bold text-olive-700 hover:text-olive-800 hover:underline"
                      >
                        View Project Details →
                      </Link>
                      <a
                        href={exactEnquiryUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-xl bg-olive-50 text-olive-700 hover:bg-olive-600 hover:text-white transition-colors"
                        title="Enquire about this design"
                      >
                        <MessageCircle className="w-4 h-4 text-olive-600 hover:text-white" />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 6. WHY CHOOSE SLEEP STAR FURNITURE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-olive-700">
            Our Standards
          </span>
          <h2 className="text-3xl font-bold text-brown-950 tracking-tight">
            Why Discerning Homeowners Choose Sleep Star
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-2xl border border-brown-200/80 p-8 space-y-4 shadow-2xs hover:border-olive-400 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-olive-50 text-olive-700 border border-olive-200 flex items-center justify-center font-bold text-lg">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-brown-900">100% Solid Wood & BWP Marine Ply</h3>
            <p className="text-sm text-brown-700/80 leading-relaxed">
              We never compromise on timber. All cots, dining tables, and interior carcasses utilize seasoned teakwood or water-resistant BWP marine ply with anti-termite treatment.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-brown-200/80 p-8 space-y-4 shadow-2xs hover:border-olive-400 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-olive-50 text-olive-700 border border-olive-200 flex items-center justify-center font-bold text-lg">
              <IndianRupee className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-brown-900">Direct Factory Price Advantage</h3>
            <p className="text-sm text-brown-700/80 leading-relaxed">
              By designing, manufacturing, and polishing in our dedicated workshop, we eliminate distributor margins and offer genuine value directly to the customer.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-brown-200/80 p-8 space-y-4 shadow-2xs hover:border-olive-400 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-olive-50 text-olive-700 border border-olive-200 flex items-center justify-center font-bold text-lg">
              <Truck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-brown-900">White-Glove On-Site Fitting</h3>
            <p className="text-sm text-brown-700/80 leading-relaxed">
              Our carpentry specialists personally transport and install your furniture on-site, ensuring flush alignment, soft-close calibration, and pristine finish.
            </p>
          </div>
        </div>
      </section>

      {/* 7. CUSTOMER TESTIMONIALS */}
      <section className="bg-brown-50/60 py-16 sm:py-20 border-y border-brown-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-olive-700">
              Customer Experiences
            </span>
            <h2 className="text-3xl font-bold text-brown-950 tracking-tight">
              Words From Our Clients
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: 'Karthik & Deepa',
                location: 'Race Course, Coimbatore',
                text: 'Sleep Star delivered our custom 6-seater solid teak dining table and TV unit paneling on time. The wood polish and seamless wire concealment were executed flawlessly.',
                rating: 5,
              },
              {
                name: 'Dr. S. Vignesh',
                location: 'RS Puram, Coimbatore',
                text: 'The acrylic modular kitchen and sliding master wardrobe are of exceptional quality. German soft-close hinges and durable marine ply. Highly recommend their craftsmanship.',
                rating: 5,
              },
              {
                name: 'Anand Kumar',
                location: 'Saravanampatti, Coimbatore',
                text: 'We bought a king-size hydraulic cot and custom TV unit. Direct factory pricing with zero middleman charges. The team arrived on site and assembled everything with precision.',
                rating: 5,
              },
            ].map((t, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-brown-200/80 p-6 space-y-4 shadow-2xs"
              >
                <div className="flex items-center space-x-1 text-olive-600">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-olive-600" />
                  ))}
                </div>
                <p className="text-xs text-brown-800 leading-relaxed italic">
                  "{t.text}"
                </p>
                <div className="pt-2 border-t border-brown-100">
                  <div className="font-bold text-sm text-brown-900">{t.name}</div>
                  <div className="text-[11px] text-olive-700 font-medium">{t.location}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
