import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Shield,
  Key,
  Eye,
  EyeOff,
  Grid3X3,
  List,
  Save,
  ArrowLeft,
  AlertCircle,
  MapPin,
  X
} from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { formatTableValue, formatStatus, formatDisplayValue, toSentenceCase } from "@/utils/textUtils";
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Label } from '../ui/Label';
import { Checkbox } from '../ui/checkbox';
import { useAuth } from '../../contexts/AuthContext';
import { useToast, ToastContainer } from '../ui/toast';

function UserManagement() {
  const { user: currentUser, isViewer, canEdit, canCreate, canDelete, canManageRolesAndPermissions } = useAuth();
  const { toasts, removeToast, showSuccess, showError, showInfo } = useToast();

  // View state - 'grid', 'list', 'create', 'edit'
  const [viewMode, setViewMode] = useState('grid');

  // Data state
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [availableStates, setAvailableStates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    status: 'active',
    roles: []
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Filters and search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');

  // Dialog states (only for delete, role management, permission management)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  const [showStateDialog, setShowStateDialog] = useState(false);
  const [roleAssignments, setRoleAssignments] = useState([]);
  const [permissionAssignments, setPermissionAssignments] = useState([]);
  const [stateAssignments, setStateAssignments] = useState([]);

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    suspended: 0
  });

  useEffect(() => {
    fetchUsers();
    fetchRoles();
    fetchPermissions();
    fetchAvailableStates();
  }, []);

  // Debug function to test authentication
  const testAuthentication = async () => {
    const token = localStorage.getItem('auth_token');
    console.log('Auth token exists:', !!token);
    console.log('Token preview:', token ? token.substring(0, 20) + '...' : 'No token');

    try {
      const response = await fetch('/api/user', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
        }
      });

      console.log('Auth test response status:', response.status);
      if (response.ok) {
        const user = await response.json();
        console.log('Authenticated user:', user);
      } else {
        console.log('Auth failed:', await response.text());
      }
    } catch (error) {
      console.error('Auth test error:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('API response:', data); // Debug log

        if (data.success && data.users) {
          // Fetch states for each user
          const usersWithStates = await Promise.all(
            data.users.map(async (user) => {
              try {
                const stateResponse = await fetch(`/api/user-states/${user.id}`, {
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
                  }
                });

                if (stateResponse.ok) {
                  const stateData = await stateResponse.json();
                  return {
                    ...user,
                    states: stateData.success ? stateData.states : []
                  };
                }
              } catch (error) {
                console.error(`Error fetching states for user ${user.id}:`, error);
              }

              return { ...user, states: [] };
            })
          );

          setUsers(usersWithStates);

          // Calculate stats
          const total = data.users.length;
          const active = data.users.filter(user => user.status === 'active').length;
          const inactive = data.users.filter(user => user.status === 'inactive').length;
          const suspended = data.users.filter(user => user.status === 'suspended').length;

          setStats({
            total,
            active,
            inactive,
            suspended
          });
        } else {
          console.error('No users found in response');
          setUsers([]);
          setStats({
            total: 0,
            active: 0,
            inactive: 0,
            suspended: 0
          });
        }
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/roles', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Roles API response:', data); // Debug log

        // Handle different response formats
        if (data.success && data.data) {
          setRoles(data.data);
        } else if (data.roles) {
          setRoles(data.roles);
        } else if (Array.isArray(data)) {
          setRoles(data);
        } else {
          console.error('No roles found in response');
          setRoles([]);
        }
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  const fetchPermissions = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/permissions', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Permissions API response:', data); // Debug log

        // Handle different response formats
        if (data.success && data.data) {
          setPermissions(data.data);
        } else if (data.permissions) {
          setPermissions(data.permissions);
        } else if (Array.isArray(data)) {
          setPermissions(data);
        } else {
          console.error('No permissions found in response');
          setPermissions([]);
        }
      }
    } catch (error) {
      console.error('Error fetching permissions:', error);
    }
  };

  const fetchAvailableStates = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/user-states/available-states', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.states) {
          setAvailableStates(data.states);
        } else {
          console.error('No states found in response');
          setAvailableStates([]);
        }
      }
    } catch (error) {
      console.error('Error fetching available states:', error);
      setAvailableStates([]);
    }
  };

  const handleCreateUser = () => {
    resetForm();
    setViewMode('create');
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      password_confirmation: '',
      status: user.status || 'active',
      roles: user.roles?.map(r => r.id) || []
    });
    setViewMode('edit');
  };

  const handleBackToList = () => {
    setViewMode('grid');
    resetForm();
    setSelectedUser(null);
  };

  const handleSubmitUser = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      const token = localStorage.getItem('auth_token');
      const url = selectedUser ? `/api/users/${selectedUser.id}` : '/api/users';
      const method = selectedUser ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        await fetchUsers();
        handleBackToList();
        showSuccess(selectedUser ? 'User updated successfully!' : 'User created successfully!');
      } else {
        if (data.errors) {
          setErrors(data.errors);
        } else {
          setErrors({ general: data.message || 'An error occurred' });
          showError(data.message || 'Failed to save user');
        }
      }
    } catch (error) {
      console.error('Error saving user:', error);
      setErrors({ general: 'Network error occurred' });
      showError('Network error occurred while saving user');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = (user) => {
    setSelectedUser(user);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedUser) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/users/${selectedUser.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
        }
      });

      if (response.ok) {
        await fetchUsers();
        setShowDeleteDialog(false);
        setSelectedUser(null);
        showSuccess('User deleted successfully!');
      } else {
        const data = await response.json();
        showError(data.message || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      showError('Error occurred while deleting user');
    } finally {
      setLoading(false);
    }
  };

  const handleManageRoles = (user) => {
    setSelectedUser(user);
    setRoleAssignments(user.roles?.map(r => r.id) || []);
    setShowRoleDialog(true);
  };

  const handleUpdateRoles = async () => {
    if (!selectedUser) return;

    console.log('Starting role update for user:', selectedUser.id, 'with roles:', roleAssignments);

    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');

      console.log('Making API request to:', `/api/users/${selectedUser.id}/assign-roles`);
      console.log('Request body:', { roles: roleAssignments });

      const response = await fetch(`/api/users/${selectedUser.id}/assign-roles`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
        },
        body: JSON.stringify({ roles: roleAssignments })
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (response.ok) {
        const result = await response.json();
        console.log('Roles updated successfully:', result);

        console.log('Fetching updated users...');
        await fetchUsers();
        console.log('Users refetched successfully');

        setShowRoleDialog(false);
        setSelectedUser(null);
        showSuccess('User roles updated successfully!');
      } else {
        const error = await response.json();
        console.error('Error updating roles:', error);
        showError('Failed to update roles: ' + (error.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error updating roles:', error);
      showError('Failed to update roles: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleManagePermissions = (user) => {
    setSelectedUser(user);
    setPermissionAssignments(user.permissions?.map(p => p.id) || []);
    setShowPermissionDialog(true);
  };

  const handleUpdatePermissions = async () => {
    if (!selectedUser) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/users/${selectedUser.id}/assign-permissions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
        },
        body: JSON.stringify({ permissions: permissionAssignments })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Permissions updated successfully:', result);
        await fetchUsers();
        setShowPermissionDialog(false);
        setSelectedUser(null);
        showSuccess('User permissions updated successfully!');
      } else {
        const error = await response.json();
        console.error('Error updating permissions:', error);
        showError('Failed to update permissions: ' + (error.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error updating permissions:', error);
      showError('Failed to update permissions: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleManageStates = async (user) => {
    setSelectedUser(user);

    // Fetch user's current state assignments
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/user-states/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setStateAssignments(data.states || []);
        } else {
          setStateAssignments([]);
        }
      } else {
        setStateAssignments([]);
      }
    } catch (error) {
      console.error('Error fetching user states:', error);
      setStateAssignments([]);
    }

    setShowStateDialog(true);
  };

  const handleUpdateStates = async () => {
    if (!selectedUser) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/user-states/${selectedUser.id}/assign`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
        },
        body: JSON.stringify({ states: stateAssignments })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('States updated successfully:', result);
        await fetchUsers();
        setShowStateDialog(false);
        setSelectedUser(null);
        showSuccess('User states updated successfully!');
      } else {
        const error = await response.json();
        console.error('Error updating states:', error);
        showError(`Error updating states: ${error.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating states:', error);
      showError('Error updating states');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveUserState = async (state) => {
    if (!selectedUser || !confirm(`Are you sure you want to remove access to ${state} for this user?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/user-states/${selectedUser.id}/remove`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
        },
        body: JSON.stringify({ state })
      });

      if (response.ok) {
        // Update local state assignments
        setStateAssignments(stateAssignments.filter(s => s !== state));
        await fetchUsers();
        showSuccess(`Access to ${state} removed successfully!`);
      } else {
        const error = await response.json();
        showError(`Error removing state: ${error.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error removing state:', error);
      showError('Error removing state');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      password_confirmation: '',
      status: 'active',
      roles: []
    });
    setErrors({});
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setRoleFilter('all');
  };

  // Filter users based on search and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    const matchesRole = roleFilter === 'all' || user.roles?.some(role => role.id.toString() === roleFilter);

    return matchesSearch && matchesStatus && matchesRole;
  });

  const getStatusBadge = (status) => {
    const variants = {
      active: 'bg-green-100 text-green-800 border-green-200',
      inactive: 'bg-gray-100 text-gray-800 border-gray-200',
      suspended: 'bg-red-100 text-red-800 border-red-200'
    };

    return (
      <Badge className={`${variants[status] || variants.inactive} border`}>
        {formatStatus(status) || 'Unknown'}
      </Badge>
    );
  };

  const formatLastLogin = (lastLogin) => {
    if (!lastLogin) return 'Never';
    return new Date(lastLogin).toLocaleDateString();
  };

  // Render the create user page
  const renderCreatePage = () => {
    // Redirect viewers back to main list since they can't create users
    if (isViewer()) {
      return renderMainView();
    }

    return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToList}
                className="p-2"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Create New User</h2>
                <p className="text-sm text-gray-500">Add a new user to the system with roles and permissions</p>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmitUser} className="p-6">
          {errors.general && (
            <div className="mb-6 p-4 text-sm text-red-800 bg-red-50 rounded-md border border-red-200">
              {errors.general}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="create-name">Full Name *</Label>
                <Input
                  id="create-name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Enter full name"
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="create-email">Email Address *</Label>
                <Input
                  id="create-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="Enter email address"
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="create-password">Password *</Label>
                <div className="relative">
                  <Input
                    id="create-password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    placeholder="Enter password"
                    className={errors.password ? 'border-red-500 pr-10' : 'pr-10'}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {errors.password && <p className="text-sm text-red-600">{errors.password}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="create-password-confirm">Confirm Password *</Label>
                <div className="relative">
                  <Input
                    id="create-password-confirm"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.password_confirmation}
                    onChange={(e) => setFormData({...formData, password_confirmation: e.target.value})}
                    placeholder="Confirm password"
                    className={errors.password_confirmation ? 'border-red-500 pr-10' : 'pr-10'}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {errors.password_confirmation && <p className="text-sm text-red-600">{errors.password_confirmation}</p>}
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="create-status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({...formData, status: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {canManageRolesAndPermissions() && (
                <div className="space-y-3">
                  <Label>Assign Roles (Optional)</Label>
                  <div className="space-y-3 max-h-64 overflow-y-auto border rounded-md p-4">
                    {roles.map((role) => (
                      <div key={role.id} className="flex items-start space-x-3">
                        <input
                          type="checkbox"
                          id={`create-role-${role.id}`}
                          checked={formData.roles.includes(role.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({...formData, roles: [...formData.roles, role.id]});
                            } else {
                              setFormData({...formData, roles: formData.roles.filter(r => r !== role.id)});
                            }
                          }}
                          className="mt-1 rounded border-gray-300"
                        />
                        <div className="flex-1">
                          <Label htmlFor={`create-role-${role.id}`} className="text-sm font-medium">
                            {role.display_name}
                          </Label>
                          {role.description && (
                            <p className="text-xs text-gray-500 mt-1">{role.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={handleBackToList}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Create User
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
    );
  };

  // Render the edit user page
  const renderEditPage = () => {
    // Redirect viewers back to main list since they can't edit users
    if (isViewer()) {
      return renderMainView();
    }

    return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToList}
                className="p-2"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Edit User</h2>
                <p className="text-sm text-gray-500">Update user information and settings</p>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmitUser} className="p-6">
          {errors.general && (
            <div className="mb-6 p-4 text-sm text-red-800 bg-red-50 rounded-md border border-red-200">
              {errors.general}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Full Name *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Enter full name"
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-email">Email Address *</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="Enter email address"
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-password">New Password (Optional)</Label>
                <div className="relative">
                  <Input
                    id="edit-password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    placeholder="Leave blank to keep current password"
                    className={errors.password ? 'border-red-500 pr-10' : 'pr-10'}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {errors.password && <p className="text-sm text-red-600">{errors.password}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-password-confirm">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="edit-password-confirm"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.password_confirmation}
                    onChange={(e) => setFormData({...formData, password_confirmation: e.target.value})}
                    placeholder="Confirm new password"
                    className={errors.password_confirmation ? 'border-red-500 pr-10' : 'pr-10'}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {errors.password_confirmation && <p className="text-sm text-red-600">{errors.password_confirmation}</p>}
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({...formData, status: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {canManageRolesAndPermissions() && (
                <div className="space-y-3">
                  <Label>Assign Roles</Label>
                  <div className="space-y-3 max-h-64 overflow-y-auto border rounded-md p-4">
                    {roles.map((role) => (
                      <div key={role.id} className="flex items-start space-x-3">
                        <input
                          type="checkbox"
                          id={`edit-role-${role.id}`}
                          checked={formData.roles.includes(role.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({...formData, roles: [...formData.roles, role.id]});
                            } else {
                              setFormData({...formData, roles: formData.roles.filter(r => r !== role.id)});
                            }
                          }}
                          className="mt-1 rounded border-gray-300"
                        />
                        <div className="flex-1">
                          <Label htmlFor={`edit-role-${role.id}`} className="text-sm font-medium">
                            {role.display_name}
                          </Label>
                          {role.description && (
                            <p className="text-xs text-gray-500 mt-1">{role.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={handleBackToList}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Updating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Update User
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
    );
  };

  // Render the main grid/list view
  const renderMainView = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600">
            {isViewer() ? 'View users, roles, and permissions' : 'Manage users, roles, and permissions'}
          </p>
        </div>
        <div className="flex gap-2">
          {/* Debug button - remove this in production */}
          <Button onClick={testAuthentication} variant="outline" className="text-xs">
            Test Auth
          </Button>
          {canCreate() && (
            <Button onClick={handleCreateUser} className="bg-blue-600 hover:bg-blue-700">
              <UserPlus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <div className="h-2 w-2 bg-green-500 rounded-full"></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive</CardTitle>
            <div className="h-2 w-2 bg-gray-500 rounded-full"></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{stats.inactive}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suspended</CardTitle>
            <div className="h-2 w-2 bg-red-500 rounded-full"></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.suspended}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search Users</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status-filter">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role-filter">Role</Label>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id.toString()}>
                      {role.display_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={clearFilters}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* View Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid3X3 className="h-4 w-4 mr-1" />
            Grid
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4 mr-1" />
            List
          </Button>
        </div>
        <div className="text-sm text-gray-500">
          {filteredUsers.length} of {users.length} users
        </div>
      </div>

      {/* Users Display */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredUsers.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
            <p className="text-gray-500 mb-4">
              {users.length === 0
                ? "No users have been created yet. Get started by adding your first user."
                : "No users match your current filters. Try adjusting your search or filter criteria."
              }
            </p>
            {users.length === 0 && (
              <Button onClick={handleCreateUser} className="bg-blue-600 hover:bg-blue-700">
                <UserPlus className="h-4 w-4 mr-2" />
                Add First User
              </Button>
            )}
          </CardContent>
        </Card>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUsers.map((user) => (
            <Card key={user.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-medium">{user.name}</CardTitle>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  {!isViewer() && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {canEdit() && (
                          <DropdownMenuItem onClick={() => handleEditUser(user)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                        )}
                        {canEdit() && (
                          <DropdownMenuItem onClick={() => handleManageRoles(user)}>
                            <Shield className="mr-2 h-4 w-4" />
                            Manage Roles
                          </DropdownMenuItem>
                        )}
                        {canEdit() && (
                          <DropdownMenuItem onClick={() => handleManagePermissions(user)}>
                            <Key className="mr-2 h-4 w-4" />
                            Manage Permissions
                          </DropdownMenuItem>
                        )}
                        {canEdit() && (
                          <DropdownMenuItem onClick={() => handleManageStates(user)}>
                            <MapPin className="mr-2 h-4 w-4" />
                            Manage States
                          </DropdownMenuItem>
                        )}
                        {canDelete() && (
                          <DropdownMenuItem
                            onClick={() => handleDeleteUser(user)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Status</span>
                    {getStatusBadge(user.status)}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Last Login</span>
                    <span className="text-xs">{formatLastLogin(user.last_login_at)}</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Roles</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {user.roles?.slice(0, 2).map((role) => (
                        <Badge key={role.id} variant="outline" className="text-xs">
                          {role.display_name}
                        </Badge>
                      ))}
                      {user.roles?.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{user.roles.length - 2} more
                        </Badge>
                      )}
                    </div>
                  </div>
                  {user.states && user.states.length > 0 && (
                    <div>
                      <span className="text-xs text-gray-500">States</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {user.states.slice(0, 2).map((state) => (
                          <Badge key={state} variant="secondary" className="text-xs">
                            {state}
                          </Badge>
                        ))}
                        {user.states.length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{user.states.length - 2} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Status</TableHead>
                {canManageRolesAndPermissions() && <TableHead>Roles</TableHead>}
                <TableHead>States</TableHead>
                <TableHead>Last Login</TableHead>
                {!isViewer() && <TableHead>Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={
                    (isViewer() ? 4 : 5) + (canManageRolesAndPermissions() ? 1 : 0)
                  } className="text-center py-12">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                    <p className="text-gray-500 mb-4">
                      {users.length === 0
                        ? "No users have been created yet. Get started by adding your first user."
                        : "No users match your current filters. Try adjusting your search or filter criteria."
                      }
                    </p>
                    {users.length === 0 && (
                      <Button onClick={handleCreateUser} className="bg-blue-600 hover:bg-blue-700">
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add First User
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium sentence-case">{formatDisplayValue(user.name)}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(user.status)}</TableCell>
                  {canManageRolesAndPermissions() && (
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {user.roles?.slice(0, 2).map((role) => (
                          <Badge key={role.id} variant="outline" className="text-xs sentence-case">
                            {formatDisplayValue(role.display_name)}
                          </Badge>
                        ))}
                        {user.roles?.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{user.roles.length - 2} more
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                  )}
                  <TableCell>
                    {user.states && user.states.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {user.states.slice(0, 2).map((state) => (
                          <Badge key={state} variant="secondary" className="text-xs">
                            {state}
                          </Badge>
                        ))}
                        {user.states.length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{user.states.length - 2} more
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-500">No states</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">{formatLastLogin(user.last_login_at)}</TableCell>
                  {!isViewer() && (
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {canEdit() && (
                            <DropdownMenuItem onClick={() => handleEditUser(user)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                          )}
                          {canEdit() && (
                            <DropdownMenuItem onClick={() => handleManageRoles(user)}>
                              <Shield className="mr-2 h-4 w-4" />
                              Manage Roles
                            </DropdownMenuItem>
                          )}
                          {canEdit() && (
                            <DropdownMenuItem onClick={() => handleManagePermissions(user)}>
                              <Key className="mr-2 h-4 w-4" />
                              Manage Permissions
                            </DropdownMenuItem>
                          )}
                          {canDelete() && (
                            <DropdownMenuItem
                              onClick={() => handleDeleteUser(user)}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );

  // Main render based on view mode
  return (
    <div className="container mx-auto px-4 py-6">
      {viewMode === 'create' && renderCreatePage()}
      {viewMode === 'edit' && renderEditPage()}
      {(viewMode === 'grid' || viewMode === 'list') && renderMainView()}

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-md bg-white border border-gray-200 shadow-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="h-5 w-5" />
              Delete User
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <span className="font-medium">{selectedUser?.name}</span>?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete User
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manage Roles Dialog */}
      <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
        <DialogContent className="max-w-md bg-white border border-gray-200 shadow-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Manage Roles: {selectedUser?.name}
            </DialogTitle>
            <DialogDescription>
              Assign or remove roles for this user. Roles define what actions the user can perform.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {roles.map((role) => (
                <div key={role.id} className="flex items-center space-x-3 p-3 border rounded-md">
                  <Checkbox
                    id={`role-${role.id}`}
                    checked={roleAssignments.includes(role.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setRoleAssignments([...roleAssignments, role.id]);
                      } else {
                        setRoleAssignments(roleAssignments.filter(r => r !== role.id));
                      }
                    }}
                  />
                  <div className="flex-1">
                    <Label htmlFor={`role-${role.id}`} className="font-medium">
                      {role.display_name}
                    </Label>
                    {role.description && (
                      <p className="text-sm text-gray-500">{role.description}</p>
                    )}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {role.permissions?.slice(0, 3).map((permission) => (
                        <Badge key={permission.id} variant="outline" className="text-xs">
                          {permission.display_name}
                        </Badge>
                      ))}
                      {role.permissions?.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{role.permissions.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRoleDialog(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateRoles}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Updating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Update Roles
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manage Permissions Dialog */}
      <Dialog open={showPermissionDialog} onOpenChange={setShowPermissionDialog}>
        <DialogContent className="max-w-lg bg-white border border-gray-200 shadow-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Manage Permissions: {selectedUser?.name}
            </DialogTitle>
            <DialogDescription>
              Assign specific permissions to this user. Note: Users also inherit permissions from their roles.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <p className="text-sm text-amber-800">
                  Direct permissions override role-based permissions. Use with caution.
                </p>
              </div>
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto">
              {Object.entries(
                permissions.reduce((groups, permission) => {
                  const module = permission.module || 'Other';
                  if (!groups[module]) groups[module] = [];
                  groups[module].push(permission);
                  return groups;
                }, {})
              ).map(([module, modulePermissions]) => (
                <div key={module} className="space-y-2">
                  <h4 className="font-medium text-sm text-gray-500 uppercase tracking-wide">
                    {module}
                  </h4>
                  <div className="space-y-2 pl-2 border-l-2 border-gray-200">
                    {modulePermissions.map((permission) => (
                      <div key={permission.id} className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id={`permission-${permission.id}`}
                          checked={permissionAssignments.includes(permission.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setPermissionAssignments([...permissionAssignments, permission.id]);
                            } else {
                              setPermissionAssignments(permissionAssignments.filter(p => p !== permission.id));
                            }
                          }}
                          className="rounded border-gray-300"
                        />
                        <Label htmlFor={`permission-${permission.id}`} className="text-sm">
                          {permission.display_name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowPermissionDialog(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdatePermissions}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Updating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Update Permissions
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* State Assignment Dialog */}
      <Dialog open={showStateDialog} onOpenChange={setShowStateDialog}>
        <DialogContent className="max-w-md bg-white border border-gray-200 shadow-xl">
          <DialogHeader>
            <DialogTitle>
              Manage States for {selectedUser?.name}
            </DialogTitle>
            <DialogDescription>
              Select which states this user can access data for.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Current States */}
            {stateAssignments.length > 0 && (
              <div>
                <label className="text-sm font-medium mb-2 block">Currently Assigned:</label>
                <div className="flex flex-wrap gap-1">
                  {stateAssignments.map((state) => (
                    <Badge key={state} variant="default" className="text-xs">
                      {state}
                      <button
                        onClick={() => handleRemoveUserState(state)}
                        disabled={loading}
                        className="ml-1 hover:bg-white/20 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Available States */}
            <div>
              <label className="text-sm font-medium mb-2 block">Available States:</label>
              <div className="max-h-40 overflow-y-auto space-y-2">
                {availableStates
                  .filter(state => !stateAssignments.includes(state))
                  .map((state) => (
                    <div key={state} className="flex items-center space-x-2">
                      <Checkbox
                        id={`state-${state}`}
                        checked={false}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setStateAssignments([...stateAssignments, state]);
                          }
                        }}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor={`state-${state}`} className="text-sm">
                        {state}
                      </Label>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowStateDialog(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateStates}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Updating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Update States
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
    </div>
  );
}

export default UserManagement;
