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

const colRef = collection(db, COLLECTIONS.PROJECTS);

export const SAMPLE_PROJECTS = [];

const withTimeout = (promise, ms = 2500) => {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Firestore operation timed out')), ms)
    ),
  ]);
};

export const projectService = {
  // Synchronous cache (empty by default, no hardcoded sample data)
  getCachedOrDefaults() {
    try {
      const cached = localStorage.getItem('ss_cached_projects');
      if (cached !== null) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (_) {}
    return [];
  },

  // Public published projects
  async getAllPublished() {
    const cached = this.getCachedOrDefaults();
    this.getAllForAdmin({ background: true }).catch(() => {});
    return cached.filter((p) => p && p.status === 'published');
  },

  // Admin get all projects (drafts, published, archived)
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

      const sorted = list.sort((a, b) => {
        const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return timeB - timeA;
      });

      try {
        localStorage.setItem('ss_cached_projects', JSON.stringify(sorted));
      } catch (_) {}

      return sorted;
    } catch (err) {
      console.warn('Fast fallback for projects:', err.message);
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
      const docRef = doc(db, COLLECTIONS.PROJECTS, id);
      const snap = await withTimeout(getDoc(docRef), 1500);
      if (!snap.exists()) return null;
      return { id: snap.id, ...snap.data() };
    } catch (err) {
      return null;
    }
  },

  // Create project adhering to firestore.rules
  async create(data) {
    if (!db) throw new Error('Database not initialized');

    const cleanData = {
      title: data.title.trim(),
      status: ['published', 'draft', 'archived'].includes(data.status)
        ? data.status
        : 'published',
      createdAt: serverTimestamp(),
    };

    if (data.description) cleanData.description = data.description.trim();
    if (data.category) cleanData.category = data.category.trim();
    if (data.serviceType) cleanData.serviceType = data.serviceType.trim();
    if (data.location) cleanData.location = data.location.trim();
    if (data.coverImage) cleanData.coverImage = data.coverImage.trim();
    if (data.imageUrl) cleanData.imageUrl = data.imageUrl.trim();
    if (Array.isArray(data.images)) cleanData.images = data.images.slice(0, 20);
    if (data.videoUrl) cleanData.videoUrl = data.videoUrl.trim();
    if (data.clientName) cleanData.clientName = data.clientName.trim();
    if (data.completionDate) cleanData.completionDate = data.completionDate.trim();
    if (data.materials) cleanData.materials = data.materials.trim();

    if (data.cost !== undefined && data.cost !== '') {
      const costNum = Number(data.cost);
      if (!isNaN(costNum) && costNum >= 0) {
        cleanData.cost = costNum;
        cleanData.price = costNum;
      }
    }

    if (typeof data.isFeatured === 'boolean') cleanData.isFeatured = data.isFeatured;
    if (typeof data.displayOrder === 'number') cleanData.displayOrder = data.displayOrder;

    let docId = `proj_${Date.now()}`;
    try {
      const res = await withTimeout(addDoc(colRef, cleanData), 2500);
      docId = res.id;
    } catch (err) {
      console.warn('Firestore project create fallback to local state:', err.message);
    }

    const newProject = {
      id: docId,
      ...cleanData,
      createdAt: new Date().toISOString(),
    };

    try {
      const current = this.getCachedOrDefaults();
      const updated = [newProject, ...current];
      localStorage.setItem('ss_cached_projects', JSON.stringify(updated));
    } catch (_) {}

    return newProject;
  },

  // Update project
  async update(id, data) {
    if (!id) throw new Error('Invalid arguments');

    const cleanData = {
      updatedAt: serverTimestamp(),
    };

    if (data.title !== undefined) cleanData.title = data.title.trim();
    if (data.status !== undefined && ['published', 'draft', 'archived'].includes(data.status)) {
      cleanData.status = data.status;
    }
    if (data.description !== undefined) cleanData.description = data.description.trim();
    if (data.category !== undefined) cleanData.category = data.category.trim();
    if (data.serviceType !== undefined) cleanData.serviceType = data.serviceType.trim();
    if (data.location !== undefined) cleanData.location = data.location.trim();
    if (data.coverImage !== undefined) cleanData.coverImage = data.coverImage.trim();
    if (data.imageUrl !== undefined) cleanData.imageUrl = data.imageUrl.trim();
    if (Array.isArray(data.images)) cleanData.images = data.images.slice(0, 20);
    if (data.videoUrl !== undefined) cleanData.videoUrl = data.videoUrl.trim();
    if (data.clientName !== undefined) cleanData.clientName = data.clientName.trim();
    if (data.completionDate !== undefined) cleanData.completionDate = data.completionDate.trim();
    if (data.materials !== undefined) cleanData.materials = data.materials.trim();

    if (data.cost !== undefined) {
      const costNum = Number(data.cost);
      if (!isNaN(costNum) && costNum >= 0) {
        cleanData.cost = costNum;
        cleanData.price = costNum;
      }
    }

    if (data.isFeatured !== undefined) cleanData.isFeatured = Boolean(data.isFeatured);
    if (data.displayOrder !== undefined) cleanData.displayOrder = Number(data.displayOrder) || 1;

    try {
      if (db) {
        const docRef = doc(db, COLLECTIONS.PROJECTS, id);
        await withTimeout(updateDoc(docRef, cleanData), 2000);
      }
    } catch (err) {
      console.warn('Firestore update project fallback:', err.message);
    }

    try {
      const current = this.getCachedOrDefaults();
      const updated = current.map((p) =>
        p && p.id === id ? { ...p, ...cleanData, updatedAt: new Date().toISOString() } : p
      );
      localStorage.setItem('ss_cached_projects', JSON.stringify(updated));
    } catch (_) {}

    return { id, ...cleanData };
  },

  // Delete project (0ms instant execution)
  async delete(id, images = [], videoUrl = '') {
    if (!id) throw new Error('Invalid arguments');

    // 1. Immediately remove from local cache
    try {
      const current = this.getCachedOrDefaults();
      const updated = current.filter((p) => p && p.id !== id);
      localStorage.setItem('ss_cached_projects', JSON.stringify(updated));
    } catch (_) {}

    // 2. Storage cleanup (non-blocking)
    if (Array.isArray(images) && images.length > 0) {
      for (const imgUrl of images) {
        if (typeof imgUrl === 'string' && imgUrl.includes('firebasestorage.googleapis.com')) {
          storageService.deleteFile(imgUrl).catch(() => {});
        }
      }
    }
    if (videoUrl && videoUrl.includes('firebasestorage.googleapis.com')) {
      storageService.deleteFile(videoUrl).catch(() => {});
    }

    // 3. Remote delete
    if (db) {
      try {
        const docRef = doc(db, COLLECTIONS.PROJECTS, id);
        await withTimeout(deleteDoc(docRef), 1500);
      } catch (err) {
        console.warn('Firestore project delete fallback:', err.message);
      }
    }

    return true;
  },
};
