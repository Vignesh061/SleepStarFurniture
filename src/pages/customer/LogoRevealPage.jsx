import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { SleepStarLogoAnimation } from '../../components/common/SleepStarLogoAnimation';
import { ArrowRight, Sparkles } from 'lucide-react';

export const LogoRevealPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full bg-[#f1ebdc] flex flex-col items-center justify-center p-4 sm:p-8 select-none">
      <div className="flex flex-col items-center max-w-lg w-full text-center space-y-6 animate-fadeIn">
        {/* Animated Brand Emblem */}
        <SleepStarLogoAnimation
          size="full"
          loop={false}
          showReplay={true}
          stageClassName="shadow-2xl"
        />

        {/* Action Controls */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center space-x-2 px-6 py-3 rounded-full bg-[#7a5410] hover:bg-[#5c3e0a] text-white text-sm font-bold shadow-md active:scale-95 transition-all"
          >
            <span>Explore Sleep Star Furniture</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <p className="text-[11px] tracking-widest uppercase font-semibold text-[#7a5410]/70">
          Handcrafted Solid Wood • Luxury Beds • Modular Interiors
        </p>
      </div>
    </div>
  );
};
