import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Instagram, MessageCircle, ArrowUpRight } from 'lucide-react';
import { formatWhatsAppLink } from '../../utils/formatters';
import { useSettings } from '../../context/SettingsContext';
import { BrandLogo } from './BrandLogo';

export const Footer = () => {
  const { settings } = useSettings();
  const whatsappNumber =
    settings?.whatsappNumber ||
    import.meta.env.VITE_WHATSAPP_NUMBER ||
    '919876543210';
  const phone = settings?.phone || '+91 98765 43210';
  const email = settings?.email || 'contact@sleepstarfurniture.com';
  const address = settings?.address || 'Coimbatore, Tamil Nadu, India';
  const instagramUrl =
    settings?.socialLinks?.instagram || 'https://instagram.com/sleepstarfurniture';

  const whatsappUrl = formatWhatsAppLink(
    whatsappNumber,
    'Hello Sleep Star Furniture, I would like to enquire about your furniture offerings.'
  );

  return (
    <footer className="bg-brown-900 text-brown-100 border-t border-brown-800">
      {/* Top CTA Banner */}
      <div className="border-b border-brown-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
              Crafting Elegant Spaces for Modern Living
            </h3>
            <p className="mt-2 text-brown-200/80 text-sm max-w-xl">
              Visit our showroom or consult with our interior specialists to design bespoke furniture tailored to your residence.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 px-5 py-3 rounded-lg bg-olive-600 text-white font-medium hover:bg-olive-500 transition-colors shadow-sm text-sm"
            >
              <MessageCircle className="w-4 h-4 text-white" />
              <span>Chat with Specialist</span>
            </a>
            <Link
              to="/contact"
              className="inline-flex items-center space-x-2 px-5 py-3 rounded-lg border border-brown-700 text-white font-medium hover:bg-brown-800 transition-colors text-sm"
            >
              <span>Get Free Quotation</span>
              <ArrowUpRight className="w-4 h-4 text-olive-300" />
            </Link>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
        {/* Brand column */}
        <div className="lg:col-span-2 space-y-4">
          <Link to="/">
            <BrandLogo size="md" theme="light" />
          </Link>
          <p className="text-sm text-neutral-400 leading-relaxed max-w-sm">
            Premium ready-made furniture, custom wardrobes, modular kitchens, and turnkey interior solutions crafted with precision and durable materials.
          </p>
          <div className="flex items-center space-x-3 pt-2">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-full bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center text-neutral-300 hover:text-white transition-colors"
              aria-label="WhatsApp"
            >
              <MessageCircle className="w-4 h-4" />
            </a>
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-full bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center text-neutral-300 hover:text-white transition-colors"
              aria-label="Instagram"
            >
              <Instagram className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-white mb-4">
            Explore
          </h4>
          <ul className="space-y-2.5 text-sm">
            <li><Link to="/products" className="hover:text-white transition-colors">Ready-made Products</Link></li>
            <li><Link to="/services" className="hover:text-white transition-colors">Custom Interiors</Link></li>
            <li><Link to="/projects" className="hover:text-white transition-colors">Completed Projects</Link></li>
            <li><Link to="/offers" className="hover:text-white transition-colors">Offers & Discounts</Link></li>
            <li><Link to="/about" className="hover:text-white transition-colors">About Sleep Star</Link></li>
          </ul>
        </div>

        {/* Categories */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-white mb-4">
            Collections
          </h4>
          <ul className="space-y-2.5 text-sm">
            <li><Link to="/products?category=dining-sets" className="hover:text-white transition-colors">Dining Sets</Link></li>
            <li><Link to="/products?category=cots-beds" className="hover:text-white transition-colors">Cots & Beds</Link></li>
            <li><Link to="/products?category=wardrobes" className="hover:text-white transition-colors">Wardrobes</Link></li>
            <li><Link to="/products?category=tv-units" className="hover:text-white transition-colors">TV Units</Link></li>
            <li><Link to="/services" className="hover:text-white transition-colors">Modular Kitchens</Link></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-white mb-4">
            Showroom & Contact
          </h4>
          <ul className="space-y-3 text-sm text-neutral-400">
            <li className="flex items-start space-x-2.5">
              <MapPin className="w-4 h-4 text-neutral-500 flex-shrink-0 mt-0.5" />
              <span>{address}</span>
            </li>
            <li className="flex items-center space-x-2.5">
              <Phone className="w-4 h-4 text-neutral-500 flex-shrink-0" />
              <span>{phone}</span>
            </li>
            <li className="flex items-center space-x-2.5">
              <Mail className="w-4 h-4 text-neutral-500 flex-shrink-0" />
              <span>{email}</span>
            </li>
            <li className="pt-1">
              <span className="inline-block px-2.5 py-1 text-[11px] rounded bg-neutral-800 text-neutral-300">
                Mon - Sat: 9:30 AM - 8:30 PM
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-neutral-800 bg-neutral-950/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row justify-between items-center text-xs text-neutral-500 gap-3">
          <p>© {new Date().getFullYear()} Sleep Star Furniture. All rights reserved.</p>
          <div className="flex items-center space-x-6">
            <Link to="/about" className="hover:text-neutral-400">Privacy Policy</Link>
            <Link to="/contact" className="hover:text-neutral-400">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

