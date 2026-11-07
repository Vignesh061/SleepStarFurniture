import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X, MessageCircle, Sparkles, ChevronRight } from 'lucide-react';
import { formatWhatsAppLink } from '../../utils/formatters';
import { useSettings } from '../../context/SettingsContext';
import { BrandLogo } from './BrandLogo';

export const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { settings } = useSettings();
  const whatsappNumber =
    settings?.whatsappNumber ||
    import.meta.env.VITE_WHATSAPP_NUMBER ||
    '919876543210';
  const announcement =
    settings?.announcement || 'Handcrafted Excellence & Bespoke Interiors';
  const businessName = settings?.businessName || 'Sleep Star';

  const whatsappUrl = formatWhatsAppLink(
    whatsappNumber,
    'Hello Sleep Star Furniture, I would like to enquire about your furniture and interior services.'
  );

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Products', path: '/products' },
    { name: 'Completed Projects', path: '/projects' },
    // { name: 'Offers', path: '/offers', badge: 'Sale' },
    { name: 'About', path: '/about' },
    { name: 'Custom Services', path: '/services' },
    { name: 'Contact', path: '/contact' },
  ];

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-brown-200 shadow-2xs">
      {/* Top Brand Accent Line */}
      <div className="h-1 w-full bg-gradient-to-r from-olive-700 via-olive-500 to-brown-800" />

      {/* Main navigation */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo & Brand Name */}
        <Link to="/" onClick={closeMenu} className="flex items-center group">
          <BrandLogo size="md" theme="dark" showText={true} />
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              end={link.path === '/'}
              className={({ isActive }) =>
                `relative px-3.5 py-2 text-sm font-semibold transition-colors rounded-lg ${
                  isActive
                    ? 'text-olive-800 bg-olive-50'
                    : 'text-brown-900 hover:text-olive-700 hover:bg-olive-50/60'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className="flex items-center space-x-1.5">
                    <span>{link.name}</span>
                    {link.badge && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-olive-600 text-white shadow-xs">
                        {link.badge}
                      </span>
                    )}
                  </span>
                  {isActive && (
                    <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-olive-600 rounded-full" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>

        {/* Action Button: WhatsApp enquiry & Brand Reveal */}
        <div className="hidden sm:flex items-center space-x-2.5">
          <Link
            to="/logo-reveal"
            className="hidden lg:inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold text-[#808000] bg-olive-50 hover:bg-olive-100/80 border border-olive-200 transition-all shadow-2xs"
            title="Experience cinematic brand logo reveal"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
            <span>Brand Reveal</span>
          </Link>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-olive-700 text-white text-sm font-semibold hover:bg-olive-800 active:scale-95 transition-all shadow-sm"
          >
            <MessageCircle className="w-4 h-4 text-white" />
            <span>WhatsApp Enquiry</span>
          </a>
        </div>

        {/* Mobile menu toggle button */}
        <div className="flex items-center sm:hidden space-x-2">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg text-olive-700 bg-olive-50 hover:bg-olive-100 transition-colors"
            title="Chat on WhatsApp"
          >
            <MessageCircle className="w-5 h-5" />
          </a>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-brown-900 hover:text-olive-700 hover:bg-olive-50 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-brown-200 bg-white px-4 pt-3 pb-6 shadow-xl animate-fadeIn">
          <div className="space-y-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                end={link.path === '/'}
                onClick={closeMenu}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded-lg text-base font-semibold ${
                    isActive
                      ? 'bg-olive-50 text-olive-900 border-l-4 border-olive-600'
                      : 'text-brown-800 hover:bg-olive-50/60 hover:text-olive-800'
                  }`
                }
              >
                <span>{link.name}</span>
                <ChevronRight className="w-4 h-4 text-brown-400" />
              </NavLink>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-brown-200 space-y-2">
            <Link
              to="/logo-reveal"
              onClick={closeMenu}
              className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg bg-olive-50 text-[#808000] border border-olive-200 text-sm font-bold shadow-2xs"
            >
              <span className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-amber-500 fill-amber-400" />
                <span>Cinematic Brand Reveal</span>
              </span>
              <ChevronRight className="w-4 h-4 text-olive-600" />
            </Link>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={closeMenu}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg bg-olive-700 text-white font-semibold hover:bg-olive-800 transition-colors shadow-md"
            >
              <MessageCircle className="w-5 h-5 text-white" />
              <span>Direct WhatsApp Enquiry</span>
            </a>
            <div className="mt-3 flex justify-center text-xs text-brown-600 px-2 font-medium">
              <span>Coimbatore, Tamil Nadu</span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

