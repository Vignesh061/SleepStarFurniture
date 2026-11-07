import React, { useEffect, useState } from 'react';

/**
 * SleepStarLogoAnimation
 * Exact React component replica of public/sleep-star-logo-animation.html
 */
export const SleepStarLogoAnimation = ({
  size = 'lg',
  loop = false,
  loopDelay = 10000,
  showReplay = false,
  onComplete,
  className = '',
  stageClassName = '',
}) => {
  const [isPlaying, setIsPlaying] = useState(true);

  const replay = () => {
    setIsPlaying(false);
    setTimeout(() => {
      setIsPlaying(true);
    }, 40);
  };

  useEffect(() => {
    let loopTimer;
    if (loop) {
      loopTimer = setInterval(() => {
        replay();
      }, loopDelay);
    }

    let completeTimer;
    if (onComplete) {
      completeTimer = setTimeout(() => {
        onComplete();
      }, 8200);
    }

    return () => {
      if (loopTimer) clearInterval(loopTimer);
      if (completeTimer) clearTimeout(completeTimer);
    };
  }, [loop, loopDelay]);

  // Generous, large-format dimension classes matching sleep-star-logo-animation.html (520px max)
  const sizeClasses = {
    sm: 'w-36 h-36',
    md: 'w-64 h-64 sm:w-72 sm:h-72 md:w-80 md:h-80',
    lg: 'w-80 h-80 sm:w-96 sm:h-96 md:w-[460px] md:h-[460px]',
    xl: 'w-[min(92vw,64vh,540px)]',
    full: 'w-[min(92vw,64vh,540px)]',
  };

  const selectedSize = sizeClasses[size] || size;

  return (
    <div className={`flex flex-col items-center justify-center select-none ${className}`}>
      {/* Animated SVG Stage */}
      <div
        onClick={replay}
        title="Click to replay"
        className={`sleep-star-stage ${isPlaying ? 'play' : ''} ${selectedSize} ${stageClassName}`}
      >
        <svg
          viewBox="0 0 320 320"
          xmlns="http://www.w3.org/2000/svg"
          role="img"
          aria-label="Sleep Star Furniture logo animation"
        >
          <defs>
            <linearGradient id="ssl_bg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#a9e0dd" />
              <stop offset="0.5" stopColor="#f3f1e2" />
              <stop offset="1" stopColor="#f6dc8e" />
            </linearGradient>

            <linearGradient id="ssl_gold" gradientUnits="userSpaceOnUse" x1="20" y1="20" x2="300" y2="300">
              <stop offset="0" stopColor="#f6df93" />
              <stop offset="0.35" stopColor="#d9a52e" />
              <stop offset="0.65" stopColor="#f2d47a" />
              <stop offset="1" stopColor="#a8740f" />
            </linearGradient>

            <linearGradient id="ssl_goldT" gradientUnits="userSpaceOnUse" x1="0" y1="212" x2="0" y2="250">
              <stop offset="0" stopColor="#e9bf55" />
              <stop offset="0.55" stopColor="#b9801a" />
              <stop offset="1" stopColor="#8a5a12" />
            </linearGradient>

            <radialGradient id="ssl_night" cx="0.5" cy="0.35" r="0.8">
              <stop offset="0" stopColor="#1f2b58" />
              <stop offset="1" stopColor="#0d1330" />
            </radialGradient>

            <radialGradient id="ssl_glowg" cx="160" cy="114" r="70" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#fff3b8" stopOpacity="0.95" />
              <stop offset="0.5" stopColor="#ffd66b" stopOpacity="0.45" />
              <stop offset="1" stopColor="#ffd66b" stopOpacity="0" />
            </radialGradient>

            <linearGradient id="ssl_coneg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#ffe08a" stopOpacity="0.85" />
              <stop offset="1" stopColor="#ffe08a" stopOpacity="0.12" />
            </linearGradient>

            <linearGradient id="ssl_sheen">
              <stop offset="0" stopColor="#fff" stopOpacity="0" />
              <stop offset="0.5" stopColor="#fff" stopOpacity="0.9" />
              <stop offset="1" stopColor="#fff" stopOpacity="0" />
            </linearGradient>

            <filter id="ssl_sh" x="-10%" y="-20%" width="120%" height="150%">
              <feDropShadow dx="0" dy="1.5" stdDeviation="1" floodColor="#6b4308" floodOpacity="0.35" />
            </filter>

            <path
              id="ssl_star"
              d="M0-5.2 1.5-1.7 5.2-1.6 2.4.7 3.2 4.4 0 2.4-3.2 4.4-2.4.7-5.2-1.6-1.5-1.7Z"
              fill="url(#ssl_gold)"
            />

            <path
              id="ssl_spark"
              d="M0-8 1.6-1.6 8 0 1.6 1.6 0 8-1.6 1.6-8 0-1.6-1.6Z"
              fill="url(#ssl_gold)"
            />

            <clipPath id="ssl_tc">
              <text
                x="160"
                y="243"
                textAnchor="middle"
                fontSize="38"
                fontFamily="Poppins, 'Segoe UI', Arial, sans-serif"
                fontWeight="700"
                textLength="176"
                lengthAdjust="spacingAndGlyphs"
              >
                Sleep Star
              </text>
            </clipPath>

            <g id="ssl_chair" fill="none" stroke="#a96d22" strokeLinecap="round">
              <path d="M103 143V171M121 143V171M103 144H121" strokeWidth="3" />
              <path d="M107.5 144V171M112 144V171M116.5 144V171" strokeWidth="1.5" />
              <path d="M98 173H126M101 173V188M123 173V188" strokeWidth="3" />
            </g>
          </defs>

          {/* Background circles */}
          <rect width="320" height="320" fill="url(#ssl_bg)" />
          <circle cx="160" cy="160" r="146" fill="#fffaf0" />
          <circle className="night" cx="160" cy="160" r="146" fill="url(#ssl_night)" />

          {/* Light beam (sways with the lamp) */}
          <g className="swing">
            <circle className="glow" cx="160" cy="114" r="70" fill="url(#ssl_glowg)" />
            <circle className="glow2" cx="160" cy="114" r="70" fill="url(#ssl_glowg)" />
            <polygon className="cone" points="152,114 168,114 214,152 106,152" fill="url(#ssl_coneg)" />
          </g>

          {/* Dining set */}
          <g className="chair c2" fill="none" stroke="#a96d22" strokeWidth="3" strokeLinecap="round">
            <path d="M148 140V150M172 140V150M148 140H172M146 173H174M149 173V188M171 173V188" />
          </g>
          <g className="table">
            <path d="M130 169V188M190 169V188" stroke="#a96d22" strokeWidth="3" strokeLinecap="round" />
            <path d="M110 150H210L216 169H104Z" fill="#fff" stroke="#e3dccb" strokeWidth="1" strokeLinejoin="round" />
            <path d="M124 154V167M140 154V167M160 154V167M180 154V167M196 154V167" stroke="#eee7d6" strokeWidth="1" />
          </g>
          <g className="chair c1"><use href="#ssl_chair" /></g>
          <g className="chair c3"><use href="#ssl_chair" transform="translate(96 0)" /></g>

          {/* Frame Lines */}
          <path className="ln f1" pathLength="1" d="M92 92V46H234V92" />
          <path className="ln f2" pathLength="1" d="M80 150V188H244V150" />

          {/* Lamp */}
          <g className="swing">
            <line className="cord" x1="160" y1="46" x2="160" y2="86" stroke="url(#ssl_gold)" strokeWidth="2.5" />
            <g className="shade">
              <rect x="156" y="84" width="8" height="7" rx="2" fill="url(#ssl_gold)" />
              <path d="M142 108C142 96 150 90 160 90S178 96 178 108Z" fill="url(#ssl_gold)" />
              <path d="M147 106C147 99 151 95 156 93" fill="none" stroke="#fff" strokeOpacity="0.55" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M138 109.5H182" stroke="url(#ssl_gold)" strokeWidth="3" strokeLinecap="round" />
              <circle cx="160" cy="114" r="4.5" fill="#d8bf78" />
              <circle className="lit" cx="160" cy="114" r="6" fill="#fffbe0" />
            </g>
          </g>

          {/* Rings */}
          <circle className="ring" pathLength="1" cx="160" cy="160" r="148" />
          <circle className="ring2" pathLength="1" cx="160" cy="160" r="141" />

          {/* Brand Name */}
          <text
            className="brand t1"
            x="160"
            y="243"
            textAnchor="middle"
            fontSize="38"
            fontFamily="Poppins, 'Segoe UI', Arial, sans-serif"
            fontWeight="700"
            textLength="176"
            lengthAdjust="spacingAndGlyphs"
            fill="url(#ssl_goldT)"
            filter="url(#ssl_sh)"
          >
            Sleep Star
          </text>
          <g clipPath="url(#ssl_tc)">
            <rect className="shine" x="40" y="205" width="34" height="46" fill="url(#ssl_sheen)" />
          </g>
          <text
            className="sub t2"
            x="160"
            y="270"
            textAnchor="middle"
            fontSize="14"
            fontFamily="Montserrat, 'Segoe UI', Arial, sans-serif"
            fontWeight="600"
            textLength="132"
            lengthAdjust="spacing"
            fill="url(#ssl_goldT)"
          >
            FURNITURE
          </text>

          {/* Stars & Sparkle */}
          <g transform="translate(226 215) scale(1.1)">
            <g className="pop s1"><use className="tw" href="#ssl_star" /></g>
          </g>
          <g transform="translate(237 209) scale(1.5)">
            <g className="pop s2"><use className="tw" href="#ssl_star" style={{ animationDelay: '7.6s' }} /></g>
          </g>
          <g transform="translate(248 215) scale(1.1)">
            <g className="pop s3"><use className="tw" href="#ssl_star" style={{ animationDelay: '8s' }} /></g>
          </g>
          <g transform="translate(160 289)">
            <g className="pop sp"><use className="tw" href="#ssl_spark" /></g>
          </g>
        </svg>
      </div>

      {showReplay && (
        <button
          onClick={replay}
          type="button"
          className="mt-4 inline-flex items-center space-x-1.5 px-5 py-2 rounded-full border border-[#d9bd6a] bg-[#fffaf0] text-[#7a5410] font-semibold text-xs tracking-wider uppercase hover:bg-white active:scale-95 transition-all shadow-xs cursor-pointer"
        >
          <span>↻ Replay</span>
        </button>
      )}
    </div>
  );
};
