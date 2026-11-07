import React, { useState } from 'react';

/**
 * BrandLogo component:
 * 1. Loads logo image from public folder (default: /logo.jpeg)
 * 2. Displays brand name typography beside/after the logo
 * 3. Graceful fallback monogram in Olive Green & Dark Brown if image is missing
 */
const LOGO_SOURCES = ['/logo.jpeg', '/logo.png', '/logo.svg', '/logo.jpg', '/logo.webp'];

export const BrandLogo = ({
  size = 'md',
  showText = true,
  theme = 'dark', // 'dark' (for white background) | 'light' (for dark brown background)
  className = '',
  brandName = 'Sleep Star',
  tagline = 'Furniture & Interiors',
}) => {
  const [srcIndex, setSrcIndex] = useState(0);
  const [hasError, setHasError] = useState(false);

  const handleImageError = () => {
    if (srcIndex < LOGO_SOURCES.length - 1) {
      setSrcIndex((prev) => prev + 1);
    } else {
      setHasError(true);
    }
  };

  const iconSizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-11 h-11 text-base',
    lg: 'w-14 h-14 text-lg',
  };

  return (
    <div className={`flex items-center space-x-2.5 sm:space-x-3.5 group ${className}`}>
      {/* 1. Logo image */}
      {!hasError ? (
        <img
          src={LOGO_SOURCES[srcIndex]}
          alt="Sleep Star Logo"
          onError={handleImageError}
          className={`object-contain rounded-lg shrink-0 transition-transform group-hover:scale-105 ${
            size === 'sm'
              ? 'h-8 w-auto max-w-[100px]'
              : size === 'lg'
              ? 'h-14 w-auto max-w-[180px]'
              : 'h-10 sm:h-12 w-auto max-w-[120px] sm:max-w-[160px]'
          } ${theme === 'light' ? 'bg-white/95 p-1' : ''}`}
        />
      ) : (
        /* 2. Fallback Monogram in Olive Green & Dark Brown */
        <div
          className={`${iconSizes[size] || iconSizes.md} shrink-0 rounded-xl font-bold flex items-center justify-center tracking-widest shadow-xs transition-all ${
            theme === 'light'
              ? 'bg-olive-600 text-white border border-olive-500/40 group-hover:bg-olive-500'
              : 'bg-brown-900 text-olive-200 border border-brown-800 group-hover:bg-brown-800'
          }`}
        >
          SS
        </div>
      )}

      {/* 3. Brand Name written right after the logo */}
      {showText && (
        <div className="flex flex-col leading-tight select-none">
          <span
            className={`font-black tracking-tight uppercase ${
              size === 'sm'
                ? 'text-sm sm:text-base'
                : size === 'lg'
                ? 'text-2xl sm:text-3xl'
                : 'text-base sm:text-xl lg:text-2xl'
            } ${theme === 'light' ? 'text-white' : 'text-brown-950'}`}
          >
            {brandName}
          </span>
          <span
            className={`tracking-[0.2em] sm:tracking-[0.25em] font-bold uppercase mt-0.5 ${
              size === 'sm'
                ? 'text-[8px]'
                : size === 'lg'
                ? 'text-[11px] sm:text-xs'
                : 'text-[8.5px] sm:text-[10px]'
            } ${theme === 'light' ? 'text-olive-300' : 'text-olive-700'}`}
          >
            {tagline}
          </span>
        </div>
      )}
    </div>
  );
};
