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
  orderBy,
  serverTimestamp,
  COLLECTIONS,
} from '../firebase/firestore';
import { storageService } from './storageService';

const colRef = collection(db, COLLECTIONS.ENQUIRIES);

export const ENQUIRY_STATUSES = [
  'New',
  'Contacted',
  'Site Visit Scheduled',
  'Quotation Sent',
  'Confirmed',
  'Completed',
  'Closed',
];

export const ENQUIRY_TYPES = [
  'Product Enquiry',
  'Custom Service Enquiry',
  'Exact Project Enquiry',
  'Similar Project Enquiry',
  'General Enquiry',
];

const withTimeout = (promise, ms = 2500) => {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Firestore operation timed out')), ms)
    ),
  ]);
};

export const enquiryService = {
  getCachedEnquiries() {
    try {
      const cached = localStorage.getItem('ss_cached_enquiries');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (_) {}
    return [];
  },

  async createEnquiry(data) {
    if (!db) throw new Error('Database not initialized');

    if (!data.customerName || !data.customerName.trim()) {
      throw new Error('Please provide your name.');
    }

    if (!data.phone || !data.phone.trim()) {
      throw new Error('Please provide a valid contact phone number.');
    }

    const cleanData = {
      customerName: data.customerName.trim(),
      phone: data.phone.trim(),
      enquiryType: data.enquiryType?.trim() || 'General Enquiry',
      status: 'New',
      createdAt: serverTimestamp(),
    };

    if (data.email) cleanData.email = data.email.trim();
    if (data.message) cleanData.message = data.message.trim();
    if (data.location) cleanData.location = data.location.trim();
    if (data.budget) cleanData.budget = String(data.budget).trim();
    if (data.productName) cleanData.productName = data.productName.trim();
    if (data.productId) cleanData.productId = data.productId.trim();
    if (data.serviceName) cleanData.serviceName = data.serviceName.trim();
    if (data.referenceImage) cleanData.referenceImage = data.referenceImage.trim();

    let docId = `enq_${Date.now()}`;
    try {
      const res = await withTimeout(addDoc(colRef, cleanData), 3500);
      docId = res.id;
    } catch (err) {
      console.warn('Firestore enquiry creation fallback to local state:', err.message);
    }

    const newEnquiry = {
      id: docId,
      ...cleanData,
      createdAt: new Date().toISOString(),
    };

    try {
      const current = this.getCachedEnquiries();
      const updated = [newEnquiry, ...current];
      localStorage.setItem('ss_cached_enquiries', JSON.stringify(updated));
    } catch (_) {}

    return newEnquiry;
  },

  async getAllForAdmin({ forceRefresh = false, background = false } = {}) {
    const cached = this.getCachedEnquiries();

    if (!forceRefresh && !background && cached.length > 0) {
      this.fetchFromFirestore().catch(() => {});
      return cached;
    }

    return await this.fetchFromFirestore();
  },

  async fetchFromFirestore() {
    if (!db) return this.getCachedEnquiries();

    try {
      const snap = await withTimeout(getDocs(colRef), 2500);
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

      const sorted = list.sort((a, b) => {
        const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return timeB - timeA;
      });

      try {
        localStorage.setItem('ss_cached_enquiries', JSON.stringify(sorted));
      } catch (_) {}

      return sorted;
    } catch (err) {
      console.warn('Error fetching enquiries for admin, using cache:', err.message);
      return this.getCachedEnquiries();
    }
  },

  async updateEnquiry(id, data) {
    if (!id) throw new Error('Invalid arguments');

    const cleanData = {
      updatedAt: serverTimestamp(),
    };

    if (data.status !== undefined) cleanData.status = data.status;
    if (data.notes !== undefined) cleanData.notes = data.notes.trim();
    if (data.assignedTo !== undefined) cleanData.assignedTo = data.assignedTo.trim();

    try {
      if (db) {
        const docRef = doc(db, COLLECTIONS.ENQUIRIES, id);
        await withTimeout(updateDoc(docRef, cleanData), 3000);
      }
    } catch (err) {
      console.warn('Firestore update enquiry fallback:', err.message);
    }

    try {
      const current = this.getCachedEnquiries();
      const updated = current.map((e) =>
        e.id === id ? { ...e, ...cleanData, updatedAt: new Date().toISOString() } : e
      );
      localStorage.setItem('ss_cached_enquiries', JSON.stringify(updated));
    } catch (_) {}

    return { id, ...cleanData };
  },

  async delete(id, referenceImageUrl = '') {
    if (!id) throw new Error('Invalid arguments');

    if (referenceImageUrl && referenceImageUrl.includes('firebasestorage.googleapis.com')) {
      storageService.deleteFile(referenceImageUrl).catch(() => {});
    }

    try {
      if (db) {
        const docRef = doc(db, COLLECTIONS.ENQUIRIES, id);
        await withTimeout(deleteDoc(docRef), 3000);
      }
    } catch (err) {
      console.warn('Firestore delete enquiry fallback:', err.message);
    }

    try {
      const current = this.getCachedEnquiries();
      const updated = current.filter((e) => e.id !== id);
      localStorage.setItem('ss_cached_enquiries', JSON.stringify(updated));
    } catch (_) {}

    return true;
  },
};
