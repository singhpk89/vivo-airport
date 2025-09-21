import React, { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext();

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    app_name: 'GIC Admin Panel',
    app_description: 'Government Information Center Administration Portal',
    contact_email: 'admin@gic.com',
    contact_phone: '+1 (555) 123-4567',
    admin_logo: '',
  });
  const [loading, setLoading] = useState(true);

  const loadPublicSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/public-settings', {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setSettings(prev => ({ ...prev, ...data.data }));
        }
      }
    } catch (error) {
      console.error('Error loading public settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshSettings = () => {
    loadPublicSettings();
  };

  useEffect(() => {
    loadPublicSettings();
  }, []);

  const value = {
    settings,
    loading,
    refreshSettings,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export default SettingsContext;
