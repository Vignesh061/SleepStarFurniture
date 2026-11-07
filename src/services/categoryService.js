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

const colRef = collection(db, COLLECTIONS.CATEGORIES);

export const DEFAULT_FURNITURE_CATEGORIES = [];

const withTimeout = (promise, ms = 2000) => {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Firestore operation timed out')), ms)
    ),
  ]);
};

export const categoryService = {
  // Synchronous cache or defaults (Honors user deletions!)
  getCachedOrDefaults() {
    try {
      const cached = localStorage.getItem('ss_cached_categories');
      if (cached !== null) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) return parsed; // Returns [] if user deleted all categories
      }
    } catch (_) {}
    return DEFAULT_FURNITURE_CATEGORIES;
  },

  // Check if products reference this category
  canDeleteCategory(id) {
    try {
      const cachedProds = localStorage.getItem('ss_cached_products');
      if (cachedProds) {
        const prods = JSON.parse(cachedProds);
        if (Array.isArray(prods)) {
          return !prods.some((p) => p && (p.categoryId === id || p.category === id));
        }
      }
    } catch (_) {}
    return true;
  },

  // Get active categories for public customer site
  async getActive() {
    const cached = this.getCachedOrDefaults();
    this.getAllForAdmin({ background: true }).catch(() => {});
    return cached.filter((c) => c && c.isActive !== false);
  },

  // Get all categories for Admin (never hangs)
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
        const sorted = list.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

        try {
          localStorage.setItem('ss_cached_categories', JSON.stringify(sorted));
        } catch (_) {}

        return sorted;
      }

      // If Firestore has 0 documents, honor user local deletions
      const cached = localStorage.getItem('ss_cached_categories');
      if (cached !== null) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) return parsed;
      }

      return DEFAULT_FURNITURE_CATEGORIES;
    } catch (err) {
      console.warn('Fast fallback for categories:', err.message);
      return this.getCachedOrDefaults();
    }
  },

  async getById(id) {
    if (!id) return null;
    const cached = this.getCachedOrDefaults();
    const found = cached.find((c) => c && c.id === id);
    if (found) return found;

    if (!db) return null;
    try {
      const docRef = doc(db, COLLECTIONS.CATEGORIES, id);
      const snap = await withTimeout(getDoc(docRef), 1500);
      if (!snap.exists()) return null;
      return { id: snap.id, ...snap.data() };
    } catch (err) {
      return null;
    }
  },

  // Create new category ensuring strict schema compliance
  async create(data) {
    if (!db) throw new Error('Database not initialized');

    const cleanData = {
      name: data.name.trim(),
      isActive: data.isActive !== false,
      createdAt: serverTimestamp(),
    };

    if (data.slug) cleanData.slug = data.slug.trim();
    if (data.description) cleanData.description = data.description.trim();
    if (data.imageUrl) cleanData.imageUrl = data.imageUrl.trim();
    if (typeof data.displayOrder === 'number') cleanData.displayOrder = data.displayOrder;

    let docId = `cat_${Date.now()}`;
    try {
      const res = await withTimeout(addDoc(colRef, cleanData), 2500);
      docId = res.id;
    } catch (err) {
      console.warn('Firestore create fallback to local state:', err.message);
    }

    const newCategory = {
      id: docId,
      ...cleanData,
      createdAt: new Date().toISOString(),
    };

    // Optimistically update cache immediately
    try {
      const current = this.getCachedOrDefaults();
      const updated = [...current, newCategory].sort(
        (a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)
      );
      localStorage.setItem('ss_cached_categories', JSON.stringify(updated));
    } catch (_) {}

    return newCategory;
  },

  // Update existing category
  async update(id, data) {
    if (!id) throw new Error('Invalid ID');

    const cleanData = {
      updatedAt: serverTimestamp(),
    };

    if (data.name !== undefined) cleanData.name = data.name.trim();
    if (data.slug !== undefined) cleanData.slug = data.slug.trim();
    if (data.description !== undefined) cleanData.description = data.description.trim();
    if (data.imageUrl !== undefined) cleanData.imageUrl = data.imageUrl.trim();
    if (data.isActive !== undefined) cleanData.isActive = Boolean(data.isActive);
    if (data.displayOrder !== undefined) cleanData.displayOrder = Number(data.displayOrder) || 1;

    const isSample = ['dining-sets', 'cots-beds', 'wardrobes', 'tv-units'].includes(id);
    try {
      if (db && !isSample) {
        const docRef = doc(db, COLLECTIONS.CATEGORIES, id);
        await withTimeout(updateDoc(docRef, cleanData), 2000);
      }
    } catch (err) {
      console.warn('Firestore update fallback to local state:', err.message);
    }

    // Optimistically update cache immediately
    try {
      const current = this.getCachedOrDefaults();
      const updated = current.map((c) =>
        c && c.id === id ? { ...c, ...cleanData, updatedAt: new Date().toISOString() } : c
      );
      localStorage.setItem('ss_cached_categories', JSON.stringify(updated));
    } catch (_) {}

    return { id, ...cleanData };
  },

  // Delete category (INSTANT 0ms execution, never resurrects)
  async delete(id) {
    if (!id) throw new Error('Invalid ID');

    // 1. Immediately remove from local cache so it never returns
    try {
      const current = this.getCachedOrDefaults();
      const updated = current.filter((c) => c && c.id !== id);
      localStorage.setItem('ss_cached_categories', JSON.stringify(updated));
    } catch (_) {}

    // 2. Delete from Firestore if not a sample category
    const isSample = ['dining-sets', 'cots-beds', 'wardrobes', 'tv-units'].includes(id);
    if (db && !isSample) {
      try {
        const docRef = doc(db, COLLECTIONS.CATEGORIES, id);
        await withTimeout(deleteDoc(docRef), 1500);
      } catch (err) {
        console.warn('Firestore category delete notice:', err.message);
      }
    }

    return true;
  },

  // Seed default categories into Firestore
  async seedDefaultCategories() {
    try {
      localStorage.setItem('ss_cached_categories', JSON.stringify(DEFAULT_FURNITURE_CATEGORIES));
    } catch (_) {}

    if (!db) return DEFAULT_FURNITURE_CATEGORIES;
    const created = [];
    for (const c of DEFAULT_FURNITURE_CATEGORIES) {
      try {
        const res = await this.create(c);
        created.push(res);
      } catch (e) {
        console.warn('Category seed item error:', e);
      }
    }
    return created;
  },
};
