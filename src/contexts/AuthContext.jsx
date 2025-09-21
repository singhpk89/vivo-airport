import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessibleMenus, setAccessibleMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('auth_token'));
  const navigate = useNavigate();

  // API base URL from environment variable with fallback
  const API_BASE = import.meta.env.VITE_API_URL;


  // Initialize auth state on mount
  useEffect(() => {
    if (token) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [token]);

  // Fetch user profile and accessible menus
  const fetchProfile = async () => {
    try {
      const response = await fetch(`${API_BASE}/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData.user);

        // Fetch accessible menus
        const menusResponse = await fetch(`${API_BASE}/auth/accessible-menus`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (menusResponse.ok) {
          const menusData = await menusResponse.json();
          setAccessibleMenus(menusData.menus || []);
        }
      } else {
        // Token invalid, clear auth state
        localStorage.removeItem('auth_token');
        setToken(null);
        setUser(null);
        setAccessibleMenus([]);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      localStorage.removeItem('auth_token');
      setToken(null);
      setUser(null);
      setAccessibleMenus([]);
    } finally {
      setLoading(false);
    }
  };

  // Login function
  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        const authToken = data.token;
        localStorage.setItem('auth_token', authToken);
        setToken(authToken);
        setUser(data.user);
        setAccessibleMenus(data.accessible_menus || []);
        return { success: true, user: data.user };
      } else {
        return { success: false, message: data.message || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Network error occurred' };
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.ok) {
        const authToken = data.token;
        localStorage.setItem('auth_token', authToken);
        setToken(authToken);
        setUser(data.user);
        setAccessibleMenus(data.accessible_menus || []);
        return { success: true, user: data.user };
      } else {
        return { success: false, message: data.message || 'Registration failed' };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, message: 'Network error occurred' };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      if (token) {
        await fetch(`${API_BASE}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('auth_token');
      setToken(null);
      setUser(null);
      setAccessibleMenus([]);
      navigate('/login');
    }
  };

  // Check if user has specific permission
  const hasPermission = async (permission) => {
    if (!token) return false;

    try {
      const response = await fetch(`${API_BASE}/auth/check-permission`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ permission }),
      });

      const data = await response.json();
      return data.has_permission || false;
    } catch (error) {
      console.error('Permission check error:', error);
      return false;
    }
  };

  // Check if menu item is accessible
  const isMenuAccessible = (menuKey) => {
    return accessibleMenus.includes(menuKey);
  };

  // Update profile
  const updateProfile = async (profileData) => {
    try {
      const response = await fetch(`${API_BASE}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        return { success: true, user: data.user };
      } else {
        return { success: false, message: data.message || 'Update failed' };
      }
    } catch (error) {
      console.error('Profile update error:', error);
      return { success: false, message: 'Network error occurred' };
    }
  };

  const value = {
    user,
    accessibleMenus,
    loading,
    isAuthenticated: !!token,
    login,
    register,
    logout,
    hasPermission,
    isMenuAccessible,
    updateProfile,
    fetchProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
