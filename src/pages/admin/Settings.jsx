import React, { useState, useEffect } from 'react';
import {
  Settings,
  Save,
  CheckCircle2,
  AlertCircle,
  Phone,
  MessageCircle,
  Mail,
  MapPin,
  Instagram,
  ExternalLink,
  Layers,
  Sparkles,
  Info,
  Clock,
  RefreshCw,
} from 'lucide-react';
import { settingsService, DEFAULT_SETTINGS } from '../../services/settingsService';
import { useSettings } from '../../context/SettingsContext';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const AdminSettings = () => {
  const { refreshSettings } = useSettings();
  const [formData, setFormData] = useState(() => settingsService.getCachedSettings());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successNotice, setSuccessNotice] = useState('');
  const [activeTab, setActiveTab] = useState('contact'); // 'contact', 'banners', 'about', 'social'

  const loadSettingsData = async () => {
    setError('');
    try {
      const data = await settingsService.getSettings();
      setFormData(data);
    } catch (err) {
      console.error('Error fetching settings:', err);
    }
  };

  useEffect(() => {
    loadSettingsData();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      await settingsService.updateSettings(formData);
      await refreshSettings();
      setSuccessNotice('Website settings updated successfully! All pages now reflect the latest content.');
      setTimeout(() => setSuccessNotice(''), 4000);
    } catch (err) {
      console.error('Error updating settings:', err);
      setError(err.message || 'Failed to update settings. Please check your admin privileges.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <LoadingSpinner size="lg" message="Loading website content settings..." />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">
            <Settings className="w-3.5 h-3.5" />
            <span>Website Configuration</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900">
            Website Content & Business Settings
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Manage public showroom details, phone numbers, WhatsApp, homepage hero text, and workshop information.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-neutral-900 text-white text-xs font-semibold hover:bg-neutral-800 disabled:opacity-50 transition-colors shadow-sm cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving Changes...' : 'Save All Settings'}</span>
        </button>
      </div>

      {/* Global Alerts */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start space-x-2 text-xs text-red-700 animate-fadeIn">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {successNotice && (
        <div className="p-4 bg-neutral-900 text-white rounded-2xl flex items-center space-x-2 text-xs font-medium shadow-md animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{successNotice}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-neutral-200 pb-2">
        {[
          { id: 'contact', label: 'Contact & Showroom' },
          { id: 'banners', label: 'Homepage Banners & Ticker' },
          { id: 'about', label: 'About & Heritage' },
          { id: 'social', label: 'Social & Map Links' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-neutral-900 text-white shadow-2xs'
                : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Tab 1: Contact & Showroom Details */}
        {activeTab === 'contact' && (
          <div className="bg-white rounded-3xl border border-neutral-200 p-6 sm:p-8 space-y-6 shadow-2xs animate-fadeIn">
            <h3 className="text-base font-bold text-neutral-900 uppercase tracking-wider text-xs">
              Primary Business & Contact Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1.5">
                  Business Name
                </label>
                <input
                  type="text"
                  value={formData.businessName || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, businessName: e.target.value })
                  }
                  className="w-full px-3 py-2.5 text-xs bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1.5">
                  Tagline
                </label>
                <input
                  type="text"
                  value={formData.tagline || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, tagline: e.target.value })
                  }
                  className="w-full px-3 py-2.5 text-xs bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1.5">
                  Direct Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={formData.phone || formData.businessPhone || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        phone: e.target.value,
                        businessPhone: e.target.value,
                      })
                    }
                    placeholder="+91 98765 43210"
                    className="w-full pl-9 pr-3 py-2.5 text-xs bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1.5">
                  WhatsApp Number (with country code, digits only)
                </label>
                <div className="relative">
                  <MessageCircle className="w-4 h-4 text-emerald-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={formData.whatsappNumber || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        whatsappNumber: e.target.value.replace(/[^\d]/g, ''),
                      })
                    }
                    placeholder="919876543210"
                    className="w-full pl-9 pr-3 py-2.5 text-xs bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white"
                  />
                </div>
                <p className="text-[11px] text-neutral-400 mt-1">Used for deep linking enquiries directly to your WhatsApp app.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1.5">
                  Business Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={formData.email || formData.businessEmail || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        email: e.target.value,
                        businessEmail: e.target.value,
                      })
                    }
                    placeholder="contact@sleepstarfurniture.com"
                    className="w-full pl-9 pr-3 py-2.5 text-xs bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1.5">
                  Operating Hours
                </label>
                <div className="relative">
                  <Clock className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={formData.businessHours || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, businessHours: e.target.value })
                    }
                    placeholder="Monday – Saturday: 9:30 AM – 8:30 PM"
                    className="w-full pl-9 pr-3 py-2.5 text-xs bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1.5">
                Physical Showroom & Workshop Address
              </label>
              <textarea
                rows={2}
                value={formData.address || ''}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                placeholder="100 Feet Road, Gandhipuram, Coimbatore, Tamil Nadu 641012"
                className="w-full px-3 py-2.5 text-xs bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white"
              />
            </div>
          </div>
        )}

        {/* Tab 2: Homepage Sliding Banners */}
        {activeTab === 'banners' && (
          <div className="bg-white rounded-3xl border border-neutral-200 p-6 sm:p-8 space-y-6 shadow-2xs animate-fadeIn">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-neutral-200 pb-4">
              <div>
                <h3 className="text-base font-bold text-neutral-900 uppercase tracking-wider text-xs">
                  Homepage Sliding Banners ({formData.banners?.length || 4} Slides)
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Customize the sliding hero banners displayed prominently on the customer homepage.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, banners: DEFAULT_SETTINGS.banners })}
                className="px-3 py-1.5 rounded-lg border border-neutral-300 text-xs text-neutral-700 hover:bg-neutral-50 font-medium cursor-pointer"
              >
                Reset Slides to Default
              </button>
            </div>

            {/* Slide Editor Cards */}
            <div className="space-y-6">
              {(formData.banners && formData.banners.length > 0 ? formData.banners : DEFAULT_SETTINGS.banners).map((banner, index) => (
                <div key={banner.id || index} className="p-5 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-olive-100 text-olive-800 text-xs font-bold">
                      <Sparkles className="w-3.5 h-3.5 text-olive-600" />
                      <span>Slide {index + 1}</span>
                    </span>
                    {banner.image && (
                      <span className="text-[11px] text-neutral-500 truncate max-w-xs">
                        Image Preview Ready
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1">
                        Category Tag / Badge
                      </label>
                      <input
                        type="text"
                        value={banner.tag || ''}
                        onChange={(e) => {
                          const currentBanners = [...(formData.banners || DEFAULT_SETTINGS.banners)];
                          currentBanners[index] = { ...currentBanners[index], tag: e.target.value };
                          setFormData({ ...formData, banners: currentBanners });
                        }}
                        placeholder="e.g. Direct Factory Showroom in Coimbatore"
                        className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1">
                        Background Image URL
                      </label>
                      <input
                        type="text"
                        value={banner.image || ''}
                        onChange={(e) => {
                          const currentBanners = [...(formData.banners || DEFAULT_SETTINGS.banners)];
                          currentBanners[index] = { ...currentBanners[index], image: e.target.value };
                          setFormData({ ...formData, banners: currentBanners });
                        }}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1">
                      Main Headline
                    </label>
                    <input
                      type="text"
                      value={banner.title || ''}
                      onChange={(e) => {
                        const currentBanners = [...(formData.banners || DEFAULT_SETTINGS.banners)];
                        currentBanners[index] = { ...currentBanners[index], title: e.target.value };
                        setFormData({ ...formData, banners: currentBanners });
                      }}
                      placeholder="e.g. Master Woodwork, Tailored For Living"
                      className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1">
                      Subtitle / Description
                    </label>
                    <textarea
                      rows={2}
                      value={banner.subtitle || ''}
                      onChange={(e) => {
                        const currentBanners = [...(formData.banners || DEFAULT_SETTINGS.banners)];
                        currentBanners[index] = { ...currentBanners[index], subtitle: e.target.value };
                        setFormData({ ...formData, banners: currentBanners });
                      }}
                      placeholder="e.g. Sleep Star Furniture crafts luxury cots, solid teak dining sets..."
                      className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: About Us & Heritage */}
        {activeTab === 'about' && (
          <div className="bg-white rounded-3xl border border-neutral-200 p-6 sm:p-8 space-y-6 shadow-2xs animate-fadeIn">
            <h3 className="text-base font-bold text-neutral-900 uppercase tracking-wider text-xs">
              Brand Story & Craftsmanship Statement
            </h3>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1.5">
                About Us Story
              </label>
              <textarea
                rows={6}
                value={formData.aboutUs || ''}
                onChange={(e) =>
                  setFormData({ ...formData, aboutUs: e.target.value })
                }
                placeholder="Share your workshop heritage, carpentry philosophy, and commitment to Coimbatore homeowners..."
                className="w-full px-3 py-2.5 text-xs bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white leading-relaxed"
              />
              <p className="text-[11px] text-neutral-400 mt-1">Displayed on the public About page and in company overview blocks.</p>
            </div>
          </div>
        )}

        {/* Tab 4: Social & Map Links */}
        {activeTab === 'social' && (
          <div className="bg-white rounded-3xl border border-neutral-200 p-6 sm:p-8 space-y-6 shadow-2xs animate-fadeIn">
            <h3 className="text-base font-bold text-neutral-900 uppercase tracking-wider text-xs">
              Digital Presence & Map Coordinates
            </h3>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1.5">
                Instagram Profile URL
              </label>
              <div className="relative">
                <Instagram className="w-4 h-4 text-pink-600 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="url"
                  value={formData.socialLinks?.instagram || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      socialLinks: {
                        ...formData.socialLinks,
                        instagram: e.target.value,
                      },
                    })
                  }
                  placeholder="https://instagram.com/sleepstarfurniture"
                  className="w-full pl-9 pr-3 py-2.5 text-xs bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1.5">
                Google Maps Navigation Link
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-red-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="url"
                  value={formData.googleMapsUrl || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, googleMapsUrl: e.target.value })
                  }
                  placeholder="https://maps.google.com/?q=Coimbatore+Tamil+Nadu+India"
                  className="w-full pl-9 pr-3 py-2.5 text-xs bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* Save button footer */}
        <div className="pt-4 border-t border-neutral-200 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-neutral-900 text-white text-xs font-semibold hover:bg-neutral-800 disabled:opacity-50 transition-colors shadow-sm cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Changes...' : 'Save Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
