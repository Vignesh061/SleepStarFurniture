import React, { useState, useRef } from 'react';
import {
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  Clock,
  Instagram,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  UploadCloud,
  X,
  Send,
  Sparkles,
} from 'lucide-react';
import { enquiryService, ENQUIRY_TYPES } from '../../services/enquiryService';
import { storageService } from '../../services/storageService';
import { formatWhatsAppLink } from '../../utils/formatters';
import { useSettings } from '../../context/SettingsContext';

export const Contact = () => {
  const { settings } = useSettings();
  const whatsappNumber =
    settings?.whatsappNumber ||
    import.meta.env.VITE_WHATSAPP_NUMBER ||
    '919876543210';
  const phoneNumber = settings?.phone || '+91 98765 43210';
  const emailAddress = settings?.email || 'contact@sleepstarfurniture.com';
  const address =
    settings?.address ||
    'Sleep Star Furniture, 100 Feet Road, Gandhipuram, Coimbatore, Tamil Nadu 641012';
  const googleMapsUrl =
    settings?.googleMapsUrl ||
    'https://maps.google.com/?q=Coimbatore+Tamil+Nadu+India';
  const instagramUrl =
    settings?.socialLinks?.instagram ||
    'https://instagram.com/sleepstarfurniture';

  const defaultWhatsAppUrl = formatWhatsAppLink(
    whatsappNumber,
    'Hello Sleep Star Furniture, I would like to enquire about your furniture and custom interior services.'
  );

  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    email: '',
    enquiryType: 'General Enquiry',
    message: '',
    referenceImageUrl: '',
  });

  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageProgress, setImageProgress] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file (JPG, PNG, or WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Reference photo size must not exceed 5MB.');
      return;
    }

    setUploadingImage(true);
    setImageProgress(0);
    setError('');

    try {
      const downloadUrl = await storageService.uploadEnquiryReferenceImage(
        file,
        (progress) => setImageProgress(progress)
      );
      setFormData((prev) => ({ ...prev, referenceImageUrl: downloadUrl }));
    } catch (err) {
      console.error('Error uploading reference photo:', err);
      setError(err.message || 'Failed to upload photo. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, referenceImageUrl: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.customerName.trim()) {
      setError('Please enter your full name.');
      return;
    }

    if (!formData.phone.trim()) {
      setError('Please enter a valid phone or WhatsApp number.');
      return;
    }

    setSubmitting(true);

    try {
      await enquiryService.createEnquiry({
        customerName: formData.customerName.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        enquiryType: formData.enquiryType,
        message: formData.message.trim(),
        referenceImageUrl: formData.referenceImageUrl,
      });

      setSubmitted(true);
    } catch (err) {
      console.error('Error submitting enquiry:', err);
      setError(err.message || 'Failed to submit enquiry. Please check your network and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const followUpWhatsAppUrl = formatWhatsAppLink(
    whatsappNumber,
    `Hello Sleep Star Furniture, I just submitted an enquiry through your website for "${formData.enquiryType}". My name is ${formData.customerName || 'Customer'}. Requirements: ${formData.message || 'I would like to request a quotation.'}`
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12">
      {/* Header */}
      <div className="border-b border-neutral-200 pb-8 max-w-2xl">
        <span className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
          Connect With Our Workshop
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 tracking-tight mt-1.5">
          Get in Touch & Request an Estimate
        </h1>
        <p className="mt-3 text-neutral-600 text-sm sm:text-base leading-relaxed">
          Whether you require a custom modular kitchen, bespoke wardrobe, luxury cot, or commercial woodwork in Coimbatore, our specialists are ready to consult with you.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Contact Information & Map (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl border border-neutral-200 p-6 sm:p-8 space-y-6 shadow-2xs">
            <h2 className="text-base font-bold text-neutral-900 uppercase tracking-wider">
              Showroom & Office
            </h2>

            {/* Direct Phone */}
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-900 flex-shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 block">
                  Direct Telephone
                </span>
                <a
                  href={`tel:${phoneNumber.replace(/\s+/g, '')}`}
                  className="text-base font-bold text-neutral-900 hover:text-neutral-700 transition-colors"
                >
                  {phoneNumber}
                </a>
                <p className="text-xs text-neutral-500">Available Mon - Sat, 9:30 AM to 8:30 PM</p>
              </div>
            </div>

            {/* WhatsApp */}
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 flex-shrink-0">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 block">
                  WhatsApp Support & Estimates
                </span>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Send sketches, architectural plans, or room photos for quick turnarounds.
                </p>
                <a
                  href={defaultWhatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 pt-1"
                >
                  <span>Chat on WhatsApp</span>
                  <span>→</span>
                </a>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-900 flex-shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 block">
                  Email Desk
                </span>
                <a
                  href={`mailto:${emailAddress}`}
                  className="text-xs font-bold text-neutral-900 hover:text-neutral-700"
                >
                  {emailAddress}
                </a>
              </div>
            </div>

            {/* Address */}
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-900 flex-shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 block">
                  Showroom & Workshop Location
                </span>
                <p className="text-xs text-neutral-700 leading-relaxed">{address}</p>
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1 text-xs font-semibold text-neutral-900 hover:underline pt-1"
                >
                  <span>Open in Google Maps</span>
                  <ExternalLink className="w-3 h-3 ml-0.5" />
                </a>
              </div>
            </div>

            {/* Operating Hours */}
            <div className="flex items-start space-x-4 pt-2 border-t border-neutral-100">
              <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-900 flex-shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div className="space-y-0.5 text-xs">
                <span className="font-semibold text-neutral-900 block">Operating Hours</span>
                <p className="text-neutral-600">Monday – Saturday: 9:30 AM – 8:30 PM</p>
                <p className="text-neutral-600">Sunday: 10:30 AM – 6:00 PM (By Appointment)</p>
              </div>
            </div>

            {/* Social Links */}
            <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-600">
              <span>Follow our craftsmanship:</span>
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1.5 font-semibold text-neutral-900 hover:text-neutral-700"
              >
                <Instagram className="w-4 h-4" />
                <span>@sleepstarfurniture</span>
              </a>
            </div>
          </div>
        </div>

        {/* Customer Enquiry Form (7 Cols) */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-3xl border border-neutral-200 p-6 sm:p-10 shadow-2xs">
            {submitted ? (
              <div className="py-8 text-center space-y-5 animate-fadeIn">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <div className="space-y-2 max-w-md mx-auto">
                  <h3 className="text-2xl font-bold text-neutral-900">
                    Enquiry Logged Successfully!
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                    Thank you, <span className="font-bold text-neutral-900">{formData.customerName}</span>. Your requirements have been forwarded to our carpentry design desk. We will call you at <span className="font-mono font-semibold text-neutral-900">{formData.phone}</span> shortly.
                  </p>
                </div>

                <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200 max-w-md mx-auto text-left text-xs space-y-1.5 text-neutral-700">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Enquiry Category:</span>
                    <span className="font-semibold text-neutral-900">{formData.enquiryType}</span>
                  </div>
                  {formData.referenceImageUrl && (
                    <div className="flex justify-between items-center pt-1">
                      <span className="text-neutral-500">Floorplan / Reference:</span>
                      <span className="text-emerald-700 font-semibold flex items-center space-x-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Attached</span>
                      </span>
                    </div>
                  )}
                </div>

                <div className="pt-4 max-w-md mx-auto space-y-3">
                  <a
                    href={followUpWhatsAppUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center space-x-2 px-6 py-3.5 rounded-xl bg-olive-700 text-white text-xs font-semibold hover:bg-olive-800 transition-colors shadow-md"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-400" />
                    <span>Continue Dialogue on WhatsApp Immediately</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({
                        customerName: '',
                        phone: '',
                        email: '',
                        enquiryType: 'General Enquiry',
                        message: '',
                        referenceImageUrl: '',
                      });
                    }}
                    className="w-full py-2.5 text-xs font-semibold text-neutral-600 hover:text-neutral-900 transition-colors"
                  >
                    Submit Another Enquiry
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <div className="inline-flex items-center space-x-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">
                    <Sparkles className="w-3.5 h-3.5 text-neutral-700" />
                    <span>Customer Requirements Form</span>
                  </div>
                  <h2 className="text-2xl font-bold text-neutral-900">
                    Send an Enquiry or Schedule a Site Visit
                  </h2>
                  <p className="text-xs text-neutral-500 mt-1">
                    Fill out the form below. We usually respond within a few business hours.
                  </p>
                </div>

                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start space-x-2 text-xs text-red-700 animate-fadeIn">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Name */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1.5">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.customerName}
                    onChange={(e) =>
                      setFormData({ ...formData, customerName: e.target.value })
                    }
                    placeholder="e.g. Ramesh Kumar"
                    className="w-full px-4 py-3 text-xs bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white transition-all"
                  />
                </div>

                {/* Phone & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1.5">
                      Phone / WhatsApp Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      placeholder="e.g. 98765 43210"
                      className="w-full px-4 py-3 text-xs bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1.5">
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      placeholder="e.g. name@gmail.com"
                      className="w-full px-4 py-3 text-xs bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                {/* Enquiry Type */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1.5">
                    Enquiry Type
                  </label>
                  <select
                    value={formData.enquiryType}
                    onChange={(e) =>
                      setFormData({ ...formData, enquiryType: e.target.value })
                    }
                    className="w-full px-4 py-3 text-xs bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white transition-all"
                  >
                    {ENQUIRY_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Requirements / Location / Dimensions */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1.5">
                    Your Requirements & Location
                  </label>
                  <textarea
                    rows={4}
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    placeholder="Describe your furniture requirement, preferred wood finish, dimensions, or site location (e.g., 2BHK flat in Saravanampatti, Coimbatore; modular kitchen with acrylic finish)..."
                    className="w-full px-4 py-3 text-xs bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white transition-all leading-relaxed"
                  />
                </div>

                {/* Optional Reference Photo */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700">
                    Optional Reference Photo / Floorplan (Max 5MB)
                  </label>

                  {formData.referenceImageUrl ? (
                    <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-200 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <img
                          src={formData.referenceImageUrl}
                          alt="Reference"
                          className="w-12 h-12 object-cover rounded-xl border border-neutral-300"
                        />
                        <div className="text-xs">
                          <p className="font-semibold text-neutral-900">Reference Photo Uploaded</p>
                          <span className="text-[11px] text-emerald-700 flex items-center space-x-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Attached to your enquiry</span>
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-200 transition-colors"
                        title="Remove photo"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-3">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                      <button
                        type="button"
                        disabled={uploadingImage}
                        onClick={() => fileInputRef.current?.click()}
                        className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl border border-neutral-300 bg-neutral-50 text-neutral-700 text-xs font-semibold hover:bg-neutral-100 disabled:opacity-50 transition-colors"
                      >
                        <UploadCloud className="w-4 h-4 text-neutral-500" />
                        <span>
                          {uploadingImage
                            ? `Uploading ${imageProgress}%...`
                            : 'Upload Photo / Sketch'}
                        </span>
                      </button>
                      <span className="text-xs text-neutral-500">
                        Supports JPG, PNG, WebP up to 5MB
                      </span>
                    </div>
                  )}
                </div>

                {/* Submit Action */}
                <div className="pt-4 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-[11px] text-neutral-500">
                    Your information is strictly protected and will only be used to respond to this enquiry.
                  </p>
                  <button
                    type="submit"
                    disabled={submitting || uploadingImage}
                    className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-8 py-3.5 rounded-xl bg-olive-700 text-white text-xs font-semibold hover:bg-olive-800 disabled:opacity-50 transition-all shadow-md cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>{submitting ? 'Submitting Enquiry...' : 'Submit Enquiry'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
