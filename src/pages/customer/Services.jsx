import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Wrench,
  CheckCircle2,
  MessageCircle,
  ArrowRight,
  Sparkles,
  PhoneCall,
  Calendar,
  Layers,
  ShieldCheck,
  Award,
} from 'lucide-react';
import { serviceService } from '../../services/serviceService';
import { formatCurrency, formatWhatsAppLink } from '../../utils/formatters';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EnquiryModal } from '../../components/common/EnquiryModal';

export const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedServiceForModal, setSelectedServiceForModal] = useState(null);

  const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '919876543210';
  const phone = import.meta.env.VITE_BUSINESS_PHONE || '+91 98765 43210';

  useEffect(() => {
    const loadServices = async () => {
      try {
        const data = await serviceService.getActive();
        setServices(data);
      } catch (err) {
        console.error('Error fetching custom services:', err);
      } finally {
        setLoading(false);
      }
    };

    loadServices();
  }, []);

  return (
    <div className="space-y-16 sm:space-y-24 py-10 sm:py-16">
      {/* Header Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-b border-neutral-200 pb-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-neutral-100 text-neutral-800 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Turnkey Carpentry & Bespoke Interiors</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-900 tracking-tight">
            Custom Furniture & Interior Services
          </h1>
          <p className="text-base text-neutral-600 leading-relaxed">
            Every home possesses unique floorplans. From bespoke modular kitchens and custom ceiling-high sliding wardrobes to acoustic TV consoles, our team crafts custom interiors tailored to your exact architectural space.
          </p>
        </div>
      </div>

      {/* Services List Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner size="lg" text="Loading custom services..." />
          </div>
        ) : services.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-3xl border border-neutral-200 space-y-3">
            <Wrench className="w-10 h-10 text-neutral-400 mx-auto" />
            <h3 className="text-base font-bold text-neutral-900">Services Catalogue Updating</h3>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              Please check back shortly or contact our showroom directly to enquire about custom interior woodwork.
            </p>
          </div>
        ) : (
          <div className="space-y-16">
            {services.map((srv, idx) => {
              const isEven = idx % 2 === 1;
              const cover = srv.coverImage || srv.imageUrl || (srv.images && srv.images[0]) || '';
              const whatsappQuotationUrl = formatWhatsAppLink(
                whatsappNumber,
                `Hello Sleep Star Furniture, I am interested in requesting a custom quotation for: "${srv.title || srv.name}".`
              );

              return (
                <div
                  key={srv.id}
                  className={`bg-white rounded-3xl border border-neutral-200 p-6 sm:p-10 shadow-2xs hover:shadow-sm transition-all grid grid-cols-1 lg:grid-cols-12 gap-8 items-center ${
                    isEven ? 'lg:grid-flow-dense' : ''
                  }`}
                >
                  {/* Visual Showcase (5 cols) */}
                  <div className={`lg:col-span-5 ${isEven ? 'lg:col-start-8' : ''}`}>
                    <div className="relative aspect-4/3 rounded-2xl bg-neutral-100 overflow-hidden border border-neutral-200 shadow-2xs">
                      {cover ? (
                        <img
                          src={cover}
                          alt={srv.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-neutral-400 font-bold">
                          Sleep Star Interiors
                        </div>
                      )}
                      {srv.startingPrice ? (
                        <div className="absolute bottom-3 left-3 bg-neutral-900/90 backdrop-blur-xs text-white text-xs font-bold px-3 py-1.5 rounded-lg">
                          From {formatCurrency(srv.startingPrice)}
                        </div>
                      ) : (
                        <div className="absolute bottom-3 left-3 bg-neutral-900/90 backdrop-blur-xs text-white text-xs font-bold px-3 py-1.5 rounded-lg">
                          Custom Quotation
                        </div>
                      )}
                    </div>

                    {/* Small thumbnail strip if multiple images */}
                    {srv.images && srv.images.length > 1 && (
                      <div className="grid grid-cols-4 gap-2 mt-2">
                        {srv.images.slice(0, 4).map((img, i) => (
                          <div key={i} className="aspect-square rounded-lg overflow-hidden border border-neutral-200 bg-neutral-50">
                            <img src={img} alt="Detail" className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Service Information (7 cols) */}
                  <div className={`lg:col-span-7 space-y-5 ${isEven ? 'lg:col-start-1' : ''}`}>
                    <div className="space-y-2">
                      <span className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
                        Custom Service #0{idx + 1}
                      </span>
                      <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
                        {srv.title || srv.name}
                      </h2>
                      <p className="text-sm text-neutral-600 leading-relaxed">
                        {srv.description}
                      </p>
                    </div>

                    {/* Features list */}
                    {srv.features && (
                      <div className="space-y-2 pt-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900">
                          Inclusions & Craft Highlights
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-neutral-700">
                          {srv.features.split(',').map((f, i) => (
                            <div key={i} className="flex items-start space-x-2">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                              <span>{f.trim()}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {srv.highlights && (
                      <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 text-xs text-neutral-700">
                        <span className="font-semibold text-neutral-900">Key Assurance: </span>
                        {srv.highlights}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="pt-2 flex flex-wrap items-center gap-3">
                      <a
                        href={whatsappQuotationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-2 px-5 py-3 rounded-xl bg-olive-700 text-white text-xs font-semibold hover:bg-olive-800 transition-colors shadow-sm"
                      >
                        <MessageCircle className="w-4 h-4 text-olive-200" />
                        <span>Request Custom Quotation</span>
                      </a>

                      <button
                        type="button"
                        onClick={() => setSelectedServiceForModal(srv)}
                        className="inline-flex items-center space-x-2 px-4 py-3 rounded-xl border border-brown-300 bg-white text-brown-900 text-xs font-semibold hover:bg-olive-50 transition-colors cursor-pointer"
                      >
                        <Calendar className="w-3.5 h-3.5 text-olive-700" />
                        <span>Book Site Measurement Online</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4-Step Process Section */}
      <section className="bg-white border-y border-neutral-200 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
              The Journey
            </span>
            <h2 className="text-3xl font-bold text-neutral-900 tracking-tight">
              How We Execute Your Custom Project
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: 'On-Site Laser Survey',
                desc: 'Our carpenter specialists visit your site to capture precision millimeter measurements of walls, pipes, and ceiling beams.',
              },
              {
                step: '02',
                title: 'Design & Quotation',
                desc: 'We generate transparent line-item estimates and 3D visual concepts customized to your storage and ergonomics requirements.',
              },
              {
                step: '03',
                title: 'Factory Woodcraft',
                desc: 'All carcasses and shutters are cut, edge-banded, and finished in our Coimbatore workshop using heavy-duty BWP marine plywood.',
              },
              {
                step: '04',
                title: 'Clean Turnkey Assembly',
                desc: 'Our carpentry team transports and installs each module on-site with zero dust disruption and perfect flush alignment.',
              },
            ].map((p, idx) => (
              <div
                key={idx}
                className="bg-neutral-50 rounded-2xl border border-neutral-200 p-6 space-y-3 shadow-2xs"
              >
                <div className="text-2xl font-bold text-neutral-900">{p.step}</div>
                <h3 className="font-bold text-base text-neutral-900">{p.title}</h3>
                <p className="text-xs text-neutral-600 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Online Service Booking Modal */}
      {selectedServiceForModal && (
        <EnquiryModal
          isOpen={!!selectedServiceForModal}
          onClose={() => setSelectedServiceForModal(null)}
          defaultType="Custom Service Enquiry"
          relatedItemId={selectedServiceForModal.id}
          relatedItemName={selectedServiceForModal.title || selectedServiceForModal.name}
          title={`Consultation for ${selectedServiceForModal.title || selectedServiceForModal.name}`}
          subtitle="Submit your site location and requirements to schedule a free carpenter survey."
        />
      )}
    </div>
  );
};
