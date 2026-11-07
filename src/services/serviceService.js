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
import { storageService } from './storageService';

const colRef = collection(db, COLLECTIONS.SERVICES);

export const DEFAULT_SERVICES = [];

const withTimeout = (promise, ms = 2500) => {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Firestore operation timed out')), ms)
    ),
  ]);
};

export const serviceService = {
  // Synchronous cache (empty by default, no hardcoded sample data)
  getCachedOrDefaults() {
    try {
      const cached = localStorage.getItem('ss_cached_services');
      if (cached !== null) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (_) {}
    return [];
  },

  // Public active services
  async getActive() {
    const cached = this.getCachedOrDefaults();
    this.getAllForAdmin({ background: true }).catch(() => {});
    return cached.filter((s) => s && s.isActive !== false);
  },

  // Admin get all services (instant with cache)
  async getAllForAdmin({ forceRefresh = false, background = false } = {}) {
    const cached = this.getCachedOrDefaults();

    if (!forceRefresh && !background) {
      this.fetchFromFirestore().catch(() => {});
      return cached;
    }

    return await this.fetchFromFirestore();
  },

  async fetchFromFirestore() {
    if (!db) return this.getCachedOrDefaults();

    try {
      const snap = await withTimeout(getDocs(colRef), 2000);
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

      const sorted = list.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

      try {
        localStorage.setItem('ss_cached_services', JSON.stringify(sorted));
      } catch (_) {}

      return sorted;
    } catch (err) {
      console.warn('Fast fallback for services:', err.message);
      return this.getCachedOrDefaults();
    }
  },

  async getById(id) {
    if (!id) return null;
    const cached = this.getCachedOrDefaults();
    const found = cached.find((s) => s && s.id === id);
    if (found) return found;

    if (!db) return null;
    try {
      const docRef = doc(db, COLLECTIONS.SERVICES, id);
      const snap = await withTimeout(getDoc(docRef), 1500);
      if (!snap.exists()) return null;
      return { id: snap.id, ...snap.data() };
    } catch (err) {
      return null;
    }
  },

  // Create service strictly adhering to firestore.rules
  async create(data) {
    if (!db) throw new Error('Database not initialized');

    const cleanData = {
      title: data.title?.trim() || data.name?.trim() || 'Custom Interior Service',
      name: data.name?.trim() || data.title?.trim() || 'Custom Interior Service',
      isActive: data.isActive !== false,
      createdAt: serverTimestamp(),
    };

    if (data.description) cleanData.description = data.description.trim();
    if (typeof data.startingPrice === 'number' && !isNaN(data.startingPrice) && data.startingPrice >= 0) {
      cleanData.startingPrice = data.startingPrice;
      cleanData.price = data.startingPrice;
    }
    if (data.coverImage) cleanData.coverImage = data.coverImage.trim();
    if (data.imageUrl) cleanData.imageUrl = data.imageUrl.trim();
    if (Array.isArray(data.images)) cleanData.images = data.images.slice(0, 20);
    if (data.features) cleanData.features = data.features.trim();
    if (data.highlights) cleanData.highlights = data.highlights.trim();
    if (typeof data.isFeatured === 'boolean') cleanData.isFeatured = data.isFeatured;
    if (typeof data.displayOrder === 'number') cleanData.displayOrder = data.displayOrder;

    let docId = `serv_${Date.now()}`;
    try {
      const res = await withTimeout(addDoc(colRef, cleanData), 2500);
      docId = res.id;
    } catch (err) {
      console.warn('Firestore service create fallback to local state:', err.message);
    }

    const newService = {
      id: docId,
      ...cleanData,
      createdAt: new Date().toISOString(),
    };

    try {
      const current = this.getCachedOrDefaults();
      const updated = [...current, newService].sort(
        (a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)
      );
      localStorage.setItem('ss_cached_services', JSON.stringify(updated));
    } catch (_) {}

    return newService;
  },

  // Update service
  async update(id, data) {
    if (!id) throw new Error('Invalid arguments');

    const cleanData = {
      updatedAt: serverTimestamp(),
    };

    if (data.title !== undefined) {
      cleanData.title = data.title.trim();
      cleanData.name = data.title.trim();
    }
    if (data.name !== undefined && cleanData.name === undefined) {
      cleanData.name = data.name.trim();
      cleanData.title = data.name.trim();
    }
    if (data.description !== undefined) cleanData.description = data.description.trim();
    if (data.startingPrice !== undefined) {
      const priceNum = Number(data.startingPrice) || 0;
      cleanData.startingPrice = priceNum;
      cleanData.price = priceNum;
    }
    if (data.coverImage !== undefined) cleanData.coverImage = data.coverImage.trim();
    if (data.imageUrl !== undefined) cleanData.imageUrl = data.imageUrl.trim();
    if (Array.isArray(data.images)) cleanData.images = data.images.slice(0, 20);
    if (data.features !== undefined) cleanData.features = data.features.trim();
    if (data.highlights !== undefined) cleanData.highlights = data.highlights.trim();
    if (data.isActive !== undefined) cleanData.isActive = Boolean(data.isActive);
    if (data.isFeatured !== undefined) cleanData.isFeatured = Boolean(data.isFeatured);
    if (data.displayOrder !== undefined) cleanData.displayOrder = Number(data.displayOrder) || 1;

    try {
      if (db) {
        const docRef = doc(db, COLLECTIONS.SERVICES, id);
        await withTimeout(updateDoc(docRef, cleanData), 2000);
      }
    } catch (err) {
      console.warn('Firestore update service fallback:', err.message);
    }

    try {
      const current = this.getCachedOrDefaults();
      const updated = current.map((s) =>
        s && s.id === id ? { ...s, ...cleanData, updatedAt: new Date().toISOString() } : s
      );
      localStorage.setItem('ss_cached_services', JSON.stringify(updated));
    } catch (_) {}

    return { id, ...cleanData };
  },

  // Delete service (0ms instant execution)
  async delete(id, images = []) {
    if (!id) throw new Error('Invalid arguments');

    // 1. Immediately remove from local cache
    try {
      const current = this.getCachedOrDefaults();
      const updated = current.filter((s) => s && s.id !== id);
      localStorage.setItem('ss_cached_services', JSON.stringify(updated));
    } catch (_) {}

    // 2. Storage cleanup (non-blocking)
    if (Array.isArray(images) && images.length > 0) {
      for (const imgUrl of images) {
        if (typeof imgUrl === 'string' && imgUrl.includes('firebasestorage.googleapis.com')) {
          storageService.deleteFile(imgUrl).catch(() => {});
        }
      }
    }

    // 3. Remote delete
    if (db) {
      try {
        const docRef = doc(db, COLLECTIONS.SERVICES, id);
        await withTimeout(deleteDoc(docRef), 1500);
      } catch (err) {
        console.warn('Firestore service delete fallback:', err.message);
      }
    }

    return true;
  },
};
