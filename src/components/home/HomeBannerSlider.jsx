import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ArrowRight,
  MessageCircle,
  ShieldCheck,
  CheckCircle2,
  Wrench,
  Award,
  Play,
  Pause,
} from 'lucide-react';

const DEFAULT_SLIDES = [
  {
    id: 'slide-bed',
    tag: 'Luxury Bedroom Living',
    title: 'Solid Teak & Designer Wooden Cots',
    subtitle:
      'Handcrafted King and Queen size cots with hydraulic storage, seasoned solid wood frames, and direct factory showroom rates in Coimbatore.',
    image:
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1600&auto=format&fit=crop&q=80',
    primaryText: 'Explore Beds & Cots',
    primaryLink: '/products',
    secondaryText: 'WhatsApp Enquiry',
    secondaryType: 'whatsapp',
  },
  {
    id: 'slide-sofa',
    tag: 'Premium Living Room Furniture',
    title: 'Artisan Wooden & Luxury Fabric Sofas',
    subtitle:
      'Comfort-engineered living room sofas, L-shape sectionals, and solid teakwood couches built with high-density foam and durable upholstery.',
    image:
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1600&auto=format&fit=crop&q=80',
    primaryText: 'View Living & Sofas',
    primaryLink: '/products',
    secondaryText: 'Showroom Consultation',
    secondaryLink: '/contact',
  },
  {
    id: 'slide-dining',
    tag: 'Artisan Solid Teakwood',
    title: 'Hand-Finished Dining Tables & Chairs',
    subtitle:
      'Built for generations of family gatherings. Discover our handcrafted 4-seater and 6-seater solid wood dining sets at honest workshop rates.',
    image:
      'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=1600&auto=format&fit=crop&q=80',
    primaryText: 'View Dining Collections',
    primaryLink: '/products',
    secondaryText: 'Direct WhatsApp',
    secondaryType: 'whatsapp',
  },
];

export const HomeBannerSlider = ({ customBanners = [], whatsappUrl = '' }) => {
  // Use curated Bed, Sofa, and Dining Table slides
  const slides = React.useMemo(() => {
    if (customBanners && customBanners.length > 0) {
      const hasSofa = customBanners.some((b) =>
        (b.title && b.title.toLowerCase().includes('sofa')) ||
        (b.tag && b.tag.toLowerCase().includes('living'))
      );
      if (hasSofa) {
        return customBanners;
      }
    }
    return DEFAULT_SLIDES;
  }, [customBanners]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const AUTOPLAY_DELAY = 3000; // 3.0 seconds per slide (fast & dynamic transition)

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  }, [slides.length]);

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  // Autoplay Timer
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      nextSlide();
    }, AUTOPLAY_DELAY);

    return () => clearInterval(timer);
  }, [isPaused, nextSlide]);

  // Touch Swipe Handlers for Mobile Devices
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const deltaX = touchStartX.current - touchEndX.current;
    if (Math.abs(deltaX) > 50) {
      if (deltaX > 0) {
        nextSlide(); // Swiped Left -> Next
      } else {
        prevSlide(); // Swiped Right -> Prev
      }
    }
  };

  const currentSlide = slides[currentIndex];

  return (
    <div className="relative w-full overflow-hidden bg-white border-b border-brown-200/80">
      {/* Main Banner Slider Container (Reduced compact height) */}
      <div
        className="relative min-h-[480px] sm:min-h-[520px] lg:h-[580px] w-full flex items-center select-none"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        aria-roledescription="carousel"
        aria-label="Sleep Star Homepage Banners"
      >
        {/* Slides rendering with smooth cross-fade */}
        {slides.map((slide, index) => {
          const isActive = index === currentIndex;
          return (
            <div
              key={slide.id || index}
              className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
                isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
              aria-hidden={!isActive}
            >
              {/* Background Image: Bright, clear, natural furniture showroom photograph */}
              <img
                src={slide.image}
                alt={slide.title}
                className={`w-full h-full object-cover transform transition-transform duration-4000 ease-out ${
                  isActive ? 'scale-105' : 'scale-100'
                }`}
                loading={index === 0 ? 'eager' : 'lazy'}
              />

              {/* Soft subtle tint for contrast without dark brown discoloration */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/75 via-white/30 to-transparent sm:from-white/60 sm:via-transparent sm:to-transparent" />

              {/* Slide Content: Compact Luxury White Card */}
              <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
                <div className="w-full max-w-md sm:max-w-lg py-4 sm:py-6">
                  <div className="bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-xl border border-brown-200/60 space-y-3 sm:space-y-4 transition-all">
                    {/* Category / Highlight Pill */}
                    <div
                      className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-olive-50 text-olive-800 text-[11px] sm:text-xs font-semibold tracking-wide border border-olive-200 shadow-2xs transition-all duration-300 transform ${
                        isActive ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
                      }`}
                    >
                      <Sparkles className="w-3 h-3 text-olive-600" />
                      <span>{slide.tag}</span>
                    </div>

                    {/* Main Headline */}
                    <h1
                      className={`text-xl sm:text-2xl lg:text-3xl font-black text-brown-950 tracking-tight leading-snug transition-all duration-300 delay-75 transform ${
                        isActive ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
                      }`}
                    >
                      {slide.title}
                    </h1>

                    {/* Subtitle */}
                    <p
                      className={`text-xs sm:text-sm text-brown-800/85 leading-relaxed line-clamp-2 sm:line-clamp-none transition-all duration-300 delay-100 transform ${
                        isActive ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
                      }`}
                    >
                      {slide.subtitle}
                    </p>

                    {/* Action Buttons */}
                    <div
                      className={`flex flex-wrap items-center gap-2.5 pt-1 transition-all duration-300 delay-150 transform ${
                        isActive ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
                      }`}
                    >
                      {/* Primary Button: Olive Green */}
                      <Link
                        to={slide.primaryLink || '/products'}
                        className="inline-flex items-center space-x-1.5 px-4 py-2 sm:py-2.5 rounded-xl bg-olive-700 hover:bg-olive-800 text-white font-semibold text-xs sm:text-sm shadow-md hover:shadow-lg active:scale-95 transition-all"
                      >
                        <span>{slide.primaryText || 'Explore Catalogue'}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-olive-200" />
                      </Link>

                      {/* Secondary Button: White & Dark Brown outline */}
                      {slide.secondaryType === 'whatsapp' ? (
                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-1.5 px-4 py-2 sm:py-2.5 rounded-xl bg-white hover:bg-olive-50 text-brown-900 border border-brown-300 font-semibold text-xs sm:text-sm shadow-2xs active:scale-95 transition-all"
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-olive-700" />
                          <span>{slide.secondaryText || 'Direct WhatsApp'}</span>
                        </a>
                      ) : (
                        <Link
                          to={slide.secondaryLink || '/contact'}
                          className="inline-flex items-center space-x-1.5 px-4 py-2 sm:py-2.5 rounded-xl bg-white hover:bg-olive-50 text-brown-900 border border-brown-300 font-semibold text-xs sm:text-sm shadow-2xs active:scale-95 transition-all"
                        >
                          <span>{slide.secondaryText || 'Free Consultation'}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-brown-500" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Previous Slide Button */}
        <button
          onClick={prevSlide}
          aria-label="Previous Slide"
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-2.5 rounded-full bg-white/90 hover:bg-olive-700 hover:text-white text-brown-900 backdrop-blur-md border border-brown-200 transition-all hover:scale-105 shadow-md cursor-pointer group"
        >
          <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 group-hover:-translate-x-0.5 transition-transform" />
        </button>

        {/* Next Slide Button */}
        <button
          onClick={nextSlide}
          aria-label="Next Slide"
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-2.5 rounded-full bg-white/90 hover:bg-olive-700 hover:text-white text-brown-900 backdrop-blur-md border border-brown-200 transition-all hover:scale-105 shadow-md cursor-pointer group"
        >
          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-0.5 transition-transform" />
        </button>

        {/* Bottom Carousel Controls (Dots, Slide Counter, Pause/Play) */}
        <div className="absolute bottom-3 sm:bottom-4 left-0 right-0 z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
            {/* Slide Indicator Pills */}
            <div className="flex items-center space-x-1.5 bg-white/85 backdrop-blur-md px-2.5 py-1 rounded-full border border-brown-200/80 shadow-xs">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => goToSlide(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                  className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                    currentIndex === idx
                      ? 'w-6 sm:w-7 bg-olive-700 shadow-2xs'
                      : 'w-1.5 bg-brown-300 hover:bg-brown-400'
                  }`}
                />
              ))}
            </div>

            {/* Slide Counter Pill & Pause Toggle */}
            <div className="flex items-center space-x-1.5 bg-white/85 border border-brown-200 px-2.5 py-1 rounded-full backdrop-blur-md shadow-xs">
              <button
                type="button"
                onClick={() => setIsPaused(!isPaused)}
                className="text-brown-700 hover:text-olive-700 transition-colors cursor-pointer"
                title={isPaused ? 'Resume autoplay' : 'Pause autoplay'}
              >
                {isPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
              </button>
              <span className="text-brown-300 text-xs">|</span>
              <span className="font-mono text-[11px] sm:text-xs font-bold text-brown-900">
                0{currentIndex + 1} <span className="text-brown-500">/ 0{slides.length}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Autoplay Active Progress Bar at Bottom of Slider */}
        {!isPaused && (
          <div
            key={currentIndex}
            className="absolute bottom-0 left-0 h-1 bg-olive-600 z-30"
            style={{
              animation: `slideProgress ${AUTOPLAY_DELAY}ms linear forwards`,
            }}
          />
        )}
      </div>

      {/* Floating Trust Pillars Bar directly below slider */}
      <div className="bg-white border-b border-brown-200/80 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-brown-900">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-olive-50 text-olive-700 flex items-center justify-center shrink-0 border border-olive-200">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="leading-tight">
                <p className="text-xs sm:text-sm font-bold text-brown-950">Solid Teak & Hardwood</p>
                <p className="text-[11px] text-brown-600">Seasoned & 100% termite proof</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-olive-50 text-olive-700 flex items-center justify-center shrink-0 border border-olive-200">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="leading-tight">
                <p className="text-xs sm:text-sm font-bold text-brown-950">Direct Factory Rates</p>
                <p className="text-[11px] text-brown-600">No middleman showroom markups</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-olive-50 text-olive-700 flex items-center justify-center shrink-0 border border-olive-200">
                <Wrench className="w-5 h-5" />
              </div>
              <div className="leading-tight">
                <p className="text-xs sm:text-sm font-bold text-brown-950">Free Laser Survey</p>
                <p className="text-[11px] text-brown-600">Precise on-site consultation</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-olive-50 text-olive-700 flex items-center justify-center shrink-0 border border-olive-200">
                <Award className="w-5 h-5" />
              </div>
              <div className="leading-tight">
                <p className="text-xs sm:text-sm font-bold text-brown-950">10-Year Warranty</p>
                <p className="text-[11px] text-brown-600">Enduring craftsmanship guarantee</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

