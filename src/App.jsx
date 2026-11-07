import React, { useEffect, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import { AppRoutes } from './routes/AppRoutes';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { purgeLegacyCache } from './utils/cleanupLegacyCache';
import { SleepStarLogoAnimation } from './components/common/SleepStarLogoAnimation';

// Purge old mock data from localStorage once at boot
purgeLegacyCache();

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    purgeLegacyCache();
    // Auto-dismiss welcome animation after 9.0 seconds to allow the full reveal to complete
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 9000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <ErrorBoundary>
      {/* Initial Welcome & Loading Reveal from sleep-star-logo-animation.html */}
      {showSplash && (
        <div className="fixed inset-0 z-50 bg-[#f1ebdc] flex flex-col items-center justify-center p-4 sm:p-8 animate-fadeIn">
          <SleepStarLogoAnimation
            size="full"
            loop={false}
            stageClassName="shadow-2xl"
          />

          <div className="mt-8 flex items-center space-x-3">
            <button
              onClick={() => setShowSplash(false)}
              className="px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold text-[#7a5410] bg-[#fffaf0] hover:bg-white border border-[#d9bd6a] transition-all shadow-md cursor-pointer active:scale-95"
            >
              Enter Website →
            </button>
          </div>
        </div>
      )}

      <BrowserRouter>
        <AuthProvider>
          <SettingsProvider>
            <AppRoutes />
          </SettingsProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
