import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Shield, Key, Tag } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { useAuth } from '../../contexts/AuthContext';

const PermissionManagement = () => {
  const { canManageRolesAndPermissions } = useAuth();

  // Check if user has permission to manage permissions
  if (!canManageRolesAndPermissions()) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <Key className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
              <p className="text-gray-500">
                You don't have permission to manage permissions. Only Super Admins and Admins can access this page.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const [permissions, setPermissions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModule, setSelectedModule] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    display_name: '',
    description: '',
    module: '',
    is_active: true
  });

  const modules = [
    'users', 'roles', 'permissions', 'dashboard', 'analytics',
    'orders', 'products', 'reports', 'settings', 'logs'
  ];

  // Mock data for demonstration
  useEffect(() => {
    setTimeout(() => {
      setPermissions([
        {
          id: 1,
          name: 'users.view',
          display_name: 'View Users',
          description: 'Can view user listings',
          module: 'users',
          is_active: true,
          roles_count: 4,
          roles: [
            { id: 1, name: 'super_admin', display_name: 'Super Administrator' },
            { id: 2, name: 'admin', display_name: 'Administrator' },
            { id: 3, name: 'moderator', display_name: 'Moderator' }
          ],
          created_at: '2024-01-01T00:00:00Z'
        },
        {
          id: 2,
          name: 'users.create',
          display_name: 'Create Users',
          description: 'Can create new users',
          module: 'users',
          is_active: true,
          roles_count: 2,
          roles: [
            { id: 1, name: 'super_admin', display_name: 'Super Administrator' },
            { id: 2, name: 'admin', display_name: 'Administrator' }
          ],
          created_at: '2024-01-01T00:00:00Z'
        },
        {
          id: 3,
          name: 'users.edit',
          display_name: 'Edit Users',
          description: 'Can edit user information',
          module: 'users',
          is_active: true,
          roles_count: 3,
          roles: [
            { id: 1, name: 'super_admin', display_name: 'Super Administrator' },
            { id: 2, name: 'admin', display_name: 'Administrator' },
            { id: 3, name: 'moderator', display_name: 'Moderator' }
          ],
          created_at: '2024-01-01T00:00:00Z'
        },
        {
          id: 4,
          name: 'users.delete',
          display_name: 'Delete Users',
          description: 'Can delete users',
          module: 'users',
          is_active: true,
          roles_count: 1,
          roles: [
            { id: 1, name: 'super_admin', display_name: 'Super Administrator' }
          ],
          created_at: '2024-01-01T00:00:00Z'
        },
        {
          id: 5,
          name: 'roles.view',
          display_name: 'View Roles',
          description: 'Can view role listings',
          module: 'roles',
          is_active: true,
          roles_count: 3,
          roles: [
            { id: 1, name: 'super_admin', display_name: 'Super Administrator' },
            { id: 2, name: 'admin', display_name: 'Administrator' }
          ],
          created_at: '2024-01-01T00:00:00Z'
        },
        {
          id: 6,
          name: 'dashboard.view',
          display_name: 'View Dashboard',
          description: 'Can access dashboard',
          module: 'dashboard',
          is_active: true,
          roles_count: 4,
          roles: [
            { id: 1, name: 'super_admin', display_name: 'Super Administrator' },
            { id: 2, name: 'admin', display_name: 'Administrator' },
            { id: 3, name: 'moderator', display_name: 'Moderator' },
            { id: 4, name: 'user', display_name: 'Regular User' }
          ],
          created_at: '2024-01-01T00:00:00Z'
        },
        {
          id: 7,
          name: 'analytics.view',
          display_name: 'View Analytics',
          description: 'Can view analytics reports',
          module: 'analytics',
          is_active: true,
          roles_count: 3,
          roles: [
            { id: 1, name: 'super_admin', display_name: 'Super Administrator' },
            { id: 2, name: 'admin', display_name: 'Administrator' },
            { id: 3, name: 'moderator', display_name: 'Moderator' }
          ],
          created_at: '2024-01-01T00:00:00Z'
        },
        {
          id: 8,
          name: 'products.manage',
          display_name: 'Manage Products',
          description: 'Can create, edit, and delete products',
          module: 'products',
          is_active: true,
          roles_count: 2,
          roles: [
            { id: 1, name: 'super_admin', display_name: 'Super Administrator' },
            { id: 2, name: 'admin', display_name: 'Administrator' }
          ],
          created_at: '2024-01-01T00:00:00Z'
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredPermissions = permissions.filter(permission => {
    const matchesSearch =
      permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      permission.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      permission.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesModule = selectedModule === 'all' || permission.module === selectedModule;

    return matchesSearch && matchesModule;
  });

  const getModuleBadgeVariant = (module) => {
    const variants = {
      users: 'default',
      roles: 'secondary',
      permissions: 'outline',
      dashboard: 'destructive',
      analytics: 'default',
      orders: 'secondary',
      products: 'outline',
      reports: 'default',
      settings: 'secondary',
      logs: 'outline'
    };
    return variants[module] || 'default';
  };

  const handleCreatePermission = () => {
    setFormData({
      name: '',
      display_name: '',
      description: '',
      module: '',
      is_active: true
    });
    setShowCreateModal(true);
  };

  const handleEditPermission = (permission) => {
    setSelectedPermission(permission);
    setFormData({
      name: permission.name,
      display_name: permission.display_name,
      description: permission.description,
      module: permission.module,
      is_active: permission.is_active
    });
    setShowEditModal(true);
  };

  const handleDeletePermission = (permissionId) => {
    if (window.confirm('Are you sure you want to delete this permission?')) {
      setPermissions(permissions.filter(permission => permission.id !== permissionId));
    }
  };

  const handleSubmit = (isEdit = false) => {
    console.log('Submitting permission:', formData);

    if (isEdit) {
      setPermissions(permissions.map(permission =>
        permission.id === selectedPermission.id
          ? { ...permission, ...formData }
          : permission
      ));
      setShowEditModal(false);
    } else {
      const newPermission = {
        id: Date.now(),
        ...formData,
        roles_count: 0,
        roles: [],
        created_at: new Date().toISOString()
      };
      setPermissions([...permissions, newPermission]);
      setShowCreateModal(false);
    }
  };

  const Modal = ({ show, onClose, title, children }) => {
    if (!show) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">{title}</h2>
              <Button variant="ghost" size="sm" onClick={onClose}>
                ×
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
        <div className="text-lg">Loading permissions...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Permission Management</h1>
          <p className="text-muted-foreground">
            Manage system permissions and their assignments to roles.
          </p>
        </div>
        <Button onClick={handleCreatePermission} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Permission
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search permissions by name, display name, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={selectedModule}
              onChange={(e) => setSelectedModule(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="all">All Modules</option>
              {modules.map(module => (
                <option key={module} value={module}>
                  {module.charAt(0).toUpperCase() + module.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Permissions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Permissions ({filteredPermissions.length})</CardTitle>
          <CardDescription>
            System permissions grouped by module
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredPermissions.map((permission) => (
              <div key={permission.id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Key className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">{permission.display_name}</span>
                      <Badge variant={getModuleBadgeVariant(permission.module)}>
                        {permission.module}
                      </Badge>
                      <Badge variant={permission.is_active ? 'default' : 'outline'}>
                        {permission.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>

                    <div className="text-sm text-gray-600 mb-2">
                      <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                        {permission.name}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 mb-3">
                      {permission.description}
                    </p>

                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        Used by {permission.roles_count} role{permission.roles_count !== 1 ? 's' : ''}:
                      </span>
                      <div className="flex gap-1">
                        {permission.roles.slice(0, 3).map(role => (
                          <Badge key={role.id} variant="outline" className="text-xs">
                            {role.display_name}
                          </Badge>
                        ))}
                        {permission.roles.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{permission.roles.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditPermission(permission)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeletePermission(permission.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Create Permission Modal */}
      <Modal
        show={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Permission"
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Permission Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., users.edit"
            />
            <p className="text-xs text-gray-500 mt-1">
              Use format: module.action (e.g., users.edit, orders.create)
            </p>
          </div>

          <div>
            <Label htmlFor="display_name">Display Name</Label>
            <Input
              id="display_name"
              value={formData.display_name}
              onChange={(e) => setFormData(prev => ({ ...prev, display_name: e.target.value }))}
              placeholder="e.g., Edit Users"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe what this permission allows..."
            />
          </div>

          <div>
            <Label htmlFor="module">Module</Label>
            <select
              id="module"
              value={formData.module}
              onChange={(e) => setFormData(prev => ({ ...prev, module: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">Select Module</option>
              {modules.map(module => (
                <option key={module} value={module}>
                  {module.charAt(0).toUpperCase() + module.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button onClick={() => handleSubmit(false)}>
              Create Permission
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Permission Modal */}
      <Modal
        show={showEditModal}
        onClose={() => setShowEditModal(false)}
        title={`Edit Permission: ${selectedPermission?.display_name}`}
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="edit_name">Permission Name</Label>
            <Input
              id="edit_name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
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

          <div>
            <Label htmlFor="edit_description">Description</Label>
            <Input
              id="edit_description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="edit_module">Module</Label>
            <select
              id="edit_module"
              value={formData.module}
              onChange={(e) => setFormData(prev => ({ ...prev, module: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">Select Module</option>
              {modules.map(module => (
                <option key={module} value={module}>
                  {module.charAt(0).toUpperCase() + module.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="edit_is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
              className="rounded border-gray-300"
            />
            <Label htmlFor="edit_is_active">Active</Label>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button onClick={() => handleSubmit(true)}>
              Update Permission
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PermissionManagement;
