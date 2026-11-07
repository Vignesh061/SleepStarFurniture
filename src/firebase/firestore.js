import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  getCountFromServer,
} from 'firebase/firestore';
import { db } from './config';

// Collection names
export const COLLECTIONS = {
  ADMINS: 'admins',
  CATEGORIES: 'categories',
  PRODUCTS: 'products',
  SERVICES: 'services',
  PROJECTS: 'projects',
  ENQUIRIES: 'enquiries',
  OFFERS: 'offers',
  SETTINGS: 'siteSettings',
};

export {
  db,
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  getCountFromServer,
};
