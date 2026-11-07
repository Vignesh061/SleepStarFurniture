import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { auth } from './config';
import { db, doc, getDoc, setDoc, serverTimestamp, COLLECTIONS } from './firestore';

/**
 * Check whether a user is an authorized administrator (Optimized for instant response)
 * @param {import('firebase/auth').User} user
 * @returns {Promise<boolean>}
 */
export const checkIsAdmin = async (user) => {
  if (!user) return false;

  const userEmail = (user.email || '').toLowerCase().trim();
  const configuredAdminEmail = (import.meta.env.VITE_ADMIN_EMAIL || '').toLowerCase().trim();
  const isPrimary = Boolean(configuredAdminEmail && userEmail === configuredAdminEmail);

  // Fast Path 1: Primary admin email matches environment config (Instant 0ms)
  if (isPrimary) {
    try {
      sessionStorage.setItem(`ss_admin_${user.uid}`, 'true');
    } catch (_) {}

    // Auto-sync admin document in Firestore in background without blocking login
    if (db) {
      try {
        const adminDocRef = doc(db, COLLECTIONS.ADMINS, user.uid);
        setDoc(
          adminDocRef,
          {
            email: user.email,
            role: 'admin',
            isActive: true,
            createdAt: serverTimestamp(),
          },
          { merge: true }
        ).catch((err) => console.warn('Background admin document sync:', err));
      } catch (_) {}
    }

    return true;
  }

  // Fast Path 2: Session cache check (Instant 0ms)
  try {
    if (sessionStorage.getItem(`ss_admin_${user.uid}`) === 'true') {
      return true;
    }
  } catch (_) {}

  // Path 3: Cached custom claim on Auth token
  try {
    const idTokenResult = await user.getIdTokenResult(false);
    if (idTokenResult.claims.admin) {
      try {
        sessionStorage.setItem(`ss_admin_${user.uid}`, 'true');
      } catch (_) {}
      return true;
    }
  } catch (e) {
    console.warn('Could not read custom claims:', e);
  }

  // Path 4: Firestore lookup with timeout
  if (db) {
    try {
      const adminDocRef = doc(db, COLLECTIONS.ADMINS, user.uid);
      const adminSnap = await Promise.race([
        getDoc(adminDocRef),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout')), 2500)
        ),
      ]);

      if (adminSnap && adminSnap.exists() && adminSnap.data()?.isActive !== false) {
        try {
          sessionStorage.setItem(`ss_admin_${user.uid}`, 'true');
        } catch (_) {}
        return true;
      }
    } catch (err) {
      console.warn('Firestore admin verification warning:', err);
    }
  }

  return false;
};

export const loginAdmin = (email, password) => {
  if (!auth) throw new Error('Firebase Auth is not initialized');
  return signInWithEmailAndPassword(auth, email, password);
};

export const logoutAdmin = () => {
  if (!auth) throw new Error('Firebase Auth is not initialized');
  try {
    sessionStorage.clear();
  } catch (_) {}
  return signOut(auth);
};

export const requestPasswordReset = (email) => {
  if (!auth) throw new Error('Firebase Auth is not initialized');
  return sendPasswordResetEmail(auth, email);
};

export const subscribeToAuthChanges = (callback) => {
  if (!auth) return () => {};
  return onAuthStateChanged(auth, callback);
};
