import {
  db,
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
  COLLECTIONS,
} from '../firebase/firestore';

const colRef = collection(db, COLLECTIONS.OFFERS);

export const DEFAULT_OFFERS = [];

const withTimeout = (promise, ms = 2500) => {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Firestore operation timed out')), ms)
    ),
  ]);
};

export const offerService = {
  getCachedOrDefaults() {
    try {
      const cached = localStorage.getItem('ss_cached_offers');
      if (cached !== null) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (_) {}
    return [];
  },

  async getAll({ forceRefresh = false, background = false } = {}) {
    const cached = this.getCachedOrDefaults();

    if (!forceRefresh && !background && cached && cached.length > 0) {
      this.fetchFromFirestore().catch(() => {});
      return cached;
    }

    return await this.fetchFromFirestore();
  },

  async fetchFromFirestore() {
    if (!db) return this.getCachedOrDefaults();

    try {
      const snap = await withTimeout(getDocs(colRef), 2500);
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

      if (list.length === 0) {
        return DEFAULT_OFFERS;
      }

      const sorted = list.sort((a, b) => {
        const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return timeB - timeA;
      });

      try {
        localStorage.setItem('ss_cached_offers', JSON.stringify(sorted));
      } catch (_) {}

      return sorted;
    } catch (err) {
      console.warn('Fast fallback for offers:', err.message);
      return this.getCachedOrDefaults();
    }
  },

  async getActive() {
    const cached = this.getCachedOrDefaults();
    this.getAll({ background: true }).catch(() => {});
    return cached.filter((o) => o.isActive !== false);
  },

  async getById(id) {
    if (!id) return null;
    const cached = this.getCachedOrDefaults();
    const found = cached.find((o) => o.id === id);
    if (found) return found;

    if (!db) return null;
    try {
      const docRef = doc(db, COLLECTIONS.OFFERS, id);
      const snap = await withTimeout(getDoc(docRef), 2000);
      if (!snap.exists()) return null;
      return { id: snap.id, ...snap.data() };
    } catch (err) {
      return null;
    }
  },

  async create(data) {
    if (!db) throw new Error('Database not initialized');

    const cleanData = {
      title: data.title.trim(),
      isActive: data.isActive !== false,
      createdAt: serverTimestamp(),
    };

    if (data.description) cleanData.description = data.description.trim();
    if (typeof data.discountPercentage === 'number' && !isNaN(data.discountPercentage)) {
      cleanData.discountPercentage = Math.max(0, Math.min(100, data.discountPercentage));
      cleanData.discountRate = cleanData.discountPercentage;
      cleanData.discount = cleanData.discountPercentage;
    }
    if (typeof data.offerPrice === 'number' && !isNaN(data.offerPrice)) {
      cleanData.offerPrice = Math.max(0, data.offerPrice);
    }
    if (typeof data.regularPrice === 'number' && !isNaN(data.regularPrice)) {
      cleanData.regularPrice = Math.max(0, data.regularPrice);
    }
    if (data.productId) cleanData.productId = data.productId.trim();
    if (Array.isArray(data.productIds)) cleanData.productIds = data.productIds.slice(0, 50);
    if (data.code) {
      cleanData.code = data.code.trim().toUpperCase();
      cleanData.couponCode = cleanData.code;
    }
    if (data.imageUrl) cleanData.imageUrl = data.imageUrl.trim();
    if (data.bannerUrl) cleanData.bannerUrl = data.bannerUrl.trim();
    if (data.coverImage) cleanData.coverImage = data.coverImage.trim();
    if (typeof data.isFeatured === 'boolean') cleanData.isFeatured = data.isFeatured;
    if (typeof data.displayOrder === 'number') cleanData.displayOrder = data.displayOrder;

    let docId = `off_${Date.now()}`;
    try {
      const res = await withTimeout(addDoc(colRef, cleanData), 3000);
      docId = res.id;
    } catch (err) {
      console.warn('Firestore create offer fallback to local state:', err.message);
    }

    const newOffer = {
      id: docId,
      ...cleanData,
      createdAt: new Date().toISOString(),
    };

    try {
      const current = this.getCachedOrDefaults();
      const updated = [newOffer, ...current];
      localStorage.setItem('ss_cached_offers', JSON.stringify(updated));
    } catch (_) {}

    return newOffer;
  },

  async update(id, data) {
    if (!id) throw new Error('Invalid arguments');

    const cleanData = {
      updatedAt: serverTimestamp(),
    };

    if (data.title !== undefined) cleanData.title = data.title.trim();
    if (data.description !== undefined) cleanData.description = data.description.trim();
    if (data.discountPercentage !== undefined) {
      const pct = Number(data.discountPercentage);
      if (!isNaN(pct)) {
        cleanData.discountPercentage = Math.max(0, Math.min(100, pct));
        cleanData.discountRate = cleanData.discountPercentage;
        cleanData.discount = cleanData.discountPercentage;
      }
    }
    if (data.offerPrice !== undefined) {
      const op = Number(data.offerPrice);
      if (!isNaN(op)) cleanData.offerPrice = Math.max(0, op);
    }
    if (data.regularPrice !== undefined) {
      const rp = Number(data.regularPrice);
      if (!isNaN(rp)) cleanData.regularPrice = Math.max(0, rp);
    }
    if (data.productId !== undefined) cleanData.productId = data.productId.trim();
    if (Array.isArray(data.productIds)) cleanData.productIds = data.productIds.slice(0, 50);
    if (data.code !== undefined) {
      cleanData.code = data.code.trim().toUpperCase();
      cleanData.couponCode = cleanData.code;
    }
    if (data.imageUrl !== undefined) cleanData.imageUrl = data.imageUrl.trim();
    if (data.bannerUrl !== undefined) cleanData.bannerUrl = data.bannerUrl.trim();
    if (data.coverImage !== undefined) cleanData.coverImage = data.coverImage.trim();
    if (data.isActive !== undefined) cleanData.isActive = Boolean(data.isActive);
    if (data.isFeatured !== undefined) cleanData.isFeatured = Boolean(data.isFeatured);
    if (data.displayOrder !== undefined) cleanData.displayOrder = Number(data.displayOrder) || 1;

    try {
      if (db) {
        const docRef = doc(db, COLLECTIONS.OFFERS, id);
        await withTimeout(updateDoc(docRef, cleanData), 3000);
      }
    } catch (err) {
      console.warn('Firestore update offer fallback:', err.message);
    }

    try {
      const current = this.getCachedOrDefaults();
      const updated = current.map((o) =>
        o.id === id ? { ...o, ...cleanData, updatedAt: new Date().toISOString() } : o
      );
      localStorage.setItem('ss_cached_offers', JSON.stringify(updated));
    } catch (_) {}

    return { id, ...cleanData };
  },

  async delete(id) {
    if (!id) throw new Error('Invalid arguments');

    try {
      if (db) {
        const docRef = doc(db, COLLECTIONS.OFFERS, id);
        await withTimeout(deleteDoc(docRef), 3000);
      }
    } catch (err) {
      console.warn('Firestore delete offer fallback:', err.message);
    }

    try {
      const current = this.getCachedOrDefaults();
      const updated = current.filter((o) => o.id !== id);
      localStorage.setItem('ss_cached_offers', JSON.stringify(updated));
    } catch (_) {}

    return true;
  },
};
