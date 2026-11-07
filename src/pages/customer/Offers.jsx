import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Tag,
  ArrowRight,
  MessageCircle,
  Sparkles,
  Percent,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Package,
} from 'lucide-react';
import { offerService } from '../../services/offerService';
import { productService } from '../../services/productService';
import { formatCurrency, formatWhatsAppLink } from '../../utils/formatters';
import { useSettings } from '../../context/SettingsContext';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const Offers = () => {
  const { settings } = useSettings();
  const [activeCampaigns, setActiveCampaigns] = useState([]);
  const [discountedProducts, setDiscountedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const whatsappNumber =
    settings?.whatsappNumber ||
    import.meta.env.VITE_WHATSAPP_NUMBER ||
    '919876543210';

  useEffect(() => {
    const loadOffersData = async () => {
      try {
        const [campaigns, allPublished] = await Promise.all([
          offerService.getActive(),
          productService.getAllPublished(),
        ]);

        setActiveCampaigns(campaigns);

        // Filter products with real active discounts
        const withOffers = allPublished.filter(
          (p) =>
            p.offerPrice &&
            p.regularPrice &&
            Number(p.offerPrice) > 0 &&
            Number(p.offerPrice) < Number(p.regularPrice)
        );
        setDiscountedProducts(withOffers);
      } catch (err) {
        console.error('Error fetching offers data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadOffersData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12">
      {/* Hero Header Banner */}
      <div className="bg-neutral-900 rounded-3xl p-8 sm:p-12 text-white border border-neutral-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        <div className="space-y-3 max-w-xl">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-neutral-800 text-neutral-300 text-xs font-semibold">
            <Tag className="w-3.5 h-3.5 text-neutral-300" />
            <span>Direct Showroom Offers</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Special Furniture Offers & Seasonal Campaigns
          </h1>
          <p className="text-sm text-neutral-400 leading-relaxed">
            Genuine factory-direct price reductions on select solid wood dining sets, luxury beds, and living room consoles. No inflated markups or artificial discounts.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 text-center space-y-2">
          <div className="text-2xl font-bold text-white">100% Genuine</div>
          <p className="text-xs text-neutral-300 max-w-xs">
            Direct woodcraft manufacturer savings with full 5-year termite and material warranty.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-24 flex justify-center">
          <LoadingSpinner message="Loading promotional campaigns & discounted furniture..." />
        </div>
      ) : (
        <div className="space-y-14">
          {/* Active Campaigns Showcase */}
          {activeCampaigns.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-neutral-900" />
                <h2 className="text-xl font-bold tracking-tight text-neutral-900">
                  Featured Promotional Campaigns
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeCampaigns.map((camp) => {
                  const waCampaignUrl = formatWhatsAppLink(
                    whatsappNumber,
                    `Hello Sleep Star Furniture, I would like to avail the "${camp.title}" promotional offer${
                      camp.code ? ` (Promo Code: ${camp.code})` : ''
                    }.`
                  );

                  return (
                    <div
                      key={camp.id}
                      className="bg-white rounded-3xl border border-neutral-200 p-6 shadow-2xs flex flex-col justify-between space-y-4 hover:border-neutral-300 transition-all"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          {camp.discountPercentage ? (
                            <span className="text-xs font-bold text-white bg-neutral-900 px-3 py-1 rounded-full">
                              {camp.discountPercentage}% DISCOUNT
                            </span>
                          ) : (
                            <span className="text-xs font-bold text-neutral-900 bg-neutral-100 px-3 py-1 rounded-full">
                              SPECIAL DEAL
                            </span>
                          )}

                          {camp.code && (
                            <span className="font-mono text-xs font-bold bg-neutral-100 text-neutral-800 px-2 py-0.5 rounded border border-neutral-200">
                              CODE: {camp.code}
                            </span>
                          )}
                        </div>

                        <div>
                          <h3 className="text-lg font-bold text-neutral-900">
                            {camp.title}
                          </h3>
                          {camp.description && (
                            <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                              {camp.description}
                            </p>
                          )}
                        </div>

                        {camp.offerPrice && (
                          <div className="text-sm font-bold text-neutral-900">
                            Deal Price: {formatCurrency(camp.offerPrice)}
                          </div>
                        )}
                      </div>

                      <div className="pt-3 border-t border-neutral-100">
                        <a
                          href={waCampaignUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-neutral-900 text-white text-xs font-semibold hover:bg-neutral-800 transition-colors shadow-2xs"
                        >
                          <MessageCircle className="w-4 h-4 text-emerald-400" />
                          <span>Claim Offer on WhatsApp</span>
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Discounted Catalogue Products */}
          <div className="space-y-6">
            <div className="flex justify-between items-end border-b border-neutral-200 pb-3">
              <div>
                <span className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
                  Ready-Made Catalogue Deals
                </span>
                <h2 className="text-2xl font-bold text-neutral-900 tracking-tight mt-1">
                  Discounted Furniture Items
                </h2>
              </div>
              <Link
                to="/products"
                className="text-xs font-bold text-neutral-900 hover:underline"
              >
                View Full Catalogue →
              </Link>
            </div>

            {discountedProducts.length === 0 ? (
              <div className="py-16 text-center bg-white rounded-3xl border border-neutral-200 space-y-3">
                <Tag className="w-10 h-10 text-neutral-400 mx-auto" />
                <h3 className="text-base font-bold text-neutral-900">
                  All Products are at Standard Showroom Rates
                </h3>
                <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                  We maintain everyday honest factory pricing without markup games. Browse our full collection to view all models.
                </p>
                <div className="pt-2">
                  <Link
                    to="/products"
                    className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-neutral-900 text-white text-xs font-semibold hover:bg-neutral-800 transition-colors"
                  >
                    <span>Browse All Furniture</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {discountedProducts.map((prod) => {
                  const cover =
                    prod.coverImage ||
                    prod.imageUrl ||
                    (prod.images && prod.images[0]) ||
                    '';

                  const discountPct = Math.round(
                    ((prod.regularPrice - prod.offerPrice) / prod.regularPrice) *
                      100
                  );

                  const savings = prod.regularPrice - prod.offerPrice;

                  const whatsappUrl = formatWhatsAppLink(
                    whatsappNumber,
                    `Hello Sleep Star Furniture, I want to avail the special offer on "${prod.name}" for ${formatCurrency(
                      prod.offerPrice
                    )} (Original Price: ${formatCurrency(
                      prod.regularPrice
                    )}, Save: ${formatCurrency(savings)}).`
                  );

                  return (
                    <div
                      key={prod.id}
                      className="group bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <Link
                        to={`/products/${prod.id}`}
                        className="block relative aspect-4/3 bg-neutral-100 overflow-hidden"
                      >
                        {cover ? (
                          <img
                            src={cover}
                            alt={prod.name}
                            className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-neutral-400">
                            Sleep Star
                          </div>
                        )}

                        <div className="absolute top-3 left-3 bg-olive-700 text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-sm">
                          {discountPct}% OFF
                        </div>

                        <div className="absolute bottom-3 left-3 bg-olive-50/95 backdrop-blur-xs text-olive-800 text-[10px] font-bold px-2 py-0.5 rounded border border-olive-200 shadow-2xs">
                          Save {formatCurrency(savings)}
                        </div>
                      </Link>

                      <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                        <div>
                          <span className="text-[10px] uppercase font-semibold text-olive-700 block mb-1">
                            {prod.category}
                          </span>
                          <Link to={`/products/${prod.id}`}>
                            <h3 className="font-bold text-sm text-brown-900 hover:text-olive-700 transition-colors line-clamp-1">
                              {prod.name}
                            </h3>
                          </Link>
                          {prod.material && (
                            <p className="text-[11px] text-brown-600 line-clamp-1 mt-0.5">
                              {prod.material}
                            </p>
                          )}
                        </div>

                        <div className="pt-3 border-t border-brown-100 flex items-center justify-between">
                          <div>
                            <div className="font-bold text-brown-900 text-base">
                              {formatCurrency(prod.offerPrice)}
                            </div>
                            <div className="line-through text-brown-400 text-xs">
                              {formatCurrency(prod.regularPrice)}
                            </div>
                          </div>

                          <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2.5 rounded-xl bg-olive-700 text-white hover:bg-olive-800 transition-colors shadow-sm"
                            title="Claim Offer on WhatsApp"
                          >
                            <MessageCircle className="w-4 h-4 text-olive-200" />
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
