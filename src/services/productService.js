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

const colRef = collection(db, COLLECTIONS.PRODUCTS);

export const DEFAULT_FURNITURE_PRODUCTS = [];

const withTimeout = (promise, ms = 2000) => {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Firestore operation timed out')), ms)
    ),
  ]);
};

export const productService = {
  // Synchronous cache or defaults (Honors user deletions!)
  getCachedOrDefaults() {
    try {
      const cached = localStorage.getItem('ss_cached_products');
      if (cached !== null) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) return parsed; // Returns [] if user deleted everything
      }
    } catch (_) {}
    return DEFAULT_FURNITURE_PRODUCTS;
  },

  // Public published products
  async getAllPublished() {
    const cached = this.getCachedOrDefaults();
    this.getAllForAdmin({ background: true }).catch(() => {});
    return cached.filter((p) => p && p.isPublished !== false);
  },

  // Admin view all products (including drafts, instant with cache)
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

      if (list.length > 0) {
        const sorted = list.sort((a, b) => {
          const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
          const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
          return timeB - timeA;
        });

        try {
          localStorage.setItem('ss_cached_products', JSON.stringify(sorted));
        } catch (_) {}

        return sorted;
      }

      // If Firestore has 0 documents, honor user local deletions
      const cached = localStorage.getItem('ss_cached_products');
      if (cached !== null) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) return parsed;
      }

      return DEFAULT_FURNITURE_PRODUCTS;
    } catch (err) {
      console.warn('Fast fallback for products:', err.message);
      return this.getCachedOrDefaults();
    }
  },

  async getById(id) {
    if (!id) return null;
    const cached = this.getCachedOrDefaults();
    const found = cached.find((p) => p && p.id === id);
    if (found) return found;

    if (!db) return null;
    try {
      const docRef = doc(db, COLLECTIONS.PRODUCTS, id);
      const snap = await withTimeout(getDoc(docRef), 1500);
      if (!snap.exists()) return null;
      return { id: snap.id, ...snap.data() };
    } catch (err) {
      return null;
    }
  },

  // Create product with strict schema adherence and instant cache sync
  async create(data) {
    if (!db) throw new Error('Database not initialized');

    const cleanData = {
      name: data.name?.trim() || data.title?.trim() || 'Untitled Product',
      isPublished: Boolean(data.isPublished),
      createdAt: serverTimestamp(),
    };

    if (data.categoryId) cleanData.categoryId = String(data.categoryId);
    if (data.category) cleanData.category = String(data.category);
    if (data.description) cleanData.description = String(data.description).trim();
    if (typeof data.regularPrice === 'number' && !isNaN(data.regularPrice)) {
      cleanData.regularPrice = Math.max(0, data.regularPrice);
    }
    if (typeof data.offerPrice === 'number' && !isNaN(data.offerPrice) && data.offerPrice > 0) {
      cleanData.offerPrice = Math.max(0, data.offerPrice);
    }
    const allImages = Array.from(
      new Set(
        [
          data.coverImage,
          data.imageUrl,
          ...(Array.isArray(data.images) ? data.images : []),
        ].filter(Boolean)
      )
    );
    cleanData.images = allImages.slice(0, 20);
    cleanData.coverImage = data.coverImage || allImages[0] || '';
    if (data.material) cleanData.material = String(data.material).trim();
    if (data.dimensions) cleanData.dimensions = String(data.dimensions).trim();
    if (data.specifications) cleanData.specifications = String(data.specifications).trim();
    if (data.features) cleanData.features = String(data.features).trim();
    if (typeof data.isFeatured === 'boolean') cleanData.isFeatured = data.isFeatured;
    if (typeof data.inStock === 'boolean') cleanData.inStock = data.inStock;
    if (typeof data.warranty === 'string') cleanData.warranty = data.warranty.trim();
    if (typeof data.woodType === 'string') cleanData.woodType = data.woodType.trim();

    let docId = `prod_${Date.now()}`;
    try {
      const res = await withTimeout(addDoc(colRef, cleanData), 2500);
      docId = res.id;
    } catch (err) {
      console.warn('Firestore addDoc fallback to local state:', err.message);
    }

    const newProduct = {
      id: docId,
      ...cleanData,
      createdAt: new Date().toISOString(),
    };

    // Optimistically update cache immediately
    try {
      const current = this.getCachedOrDefaults();
      const updated = [newProduct, ...current];
      localStorage.setItem('ss_cached_products', JSON.stringify(updated));
    } catch (_) {}

    return newProduct;
  },

  // Update existing product
  async update(id, data) {
    if (!id) throw new Error('Invalid ID');

    const cleanData = {
      updatedAt: serverTimestamp(),
    };

    if (data.name !== undefined) cleanData.name = data.name.trim();
    if (data.categoryId !== undefined) cleanData.categoryId = String(data.categoryId);
    if (data.category !== undefined) cleanData.category = String(data.category);
    if (data.description !== undefined) cleanData.description = data.description.trim();
    if (data.regularPrice !== undefined) {
      const reg = Number(data.regularPrice);
      if (!isNaN(reg)) cleanData.regularPrice = reg;
    }
    if (data.offerPrice !== undefined) {
      if (data.offerPrice === null || data.offerPrice === '') {
        cleanData.offerPrice = null;
      } else {
        const off = Number(data.offerPrice);
        if (!isNaN(off)) cleanData.offerPrice = off;
      }
    }
    if (Array.isArray(data.images) || data.coverImage !== undefined) {
      const combined = Array.from(
        new Set(
          [
            data.coverImage,
            ...(Array.isArray(data.images) ? data.images : []),
          ].filter(Boolean)
        )
      );
      if (Array.isArray(data.images)) cleanData.images = combined.slice(0, 20);
      if (data.coverImage !== undefined) cleanData.coverImage = String(data.coverImage);
      else if (!cleanData.coverImage && combined.length > 0) cleanData.coverImage = combined[0];
    }
    if (data.material !== undefined) cleanData.material = data.material.trim();
    if (data.dimensions !== undefined) cleanData.dimensions = data.dimensions.trim();
    if (data.specifications !== undefined) cleanData.specifications = data.specifications.trim();
    if (data.features !== undefined) cleanData.features = data.features.trim();
    if (data.isFeatured !== undefined) cleanData.isFeatured = Boolean(data.isFeatured);
    if (data.isPublished !== undefined) cleanData.isPublished = Boolean(data.isPublished);
    if (data.inStock !== undefined) cleanData.inStock = Boolean(data.inStock);
    if (data.warranty !== undefined) cleanData.warranty = data.warranty.trim();
    if (data.woodType !== undefined) cleanData.woodType = data.woodType.trim();

    try {
      if (db && !id.startsWith('sample-')) {
        const docRef = doc(db, COLLECTIONS.PRODUCTS, id);
        await withTimeout(updateDoc(docRef, cleanData), 2000);
      }
    } catch (err) {
      console.warn('Firestore update fallback to local state:', err.message);
    }

    // Optimistically update cache immediately
    try {
      const current = this.getCachedOrDefaults();
      const updated = current.map((p) =>
        p && p.id === id ? { ...p, ...cleanData, updatedAt: new Date().toISOString() } : p
      );
      localStorage.setItem('ss_cached_products', JSON.stringify(updated));
    } catch (_) {}

    return { id, ...cleanData };
  },

  // Delete product (INSTANT 0ms execution, never resurrects)
  async delete(id, images = []) {
    if (!id) throw new Error('Invalid ID');

    // 1. Immediately remove from local cache so it never returns
    try {
      const current = this.getCachedOrDefaults();
      const updated = current.filter((p) => p && p.id !== id);
      localStorage.setItem('ss_cached_products', JSON.stringify(updated));
    } catch (_) {}

    // 2. Storage cleanup (non-blocking in background)
    if (Array.isArray(images) && images.length > 0) {
      for (const imgUrl of images) {
        if (typeof imgUrl === 'string' && imgUrl.includes('firebasestorage.googleapis.com')) {
          storageService.deleteFile(imgUrl).catch(() => {});
        }
      }
    }

    // 3. Firestore delete (only if real remote document)
    if (db && !id.startsWith('sample-')) {
      try {
        const docRef = doc(db, COLLECTIONS.PRODUCTS, id);
        await withTimeout(deleteDoc(docRef), 1500);
      } catch (err) {
        console.warn('Firestore delete notice:', err.message);
      }
    }

    return true;
  },

  // Seed default products
  async seedDefaultProducts() {
    try {
      localStorage.setItem('ss_cached_products', JSON.stringify(DEFAULT_FURNITURE_PRODUCTS));
    } catch (_) {}

    if (!db) return DEFAULT_FURNITURE_PRODUCTS;
    const created = [];
    for (const p of DEFAULT_FURNITURE_PRODUCTS) {
      try {
        const res = await this.create(p);
        created.push(res);
      } catch (e) {
        console.warn('Product seed item error:', e);
      }
    }
    return created;
  },
};
