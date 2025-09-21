import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Shield, Users, Key, Check, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { useAuth } from '../../contexts/AuthContext';
import { formatDisplayValue } from '../../utils/textUtils';

const RoleManagement = () => {
  const { canManageRolesAndPermissions } = useAuth();

  // Check if user has permission to manage roles
  if (!canManageRolesAndPermissions()) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <Shield className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
              <p className="text-gray-500">
                You don't have permission to manage roles. Only Super Admins and Admins can access this page.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    display_name: '',
    description: '',
    is_active: true,
    permissions: []
  });

  // Mock data for demonstration
  useEffect(() => {
    // Simulate API calls
    setTimeout(() => {
      setRoles([
        {
          id: 1,
          name: 'super_admin',
          display_name: 'Super Administrator',
          description: 'Full system access with all permissions',
          is_active: true,
          permissions_count: 28,
          users_count: 1,
          permissions: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
          created_at: '2024-01-01T00:00:00Z'
        },
        {
          id: 2,
          name: 'admin',
          display_name: 'Administrator',
          description: 'Administrative access with most permissions',
          is_active: true,
          permissions_count: 22,
          users_count: 3,
          permissions: [1, 2, 3, 5, 6, 7, 9, 10],
          created_at: '2024-01-02T00:00:00Z'
        },
        {
          id: 3,
          name: 'moderator',
          display_name: 'Moderator',
          description: 'Content moderation and limited administrative access',
          is_active: true,
          permissions_count: 12,
          users_count: 5,
          permissions: [1, 2, 5, 6, 9],
          created_at: '2024-01-03T00:00:00Z'
        },
        {
          id: 4,
          name: 'user',
          display_name: 'Regular User',
          description: 'Basic user access with limited permissions',
          is_active: true,
          permissions_count: 5,
          users_count: 25,
          permissions: [1, 5],
          created_at: '2024-01-04T00:00:00Z'
        }
      ]);

      setPermissions({
        users: [
          { id: 1, name: 'users.view', display_name: 'View Users' },
          { id: 2, name: 'users.create', display_name: 'Create Users' },
          { id: 3, name: 'users.edit', display_name: 'Edit Users' },
          { id: 4, name: 'users.delete', display_name: 'Delete Users' }
        ],
        roles: [
          { id: 5, name: 'roles.view', display_name: 'View Roles' },
          { id: 6, name: 'roles.create', display_name: 'Create Roles' },
          { id: 7, name: 'roles.edit', display_name: 'Edit Roles' },
          { id: 8, name: 'roles.delete', display_name: 'Delete Roles' }
        ],
        dashboard: [
          { id: 9, name: 'dashboard.view', display_name: 'View Dashboard' }
        ],
        analytics: [
          { id: 10, name: 'analytics.view', display_name: 'View Analytics' }
        ]
      });

      setLoading(false);
    }, 1000);
  }, []);

  const filteredRoles = roles.filter(role =>
    role.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateRole = () => {
    setFormData({
      name: '',
      display_name: '',
      description: '',
      is_active: true,
      permissions: []
    });
    setShowCreateModal(true);
  };

  const handleEditRole = (role) => {
    setSelectedRole(role);
    setFormData({
      name: role.name,
      display_name: role.display_name,
      description: role.description,
      is_active: role.is_active,
      permissions: role.permissions || []
    });
    setShowEditModal(true);
  };

  const handleDeleteRole = (roleId) => {
    if (window.confirm('Are you sure you want to delete this role?')) {
      setRoles(roles.filter(role => role.id !== roleId));
    }
  };

  const handlePermissionToggle = (permissionId) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(id => id !== permissionId)
        : [...prev.permissions, permissionId]
    }));
  };

  const handleSubmit = (isEdit = false) => {
    // Here you would make API call to create/update role
    console.log('Submitting role:', formData);

    if (isEdit) {
      setRoles(roles.map(role =>
        role.id === selectedRole.id
          ? { ...role, ...formData, permissions_count: formData.permissions.length }
          : role
      ));
      setShowEditModal(false);
    } else {
      const newRole = {
        id: Date.now(),
        ...formData,
        permissions_count: formData.permissions.length,
        users_count: 0,
        created_at: new Date().toISOString()
      };
      setRoles([...roles, newRole]);
      setShowCreateModal(false);
    }
  };

  const getRoleBadgeVariant = (role) => {
    if (role.name === 'super_admin') return 'destructive';
    if (role.name === 'admin') return 'secondary';
    if (role.name === 'moderator') return 'outline';
    return 'default';
  };

  const Modal = ({ show, onClose, title, children }) => {
    if (!show) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">{title}</h2>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading roles...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Role Management</h1>
          <p className="text-muted-foreground">
            Manage system roles and their associated permissions.
          </p>
        </div>
        <Button onClick={handleCreateRole} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Role
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search roles by name, display name, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Roles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRoles.map((role) => (
          <Card key={role.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Badge variant={getRoleBadgeVariant(role)} className="sentence-case">
                  {formatDisplayValue(role.display_name)}
                </Badge>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditRole(role)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  {role.name !== 'super_admin' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteRole(role.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
              <CardTitle className="text-lg sentence-case">{formatDisplayValue(role.name)}</CardTitle>
              <CardDescription className="text-sm sentence-case">
                {formatDisplayValue(role.description)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Key className="h-4 w-4 text-gray-500" />
                    <span>Permissions</span>
                  </div>
                  <span className="font-medium">{role.permissions_count}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span>Users</span>
                  </div>
                  <span className="font-medium">{role.users_count}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-gray-500" />
                    <span>Status</span>
                  </div>
                  <Badge variant={role.is_active ? 'default' : 'outline'}>
                    {role.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Role Modal */}
      <Modal
        show={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Role"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Role Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., editor"
              />
            </div>
            <div>
              <Label htmlFor="display_name">Display Name</Label>
              <Input
                id="display_name"
                value={formData.display_name}
                onChange={(e) => setFormData(prev => ({ ...prev, display_name: e.target.value }))}
                placeholder="e.g., Content Editor"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Role description..."
            />
          </div>

          <div>
            <Label className="text-base font-medium">Permissions</Label>
            <div className="mt-3 space-y-4">
              {Object.entries(permissions).map(([module, modulePermissions]) => (
                <div key={module} className="border rounded-lg p-4">
                  <h4 className="font-medium text-sm uppercase tracking-wide text-gray-700 mb-3">
                    {module}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {modulePermissions.map((permission) => (
                      <label key={permission.id} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.permissions.includes(permission.id)}
                          onChange={() => handlePermissionToggle(permission.id)}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm">{permission.display_name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button onClick={() => handleSubmit(false)}>
              Create Role
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Role Modal */}
      <Modal
        show={showEditModal}
        onClose={() => setShowEditModal(false)}
        title={`Edit Role: ${selectedRole?.display_name}`}
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit_name">Role Name</Label>
              <Input
                id="edit_name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                disabled={selectedRole?.name === 'super_admin'}
              />
            </div>
            <div>
              <Label htmlFor="edit_display_name">Display Name</Label>
              <Input
                id="edit_display_name"
                value={formData.display_name}
                onChange={(e) => setFormData(prev => ({ ...prev, display_name: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="edit_description">Description</Label>
            <Input
              id="edit_description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>

          <div>
            <Label className="text-base font-medium">Permissions</Label>
            <div className="mt-3 space-y-4">
              {Object.entries(permissions).map(([module, modulePermissions]) => (
                <div key={module} className="border rounded-lg p-4">
                  <h4 className="font-medium text-sm uppercase tracking-wide text-gray-700 mb-3">
                    {module}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {modulePermissions.map((permission) => (
                      <label key={permission.id} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.permissions.includes(permission.id)}
                          onChange={() => handlePermissionToggle(permission.id)}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm">{permission.display_name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button onClick={() => handleSubmit(true)}>
              Update Role
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default RoleManagement;
