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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  // API base URL from environment variable with fallback
  const API_BASE = import.meta.env.VITE_API_URL;

  // Helper function to get CSRF token from cookies
  const getCSRFToken = () => {
    // Try to get XSRF-TOKEN from cookies
    const name = 'XSRF-TOKEN=';
    const decodedCookie = decodeURIComponent(document.cookie);
    const cookieArray = decodedCookie.split(';');
    for (let i = 0; i < cookieArray.length; i++) {
      let cookie = cookieArray[i];
      while (cookie.charAt(0) === ' ') {
        cookie = cookie.substring(1);
      }
      if (cookie.indexOf(name) === 0) {
        return decodeURIComponent(cookie.substring(name.length, cookie.length));
      }
    }

    // Fallback: try to get from meta tag if available
    const csrfMeta = document.querySelector('meta[name="csrf-token"]');
    if (csrfMeta) {
      return csrfMeta.getAttribute('content');
    }

    return null;
  };

  // Initialize auth state on mount
  useEffect(() => {
    console.log('AuthProvider: Initializing with token:', token);

    const initializeAuth = async () => {
      if (token) {
        await fetchProfile();
      } else {
        console.log('AuthProvider: No token found, user is not authenticated');
        setIsAuthenticated(false);
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Fetch user profile and accessible menus
  const fetchProfile = async (tokenToUse = null) => {
    const currentToken = tokenToUse || token;
    console.log('AuthProvider: Fetching profile with token:', currentToken);

    if (!currentToken) {
      console.log('AuthProvider: No token available for profile fetch');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${currentToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      console.log('AuthProvider: Profile response status:', response.status);

      if (response.ok) {
        const userData = await response.json();
        console.log('AuthProvider: Profile data received:', userData);
        setUser(userData.user);
        setIsAuthenticated(true);

        // Fetch accessible menus
        const menusResponse = await fetch(`${API_BASE}/auth/accessible-menus`, {
          headers: {
            'Authorization': `Bearer ${currentToken}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        });

        if (menusResponse.ok) {
          const menusData = await menusResponse.json();
          console.log('AuthProvider: Menus data received:', menusData);
          // Extract menu keys from the menu objects
          const menuKeys = (menusData.data?.menus || []).map(menu => menu.module);
          console.log('AuthProvider: Extracted menu keys:', menuKeys);
          setAccessibleMenus(menuKeys);
        }
      } else {
        console.log('AuthProvider: Invalid token, clearing auth state');
        // Token invalid, clear auth state
        localStorage.removeItem('auth_token');
        setToken(null);
        setUser(null);
        setAccessibleMenus([]);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('AuthProvider: Error fetching profile:', error);
      localStorage.removeItem('auth_token');
      setToken(null);
      setUser(null);
      setAccessibleMenus([]);
      setIsAuthenticated(false);
    } finally {
      console.log('AuthProvider: Setting loading to false');
      setLoading(false);
    }
  };

  // Login function - Simplified token-based approach
  const login = async (email, password) => {
    try {
      console.log('AuthProvider: Starting login process (token-based)');

      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      console.log('AuthProvider: Login response status:', response.status);

      const data = await response.json();
      console.log('AuthProvider: Login response data:', data);

      if (response.ok) {
        // Handle the nested response structure from Laravel API
        const responseData = data.data || data;
        const authToken = responseData.token;
        const userData = responseData.user;
        const accessibleMenus = responseData.accessible_modules || data.accessible_menus || [];

        console.log('AuthProvider: Extracted token:', authToken);
        console.log('AuthProvider: Extracted user:', userData);
        console.log('AuthProvider: Extracted menus:', accessibleMenus);

        localStorage.setItem('auth_token', authToken);
        setToken(authToken);
        setUser(userData);
        setAccessibleMenus(accessibleMenus);
        setIsAuthenticated(true);

        // Fetch fresh profile data with the new token
        await fetchProfile(authToken);

        console.log('AuthProvider: Login successful, returning success response');
        return { success: true, user: userData };
      } else {
        console.log('AuthProvider: Login failed with response:', data);
        return { success: false, message: data.message || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Network error occurred' };
    }
  };

  // Register function - Simplified token-based approach
  const register = async (userData) => {
    try {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
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

  // Logout function - Simplified
  const logout = async () => {
    try {
      if (token) {
        await fetch(`${API_BASE}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
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
      setIsAuthenticated(false);
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
      console.log('Permission check response:', data, 'for permission:', permission);
      // Handle the nested response structure
      return data.data?.has_permission || false;
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

  // Check if user has a specific role
  const hasRole = (roleName) => {
    if (!user || !user.roles) return false;
    return user.roles.some(role => role.name === roleName);
  };

  // Check if user is super admin
  const isSuperAdmin = () => {
    return hasRole('super_admin');
  };

  // Check if user is viewer (read-only)
  const isViewer = () => {
    return hasRole('viewer');
  };

  // Check if user can edit (not a viewer)
  const canEdit = () => {
    return !isViewer();
  };

  // Check if user can create (not a viewer)
  const canCreate = () => {
    return !isViewer();
  };

  // Check if user can delete (not a viewer)
  const canDelete = () => {
    return !isViewer();
  };

  // Check if user can manage roles and permissions (only Super Admin and Admin)
  const canManageRolesAndPermissions = () => {
    return hasRole('super_admin') || hasRole('admin');
  };

  const value = {
    user,
    accessibleMenus,
    loading,
    isAuthenticated,
    token,
    login,
    register,
    logout,
    hasPermission,
    hasRole,
    isSuperAdmin,
    isViewer,
    canEdit,
    canCreate,
    canDelete,
    canManageRolesAndPermissions,
    isMenuAccessible,
    updateProfile,
    fetchProfile
  };

  console.log('AuthProvider: Context value - isAuthenticated:', isAuthenticated, 'token:', token, 'loading:', loading, 'user:', user);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
