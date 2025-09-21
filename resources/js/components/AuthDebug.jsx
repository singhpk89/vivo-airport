import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const AuthDebug = () => {
  const { isAuthenticated, loading, user, token } = useAuth();

  const clearToken = () => {
    localStorage.removeItem('auth_token');
    window.location.reload();
  };

  return (
    <div className="fixed top-4 right-4 bg-black text-white p-4 rounded text-xs z-50">
      <h3 className="font-bold mb-2">Auth Debug</h3>
      <p>Loading: {loading ? 'true' : 'false'}</p>
      <p>Authenticated: {isAuthenticated ? 'true' : 'false'}</p>
      <p>Token: {localStorage.getItem('auth_token') ? 'exists' : 'none'}</p>
      <p>User: {user ? user.name : 'none'}</p>
      <button
        onClick={clearToken}
        className="mt-2 bg-red-600 text-white px-2 py-1 rounded text-xs"
      >
        Clear Token
      </button>
    </div>
  );
};

export default AuthDebug;
