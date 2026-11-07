import React from 'react';
import { SleepStarLogoAnimation } from './SleepStarLogoAnimation';

/**
 * LoadingSpinner
 * Displays the exact Sleep Star Furniture animated logo reveal from public/sleep-star-logo-animation.html
 * 
 * Props:
 * - size: 'sm' | 'md' | 'lg' | 'xl' | 'full'
 * - text: Loading message displayed underneath
 * - fullScreen: boolean (full viewport overlay with backdrop blur)
 * - loop: boolean (re-triggers animation every cycle if desired, default true)
 */
export const LoadingSpinner = ({
  size = 'lg',
  text = 'Loading Sleep Star Furniture...',
  fullScreen = false,
  loop = true,
  className = '',
}) => {
  // Generous, large-format stage sizing for clear visibility
  const stageSizes = {
    sm: 'w-36 h-36',
    md: 'w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96',
    lg: 'w-80 h-80 sm:w-96 sm:h-96 md:w-[400px] md:h-[400px]',
    xl: 'w-[min(92vw,64vh,540px)]',
    full: 'w-[min(92vw,64vh,540px)]',
  };

  const currentStageSize = stageSizes[size] || stageSizes.lg;

  const content = (
    <div className={`flex flex-col items-center justify-center p-4 sm:p-6 text-center ${className}`}>
      {/* Exact Sleep Star Animated Emblem */}
      <SleepStarLogoAnimation
        size={currentStageSize}
        loop={loop}
        loopDelay={10000}
        showReplay={false}
        stageClassName="shadow-xl"
      />

      {/* Loading Status Text */}
      {text && (
        <div className="mt-4 flex flex-col items-center space-y-1.5">
          <p className="text-xs sm:text-sm font-semibold tracking-wide text-brown-950">
            {text}
          </p>
          <div className="flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#d9a52e] animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-1.5 h-1.5 rounded-full bg-[#556B2F] animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-1.5 h-1.5 rounded-full bg-[#3E2723] animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#FAF7F2]/95 backdrop-blur-md animate-fadeIn p-4">
        {content}
      </div>
    );
  }

  return content;
};
