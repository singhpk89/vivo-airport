import { useAuth } from '../contexts/AuthContext';

/**
 * Custom hook for making API calls with proper base URL and authentication
 */
export const useApi = () => {
  const { token } = useAuth();

  // Get API base URL from environment with fallback
  const API_BASE = import.meta.env.VITE_API_URL;

  // Debug log to verify environment variable
  console.log('useApi - Environment Debug:', {
    'import.meta.env.VITE_API_URL': import.meta.env.VITE_API_URL,
    'API_BASE': API_BASE,
    'All env vars': import.meta.env
  });

  /**
   * Make an authenticated API call
   * @param {string} endpoint - API endpoint (e.g., '/promoters', '/auth/profile')
   * @param {object} options - Fetch options (method, body, headers, etc.)
   * @returns {Promise<Response>} Fetch response
   */
  const apiCall = async (endpoint, options = {}) => {
    // Ensure endpoint starts with /
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${API_BASE}${cleanEndpoint}`;

    console.log('API Call:', { endpoint: cleanEndpoint, url, API_BASE });

    // Default headers
    const defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    // Add authorization header if token exists
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    // Add CSRF token if available
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    if (csrfToken) {
      defaultHeaders['X-CSRF-TOKEN'] = csrfToken;
    }

    // Merge headers
    const headers = {
      ...defaultHeaders,
      ...options.headers,
    };

    console.log('API Call Headers:', headers);

    // Make the API call
    const response = await fetch(url, {
      ...options,
      headers,
    });

    console.log('API Response:', { status: response.status, statusText: response.statusText, url });

    return response;
  };

  /**
   * Make an authenticated API call and return JSON data
   * @param {string} endpoint - API endpoint
   * @param {object} options - Fetch options
   * @returns {Promise<object>} JSON response data
   */
  const apiCallJson = async (endpoint, options = {}) => {
    const response = await apiCall(endpoint, options);
    return response.json();
  };

  return {
    apiCall,
    apiCallJson,
    API_BASE,
  };
};
