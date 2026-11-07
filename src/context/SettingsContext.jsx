import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { settingsService, DEFAULT_SETTINGS } from '../services/settingsService';

const SettingsContext = createContext({
  settings: DEFAULT_SETTINGS,
  loading: true,
  refreshSettings: async () => {},
  updateSettings: async () => {},
});

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  const refreshSettings = useCallback(async () => {
    try {
      const data = await settingsService.getSettings();
      setSettings(data);
    } catch (err) {
      console.warn('Failed to fetch settings:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSettings();
  }, [refreshSettings]);

  const updateSettings = async (newData) => {
    await settingsService.updateSettings(newData);
    await refreshSettings();
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        loading,
        refreshSettings,
        updateSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

