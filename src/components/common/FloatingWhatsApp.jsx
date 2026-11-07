import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { formatWhatsAppLink } from '../../utils/formatters';
import { useSettings } from '../../context/SettingsContext';

export const FloatingWhatsApp = () => {
  const [showTooltip, setShowTooltip] = useState(false);
  const { settings } = useSettings();
  const whatsappNumber =
    settings?.whatsappNumber ||
    import.meta.env.VITE_WHATSAPP_NUMBER ||
    '919876543210';
  const whatsappUrl = formatWhatsAppLink(
    whatsappNumber,
    'Hello Sleep Star Furniture, I am interested in your furniture and interior woodworking services.'
  );

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
      {/* Optional Help Bubble */}
      {showTooltip && (
        <div className="mb-3 max-w-xs bg-white text-neutral-900 border border-neutral-200 shadow-xl rounded-2xl p-3.5 text-xs animate-fadeIn relative">
          <button
            onClick={() => setShowTooltip(false)}
            className="absolute top-2 right-2 text-neutral-400 hover:text-neutral-700"
            aria-label="Close tooltip"
          >
            <X className="w-3.5 h-3.5" />
          </button>
          <div className="font-semibold text-neutral-900 pr-4">Need help or a custom quote?</div>
          <p className="text-neutral-600 mt-1 text-[11px] leading-relaxed">
            Chat with our Coimbatore furniture workshop directly on WhatsApp.
          </p>
        </div>
      )}

      {/* Floating Action Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={() => setShowTooltip(true)}
        className="group flex items-center space-x-2.5 px-4 py-3 bg-neutral-900 hover:bg-neutral-800 text-white rounded-full shadow-lg hover:shadow-xl active:scale-95 transition-all duration-200 border border-neutral-800"
        aria-label="Chat with Sleep Star Furniture on WhatsApp"
      >
        <div className="relative">
          <MessageCircle className="w-5 h-5 text-emerald-400" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-neutral-900" />
        </div>
        <span className="text-xs font-semibold tracking-wide hidden sm:inline-block">
          WhatsApp Us
        </span>
      </a>
    </div>
  );
};

