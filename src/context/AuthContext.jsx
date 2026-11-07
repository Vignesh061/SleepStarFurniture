import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, isFirebaseConfigured } from '../firebase/config';
import {
  loginAdmin,
  logoutAdmin,
  checkIsAdmin,
  subscribeToAuthChanges,
} from '../firebase/auth';

const AuthContext = createContext({
  currentUser: null,
  isAdmin: false,
  loading: true,
  isConfigured: false,
  login: async () => {},
  logout: async () => {},
  verifyAdmin: async () => false,
});

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth || !isFirebaseConfigured) {
      setLoading(false);
      return;
    }

    const unsubscribe = subscribeToAuthChanges(async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const adminStatus = await checkIsAdmin(user);
          setIsAdmin(adminStatus);
        } catch (err) {
          console.error('Failed to verify admin status:', err);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    const cred = await loginAdmin(email, password);
    const adminStatus = await checkIsAdmin(cred.user);
    setIsAdmin(adminStatus);
    return { user: cred.user, isAdmin: adminStatus };
  };

  const logout = async () => {
    await logoutAdmin();
    setCurrentUser(null);
    setIsAdmin(false);
  };

  const verifyAdmin = async () => {
    if (!currentUser) return false;
    const status = await checkIsAdmin(currentUser);
    setIsAdmin(status);
    return status;
  };

  const value = {
    currentUser,
    isAdmin,
    loading,
    isConfigured: isFirebaseConfigured,
    login,
    logout,
    verifyAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};
