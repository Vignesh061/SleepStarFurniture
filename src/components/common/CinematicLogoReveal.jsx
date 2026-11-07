import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, ArrowRight, Sparkles } from 'lucide-react';

/**
 * CinematicLogoReveal Component
 * 
 * Brand Identity:
 * - Brand Name: Sleep Star Furniture
 * - White: #FFFFFF
 * - Olive Green: #808000
 * - Dark Brown: #3E2723
 * 
 * Sequence (4-6s):
 * 1. Opening (0s - 0.8s): Clean white backdrop with subtle ambient warmth
 * 2. Logo Reveal (0.8s - 2.4s): Smooth scale, blur dissolve, and elegant olive aura
 * 3. Brand Name Reveal (2.2s - 4.0s): Letter-by-letter stagger reveal in Dark Brown
 * 4. Finishing Effect (4.0s - 5.5s): Soft light sweep, subtle olive lighting, and gentle floating
 * 5. Final State: Centered brand emblem with replay & explore controls
 */

const BRAND_NAME = 'Sleep Star Furniture';
const TAGLINE = 'HANDCRAFTED SOLID WOOD & BESPOKE INTERIORS';

export const CinematicLogoReveal = ({
  onComplete,
  onDismiss,
  fullScreen = true,
  autoCompleteDelay = 0, // 0 = stay on final state until user interacts
  className = '',
}) => {
  const [animationKey, setAnimationKey] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [logoLoaded, setLogoLoaded] = useState(false);

  const handleReplay = () => {
    setIsFinished(false);
    setAnimationKey((prev) => prev + 1);
  };

  useEffect(() => {
    // Mark as finished after 5.4s
    const timer = setTimeout(() => {
      setIsFinished(true);
      if (onComplete && autoCompleteDelay > 0) {
        setTimeout(onComplete, autoCompleteDelay);
      }
    }, 5400);

    return () => clearTimeout(timer);
  }, [animationKey, onComplete, autoCompleteDelay]);

  // Framer Motion Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.8, ease: 'easeOut' },
    },
  };

  // 1. Ambient Lighting Aura behind the logo
  const auraVariants = {
    hidden: { opacity: 0, scale: 0.6 },
    visible: {
      opacity: [0, 0.28, 0.2],
      scale: [0.6, 1.25, 1.1],
      transition: {
        duration: 2.2,
        delay: 0.6,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  // 2. Logo Emblem Variant (Scale, fade, blur-to-focus)
  const logoVariants = {
    hidden: {
      opacity: 0,
      scale: 0.86,
      y: 18,
      filter: 'blur(14px)',
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: {
        duration: 1.6,
        delay: 0.8,
        ease: [0.16, 1, 0.3, 1], // Luxury deceleration curve
      },
    },
  };

  // Gentle continuous floating after initial reveal
  const floatingVariants = {
    animate: {
      y: [0, -6, 0],
      transition: {
        duration: 4.8,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  };

  // 3. Brand Name letter-by-letter container & character variants
  const letterContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.042,
        delayChildren: 2.3, // Starts at 2.3s
      },
    },
  };

  const letterVariants = {
    hidden: {
      opacity: 0,
      y: 12,
      filter: 'blur(4px)',
    },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: {
        duration: 0.45,
        ease: [0.2, 0.65, 0.3, 0.9],
      },
    },
  };

  // 4. Tagline & Divider reveal
  const taglineVariants = {
    hidden: { opacity: 0, y: 10, letterSpacing: '0.18em' },
    visible: {
      opacity: 1,
      y: 0,
      letterSpacing: '0.28em',
      transition: {
        duration: 1.1,
        delay: 3.5,
        ease: 'easeOut',
      },
    },
  };

  const dividerVariants = {
    hidden: { scaleX: 0, opacity: 0 },
    visible: {
      scaleX: 1,
      opacity: 0.75,
      transition: {
        duration: 0.9,
        delay: 3.3,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  // 5. Light sweep glint across logo surface at ~4.2s
  const shimmerVariants = {
    hidden: { x: '-160%', opacity: 0 },
    visible: {
      x: '180%',
      opacity: [0, 0.85, 0],
      transition: {
        duration: 1.4,
        delay: 4.0,
        ease: 'easeInOut',
      },
    },
  };

  // 6. Action buttons appearance in the final state
  const controlsVariants = {
    hidden: { opacity: 0, y: 14 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.7,
        delay: 4.8,
        ease: 'easeOut',
      },
    },
  };

  return (
    <div
      key={animationKey}
      className={`relative bg-white text-[#3E2723] flex flex-col items-center justify-center overflow-hidden select-none ${
        fullScreen ? 'fixed inset-0 z-50 min-h-screen w-screen' : 'w-full py-16'
      } ${className}`}
      style={{ backgroundColor: '#FFFFFF' }}
    >
      {/* Background Subtle Gradient Glows (Clean White with subtle Olive & Warm Teak aura) */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="absolute inset-0 pointer-events-none"
      >
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] sm:w-[650px] sm:h-[650px] rounded-full blur-3xl opacity-30"
          style={{
            background:
              'radial-gradient(circle, rgba(128, 128, 0, 0.16) 0%, rgba(250, 247, 242, 0.8) 50%, transparent 75%)',
          }}
        />
      </motion.div>

      {/* Main Center Stage */}
      <div className="relative z-10 flex flex-col items-center justify-center max-w-2xl px-6 text-center">
        {/* Continuous Gentle Floating Wrapper after initial entrance */}
        <motion.div
          variants={floatingVariants}
          animate={isFinished ? 'animate' : {}}
          className="relative flex flex-col items-center"
        >
          {/* Subtle Olive-Green Ambient Lighting Aura */}
          <motion.div
            variants={auraVariants}
            initial="hidden"
            animate="visible"
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 sm:w-64 sm:h-64 rounded-full pointer-events-none"
            style={{
              background:
                'radial-gradient(circle, rgba(128, 128, 0, 0.28) 0%, rgba(128, 128, 0, 0.08) 55%, transparent 75%)',
              filter: 'blur(16px)',
            }}
          />

          {/* Logo Frame & Original Brand Logo Image */}
          <motion.div
            variants={logoVariants}
            initial="hidden"
            animate="visible"
            className="relative z-10 w-32 h-32 sm:w-44 sm:h-44 md:w-52 md:h-52 rounded-3xl bg-white p-3.5 sm:p-5 flex items-center justify-center overflow-hidden"
            style={{
              border: '1px solid rgba(128, 128, 0, 0.18)',
              boxShadow:
                '0 20px 45px -12px rgba(62, 39, 35, 0.14), 0 0 0 1px rgba(255, 255, 255, 0.8) inset',
            }}
          >
            {/* The Original Brand Logo Image (Preserved without modification) */}
            <img
              src="/logo.jpeg"
              alt="Sleep Star Furniture"
              onLoad={() => setLogoLoaded(true)}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/logo.png';
              }}
              className="w-full h-full object-contain rounded-2xl select-none"
              draggable="false"
            />

            {/* Cinematic Single-Pass Luxury Shimmer Sweep (Fires at 4.0s) */}
            <motion.div
              variants={shimmerVariants}
              initial="hidden"
              animate="visible"
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  'linear-gradient(110deg, transparent 20%, rgba(255, 255, 255, 0.75) 50%, transparent 80%)',
              }}
            />
          </motion.div>

          {/* Elegant Divider Line in Olive Green */}
          <motion.div
            variants={dividerVariants}
            initial="hidden"
            animate="visible"
            className="w-16 sm:w-24 h-[1.5px] mt-6 sm:mt-8 origin-center"
            style={{
              background:
                'linear-gradient(90deg, transparent 0%, #808000 50%, transparent 100%)',
            }}
          />

          {/* Brand Name Revealed Letter by Letter in Dark Brown (#3E2723) */}
          <motion.h1
            variants={letterContainerVariants}
            initial="hidden"
            animate="visible"
            className="mt-4 sm:mt-5 text-2xl sm:text-3xl md:text-4xl font-extrabold uppercase tracking-[0.16em] sm:tracking-[0.24em] flex flex-wrap justify-center items-center"
            style={{ color: '#3E2723' }}
          >
            {BRAND_NAME.split('').map((char, index) => (
              <motion.span
                key={`${char}-${index}`}
                variants={letterVariants}
                className="inline-block"
                style={{
                  display: char === ' ' ? 'inline' : 'inline-block',
                  marginRight: char === ' ' ? '0.35em' : '0.02em',
                }}
              >
                {char === ' ' ? '\u00A0' : char}
              </motion.span>
            ))}
          </motion.h1>

          {/* Subtitle / Tagline in Signature Olive Green (#808000) */}
          <motion.p
            variants={taglineVariants}
            initial="hidden"
            animate="visible"
            className="mt-2.5 text-[9px] sm:text-xs md:text-sm font-bold uppercase transition-all"
            style={{ color: '#808000' }}
          >
            {TAGLINE}
          </motion.p>
        </motion.div>
      </div>

      {/* Finishing / Final State Interactive Controls (Replay & Continue) */}
      <motion.div
        variants={controlsVariants}
        initial="hidden"
        animate="visible"
        className="relative z-20 mt-10 sm:mt-12 flex flex-wrap items-center justify-center gap-3 sm:gap-4 px-4"
      >
        {/* Replay Animation Option */}
        <button
          onClick={handleReplay}
          className="inline-flex items-center space-x-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer shadow-xs active:scale-95"
          style={{
            backgroundColor: '#FFFFFF',
            color: '#3E2723',
            border: '1px solid rgba(62, 39, 35, 0.2)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#808000';
            e.currentTarget.style.color = '#808000';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(128, 128, 0, 0.12)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(62, 39, 35, 0.2)';
            e.currentTarget.style.color = '#3E2723';
            e.currentTarget.style.boxShadow = 'none';
          }}
          title="Replay cinematic logo reveal"
        >
          <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#808000]" />
          <span>Replay Reveal</span>
        </button>

        {/* Explore / Proceed Option if dismiss or complete handler is passed */}
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="inline-flex items-center space-x-2 px-5 py-2 sm:px-6 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white transition-all duration-200 cursor-pointer shadow-md active:scale-95"
            style={{
              backgroundColor: '#3E2723',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#808000';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#3E2723';
            }}
          >
            <span>Explore Collection</span>
            <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        )}
      </motion.div>

      {/* Subtle Bottom Watermark */}
      <motion.div
        variants={controlsVariants}
        initial="hidden"
        animate="visible"
        className="absolute bottom-4 text-center text-[10px] tracking-widest uppercase font-medium"
        style={{ color: 'rgba(62, 39, 35, 0.45)' }}
      >
        Sleep Star Furniture • Master Woodwork & Interiors
      </motion.div>
    </div>
  );
};

