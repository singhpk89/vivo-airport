// ACL Service - Handles all role and permission related API calls
class ACLService {
  constructor() {
    this.baseURL = '/api';
    this.token = localStorage.getItem('auth_token') || '';
  }

  // Helper function to get CSRF token from cookies
  getCSRFToken() {
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
    return null;
  }

  // Helper method for making API requests
  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;

    // Get CSRF token
    const csrfToken = this.getCSRFToken();

    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(this.token && { 'Authorization': `Bearer ${this.token}` }),
      ...(csrfToken && { 'X-XSRF-TOKEN': csrfToken }),
      ...options.headers,
    };

    const config = {
      headers,
      credentials: 'include', // Important for cookies with Sanctum
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Role Management
  async getRoles() {
    return this.makeRequest('/roles');
  }

  async getRole(id) {
    return this.makeRequest(`/roles/${id}`);
  }

  async createRole(roleData) {
    return this.makeRequest('/roles', {
      method: 'POST',
      body: JSON.stringify(roleData),
    });
  }

  async updateRole(id, roleData) {
    return this.makeRequest(`/roles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(roleData),
    });
  }

  async deleteRole(id) {
    return this.makeRequest(`/roles/${id}`, {
      method: 'DELETE',
    });
  }

  async getRolePermissions() {
    return this.makeRequest('/roles-permissions');
  }

  // Permission Management
  async getPermissions() {
    return this.makeRequest('/permissions');
  }

  async getPermission(id) {
    return this.makeRequest(`/permissions/${id}`);
  }

  async createPermission(permissionData) {
    return this.makeRequest('/permissions', {
      method: 'POST',
      body: JSON.stringify(permissionData),
    });
  }

  async updatePermission(id, permissionData) {
    return this.makeRequest(`/permissions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(permissionData),
    });
  }

  async deletePermission(id) {
    return this.makeRequest(`/permissions/${id}`, {
      method: 'DELETE',
    });
  }

  async getPermissionsByModule() {
    return this.makeRequest('/permissions-by-module');
  }

  // User Role Assignment
  async getUsersWithRoles() {
    return this.makeRequest('/users/with-roles');
  }

  async assignRolesToUser(userId, roles) {
    return this.makeRequest(`/users/${userId}/assign-roles`, {
      method: 'POST',
      body: JSON.stringify({ roles }),
    });
  }

  async assignPermissionsToUser(userId, permissions) {
    return this.makeRequest(`/users/${userId}/assign-permissions`, {
      method: 'POST',
      body: JSON.stringify({ permissions }),
    });
  }

  async removeRoleFromUser(userId, roleId) {
    return this.makeRequest(`/users/${userId}/remove-role`, {
      method: 'DELETE',
      body: JSON.stringify({ role_id: roleId }),
    });
  }

  async removePermissionFromUser(userId, permissionId) {
    return this.makeRequest(`/users/${userId}/remove-permission`, {
      method: 'DELETE',
      body: JSON.stringify({ permission_id: permissionId }),
    });
  }

  async getUserPermissions(userId) {
    return this.makeRequest(`/users/${userId}/permissions`);
  }

  async checkUserPermission(userId, permission) {
    return this.makeRequest(`/users/${userId}/check-permission`, {
      method: 'POST',
      body: JSON.stringify({ permission }),
    });
  }

  // Utility methods
  setAuthToken(token) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  clearAuthToken() {
    this.token = '';
    localStorage.removeItem('auth_token');
  }
}

// Create and export a singleton instance
const aclService = new ACLService();
export default aclService;
