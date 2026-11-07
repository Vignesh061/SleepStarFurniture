import {
  db,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  COLLECTIONS,
} from '../firebase/firestore';

const SETTINGS_DOC_ID = 'general';

export const DEFAULT_SETTINGS = {
  businessName: 'Sleep Star Furniture',
  businessPhone: '+91 86374 89919',
  phone: '+91 86374 89919',
  whatsappNumber: '918637489919',
  businessEmail: 'info@sleepstarfurniture.com',
  email: 'info@sleepstarfurniture.com',
  address: 'Sleep Star Furniture, 100 Feet Road, Gandhipuram, Coimbatore, Tamil Nadu 641012',
  location: 'Coimbatore, Tamil Nadu',
  googleMapsUrl: 'https://maps.google.com/?q=Coimbatore+Tamil+Nadu+India',
  socialLinks: {
    instagram: 'https://instagram.com/sleepstarfurniture',
    facebook: 'https://facebook.com/sleepstarfurniture',
    youtube: 'https://youtube.com/@sleepstarfurniture',
  },
  tagline: 'Handcrafted Excellence & Bespoke Interiors',
  aboutUs:
    'Founded with a commitment to enduring woodwork and contemporary aesthetics, Sleep Star Furniture manufactures premium ready-made furniture and delivers tailored interior spaces for homes and commercial interiors in Coimbatore, Tamil Nadu. We eliminate middleman expenses by crafting directly in our local workshop.',
  announcement: 'Direct factory showroom rates in Coimbatore • Free on-site laser survey',
  businessHours: 'Monday – Saturday: 9:30 AM – 8:30 PM | Sunday: 10:30 AM – 6:00 PM',
  banners: [
    {
      id: 'banner-bed',
      tag: 'Luxury Bedroom Living',
      title: 'Solid Teak & Designer Wooden Cots',
      subtitle:
        'Handcrafted King and Queen size cots with hydraulic storage, seasoned solid wood frames, and direct factory showroom rates in Coimbatore.',
      image:
        'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1600&auto=format&fit=crop&q=80',
      primaryText: 'Explore Beds & Cots',
      primaryLink: '/products',
      secondaryText: 'WhatsApp Enquiry',
      secondaryType: 'whatsapp',
    },
    {
      id: 'banner-sofa',
      tag: 'Premium Living Room Furniture',
      title: 'Artisan Wooden & Luxury Fabric Sofas',
      subtitle:
        'Comfort-engineered living room sofas, L-shape sectionals, and solid teakwood couches built with high-density foam and durable upholstery.',
      image:
        'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1600&auto=format&fit=crop&q=80',
      primaryText: 'View Living & Sofas',
      primaryLink: '/products',
      secondaryText: 'Showroom Consultation',
      secondaryLink: '/contact',
    },
    {
      id: 'banner-dining',
      tag: 'Artisan Solid Teakwood',
      title: 'Hand-Finished Dining Tables & Chairs',
      subtitle:
        'Built for generations of family gatherings. Discover our handcrafted 4-seater and 6-seater solid wood dining sets at honest workshop rates.',
      image:
        'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=1600&auto=format&fit=crop&q=80',
      primaryText: 'View Dining Collections',
      primaryLink: '/products',
      secondaryText: 'Direct WhatsApp',
      secondaryType: 'whatsapp',
    },
  ],
};

const withTimeout = (promise, ms = 2000) => {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Firestore operation timed out')), ms)
    ),
  ]);
};

export const settingsService = {
  getCachedSettings() {
    try {
      const cached = localStorage.getItem('ss_cached_settings');
      if (cached) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(cached) };
      }
    } catch (_) {}
    return DEFAULT_SETTINGS;
  },

  async getSettings() {
    const cached = this.getCachedSettings();

    if (!db) return cached;

    try {
      const docRef = doc(db, COLLECTIONS.SETTINGS, SETTINGS_DOC_ID);
      const snap = await withTimeout(getDoc(docRef), 2000);
      if (!snap.exists()) {
        return cached;
      }
      const data = {
        ...DEFAULT_SETTINGS,
        ...snap.data(),
        id: snap.id,
      };

      try {
        localStorage.setItem('ss_cached_settings', JSON.stringify(data));
      } catch (_) {}

      return data;
    } catch (err) {
      console.warn('Using cached settings fallback:', err.message);
      return cached;
    }
  },

  async updateSettings(data) {
    if (!data) throw new Error('No data provided');

    const cleanData = {
      updatedAt: serverTimestamp(),
    };

    if (data.businessName !== undefined) cleanData.businessName = data.businessName.trim();
    if (data.businessPhone !== undefined) {
      cleanData.businessPhone = data.businessPhone.trim();
      cleanData.phone = cleanData.businessPhone;
    }
    if (data.whatsappNumber !== undefined) cleanData.whatsappNumber = data.whatsappNumber.trim();
    if (data.businessEmail !== undefined) {
      cleanData.businessEmail = data.businessEmail.trim();
      cleanData.email = cleanData.businessEmail;
    }
    if (data.address !== undefined) cleanData.address = data.address.trim();
    if (data.location !== undefined) cleanData.location = data.location.trim();
    if (data.googleMapsUrl !== undefined) cleanData.googleMapsUrl = data.googleMapsUrl.trim();
    if (data.socialLinks && typeof data.socialLinks === 'object') cleanData.socialLinks = data.socialLinks;
    if (data.businessHours !== undefined) cleanData.businessHours = data.businessHours.trim();
    if (data.aboutUs !== undefined) cleanData.aboutUs = data.aboutUs.trim();
    if (data.tagline !== undefined) cleanData.tagline = data.tagline.trim();
    if (data.announcement !== undefined) cleanData.announcement = data.announcement.trim();
    if (Array.isArray(data.banners)) cleanData.banners = data.banners;

    try {
      if (db) {
        const docRef = doc(db, COLLECTIONS.SETTINGS, SETTINGS_DOC_ID);
        await withTimeout(setDoc(docRef, cleanData, { merge: true }), 3000);
      }
    } catch (err) {
      console.warn('Firestore settings update fallback:', err.message);
    }

    try {
      const current = this.getCachedSettings();
      const merged = { ...current, ...cleanData };
      localStorage.setItem('ss_cached_settings', JSON.stringify(merged));
    } catch (_) {}

    return cleanData;
  },
};
