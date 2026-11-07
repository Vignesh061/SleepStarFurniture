import React, { useState, useRef } from 'react';
import {
  X,
  MessageCircle,
  CheckCircle2,
  AlertCircle,
  UploadCloud,
  FileText,
  Phone,
  Mail,
  User,
  Sparkles,
} from 'lucide-react';
import { enquiryService, ENQUIRY_TYPES } from '../../services/enquiryService';
import { storageService } from '../../services/storageService';
import { formatWhatsAppLink } from '../../utils/formatters';

export const EnquiryModal = ({
  isOpen,
  onClose,
  defaultType = 'General Enquiry',
  relatedItemId = '',
  relatedItemName = '',
  title = 'Send Customer Enquiry',
  subtitle = 'Share your requirements and our interior specialist will get in touch.',
}) => {
  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    email: '',
    enquiryType: defaultType,
    message: '',
    referenceImageUrl: '',
  });

  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageProgress, setImageProgress] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '919876543210';

  if (!isOpen) return null;

  const handleImageSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setImageProgress(0);
    setError('');

    try {
      const url = await storageService.uploadEnquiryReferenceImage(file, (p) =>
        setImageProgress(p)
      );
      setFormData((prev) => ({ ...prev, referenceImageUrl: url }));
    } catch (err) {
      console.error('Reference image upload error:', err);
      setError(err.message || 'Could not upload reference photo.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.customerName.trim() || !formData.phone.trim()) {
      setError('Please provide your name and contact phone number.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await enquiryService.createEnquiry({
        ...formData,
        relatedItemId: relatedItemId || '',
        relatedItemName: relatedItemName || '',
      });
      setSuccess(true);
    } catch (err) {
      console.error('Enquiry submit error:', err);
      setError(err.message || 'Failed to submit enquiry. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const whatsappDirectUrl = formatWhatsAppLink(
    whatsappNumber,
    `Hello Sleep Star Furniture, my name is ${formData.customerName || 'Customer'}. Regarding ${
      relatedItemName ? `"${relatedItemName}"` : formData.enquiryType
    }: ${formData.message || 'I would like to discuss my furniture requirements.'}`
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl border border-neutral-200 shadow-2xl max-w-lg w-full max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-neutral-200 flex items-center justify-between bg-white z-10">
          <div>
            <div className="inline-flex items-center space-x-1.5 text-[11px] font-semibold uppercase tracking-wider text-neutral-500 mb-0.5">
              <Sparkles className="w-3.5 h-3.5 text-neutral-700" />
              <span>Direct Customer Enquiry</span>
            </div>
            <h3 className="text-base font-bold text-neutral-900">{title}</h3>
            {relatedItemName && (
              <p className="text-xs font-semibold text-neutral-700 mt-0.5">
                Regarding: {relatedItemName}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form or Success State */}
        <div className="p-6 overflow-y-auto">
          {success ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xl font-bold text-neutral-900">
                  Enquiry Submitted Successfully!
                </h4>
                <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                  Thank you, <span className="font-semibold text-neutral-800">{formData.customerName}</span>. Your enquiry has been received and logged. Our specialist will contact you on <span className="font-mono text-neutral-800">{formData.phone}</span> shortly.
                </p>
              </div>

              <div className="pt-4 space-y-2">
                <a
                  href={whatsappDirectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center space-x-2 px-5 py-3 rounded-xl bg-olive-700 text-white text-xs font-semibold hover:bg-olive-800 transition-colors shadow-md"
                >
                  <MessageCircle className="w-4 h-4 text-olive-200" />
                  <span>Continue on WhatsApp Immediately</span>
                </a>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-2.5 text-xs text-neutral-600 hover:text-neutral-900"
                >
                  Close Window
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-2 text-xs text-red-700">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Name */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1.5">
                  Your Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={formData.customerName}
                    onChange={(e) =>
                      setFormData({ ...formData, customerName: e.target.value })
                    }
                    placeholder="e.g. Ramesh Kumar"
                    className="w-full pl-9 pr-3 py-2.5 text-xs bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white"
                  />
                </div>
              </div>

              {/* Phone & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1.5">
                    Phone / WhatsApp *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      placeholder="e.g. 9876543210"
                      className="w-full pl-9 pr-3 py-2.5 text-xs bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1.5">
                    Email Address (Optional)
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      placeholder="e.g. name@gmail.com"
                      className="w-full pl-9 pr-3 py-2.5 text-xs bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Enquiry Type */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1.5">
                  Enquiry Category
                </label>
                <select
                  value={formData.enquiryType}
                  onChange={(e) =>
                    setFormData({ ...formData, enquiryType: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white"
                >
                  {ENQUIRY_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              {/* Requirements & Location */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1.5">
                  Requirements & Location
                </label>
                <textarea
                  rows={3}
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  placeholder="Share details such as room dimensions, preferred wood/polish, installation city (e.g. Coimbatore, Tiruppur)..."
                  className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white"
                />
              </div>

              {/* Reference Image Attachment */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700">
                  Optional Reference Image
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleImageSelect}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage}
                    className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl border border-neutral-300 bg-neutral-50 text-neutral-700 text-xs font-semibold hover:bg-neutral-100 disabled:opacity-50"
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>
                      {uploadingImage
                        ? `Uploading ${imageProgress}%`
                        : formData.referenceImageUrl
                        ? 'Change Photo'
                        : 'Attach Floorplan / Photo'}
                    </span>
                  </button>
                  {formData.referenceImageUrl && (
                    <span className="text-[11px] text-emerald-700 flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Photo Attached</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-neutral-200 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl border border-neutral-300 text-neutral-700 text-xs font-semibold hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || uploadingImage}
                  className="px-6 py-2.5 rounded-xl bg-olive-700 text-white text-xs font-semibold hover:bg-olive-800 disabled:opacity-50 shadow-md cursor-pointer"
                >
                  {submitting ? 'Submitting...' : 'Submit Enquiry'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

