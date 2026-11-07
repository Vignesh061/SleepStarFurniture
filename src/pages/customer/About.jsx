import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Award,
  HeartHandshake,
  CheckCircle2,
  Wrench,
  MapPin,
  Clock,
  ArrowRight,
  Phone,
  MessageCircle,
  Sparkles,
} from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { formatWhatsAppLink } from '../../utils/formatters';

export const About = () => {
  const { settings } = useSettings();

  const phone = settings?.phone || '+91 98765 43210';
  const whatsappNumber = settings?.whatsappNumber || '919876543210';
  const address =
    settings?.address ||
    'Sleep Star Furniture, 100 Feet Road, Gandhipuram, Coimbatore, Tamil Nadu 641012';
  const aboutText =
    settings?.aboutUs ||
    'Founded with a commitment to enduring woodwork and contemporary aesthetics, Sleep Star Furniture manufactures premium ready-made furniture and delivers tailored interior spaces for homes and commercial interiors in Coimbatore, Tamil Nadu. We eliminate middleman expenses by crafting directly in our local workshop.';

  const whatsappUrl = formatWhatsAppLink(
    whatsappNumber,
    'Hello Sleep Star Furniture, I read about your workshop and would like to consult with you on furniture and interiors.'
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-16 animate-fadeIn">
      {/* Hero Heritage Intro */}
      <div className="border-b border-neutral-200 pb-10 max-w-3xl space-y-3">
        <span className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
          Our Heritage & Craft
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 tracking-tight">
          About Sleep Star Furniture
        </h1>
        <p className="text-sm sm:text-base text-neutral-600 leading-relaxed pt-1">
          {aboutText}
        </p>
      </div>

      {/* 3 Value Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white rounded-3xl border border-neutral-200 p-8 space-y-4 shadow-2xs">
          <div className="w-12 h-12 rounded-2xl bg-neutral-100 flex items-center justify-center text-neutral-900">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-neutral-900">
            Uncompromising Materials
          </h3>
          <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
            From treated solid hardwoods (Teak, Rosewood) to heavy-duty BWP (Boiling Water Proof) Marine plywood and German soft-close hinges, we construct furniture engineered to last decades.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-neutral-200 p-8 space-y-4 shadow-2xs">
          <div className="w-12 h-12 rounded-2xl bg-neutral-100 flex items-center justify-center text-neutral-900">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-neutral-900">
            Tailored to Your Floorplan
          </h3>
          <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
            Every home has unique dimensions. Our master carpenters visit your site with digital laser distance meters to design custom wardrobes, TV consoles, and kitchens that fit flush against your walls.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-neutral-200 p-8 space-y-4 shadow-2xs">
          <div className="w-12 h-12 rounded-2xl bg-neutral-100 flex items-center justify-center text-neutral-900">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-neutral-900">
            Direct Workshop Pricing
          </h3>
          <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
            By operating our own manufacturing workshop in Coimbatore, we completely eliminate retail showroom middlemen and distributors, passing 20% to 35% honest savings directly to homeowners.
          </p>
        </div>
      </div>

      {/* Workshop & Craftsmanship Standards */}
      <div className="bg-white rounded-3xl border border-neutral-200 p-8 sm:p-12 shadow-2xs space-y-8">
        <div className="max-w-2xl space-y-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
            Our Quality Benchmarks
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
            How We Build Furniture Different
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
            Unlike mass-produced flat-pack particle board that chips or swells with humidity, all Sleep Star Furniture is made with structural integrity.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
          {[
            {
              title: 'Zero Particle Board',
              desc: 'We never use cheap MDF or particle boards for structural frames or cots.',
            },
            {
              title: '2mm PVC Edge Banding',
              desc: 'High-temperature edge banding on all shutter borders to prevent moisture ingress.',
            },
            {
              title: 'Precision Joinery',
              desc: 'Mortise, tenon, and dowel joinery ensuring rattle-free frames that do not sag.',
            },
            {
              title: '5-Year Guarantee',
              desc: 'Comprehensive protection against wood-borer, termites, and joint delamination.',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-2"
            >
              <div className="flex items-center space-x-2 text-neutral-900 font-bold text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{item.title}</span>
              </div>
              <p className="text-xs text-neutral-600 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Showroom & Workshop Location Card */}
      <div className="bg-brown-950 text-white rounded-3xl p-8 sm:p-12 border border-brown-900 shadow-md flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
        <div className="space-y-4 max-w-xl">
          <span className="text-xs font-semibold uppercase tracking-widest text-olive-300">
            Coimbatore Showroom & Works
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Visit Our Showroom in Person
          </h2>
          <div className="space-y-2 text-xs sm:text-sm text-brown-200/90">
            <div className="flex items-start space-x-2.5">
              <MapPin className="w-4 h-4 text-olive-400 flex-shrink-0 mt-0.5" />
              <span>{address}</span>
            </div>
            <div className="flex items-center space-x-2.5">
              <Clock className="w-4 h-4 text-olive-400 flex-shrink-0" />
              <span>
                {settings?.businessHours ||
                  'Monday – Saturday: 9:30 AM – 8:30 PM | Sunday by Appointment'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-xl bg-olive-600 text-white font-semibold text-xs hover:bg-olive-500 transition-colors shadow-sm"
          >
            <MessageCircle className="w-4 h-4 text-white" />
            <span>Chat on WhatsApp</span>
          </a>

          <Link
            to="/contact"
            className="inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-xl border border-brown-700 bg-brown-900 text-white font-semibold text-xs hover:bg-brown-800 transition-colors"
          >
            <Phone className="w-4 h-4 text-olive-300" />
            <span>Schedule Site Visit</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
