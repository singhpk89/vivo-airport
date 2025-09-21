import { useState, useEffect, useContext, createContext } from 'react';
import aclService from '../services/aclService';

// Create Permission Context
const PermissionContext = createContext();

// Permission Provider Component
export const PermissionProvider = ({ children, user = null }) => {
  const [permissions, setPermissions] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(user);

  useEffect(() => {
    if (currentUser) {
      loadUserPermissions();
    } else {
      setLoading(false);
    }
  }, [currentUser]);

  const loadUserPermissions = async () => {
    try {
      setLoading(true);
      const response = await aclService.getUserPermissions(currentUser.id);
      if (response.success) {
        setPermissions(response.data.all_permissions || []);
        setRoles(response.data.roles || []);
      }
    } catch (error) {
      console.error('Failed to load user permissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const hasPermission = (permission) => {
    if (!currentUser) return false;
    return permissions.some(p => p.name === permission);
  };

  const hasAnyPermission = (permissionList) => {
    if (!currentUser) return false;
    return permissionList.some(permission => hasPermission(permission));
  };

  const hasAllPermissions = (permissionList) => {
    if (!currentUser) return false;
    return permissionList.every(permission => hasPermission(permission));
  };

  const hasRole = (role) => {
    if (!currentUser) return false;
    return roles.some(r => r.name === role);
  };

  const hasAnyRole = (roleList) => {
    if (!currentUser) return false;
    return roleList.some(role => hasRole(role));
  };

  const isSuperAdmin = () => {
    return hasRole('super_admin');
  };

  const isAdmin = () => {
    return hasRole('admin') || isSuperAdmin();
  };

  const canAccessModule = (module) => {
    if (!currentUser) return false;
    return permissions.some(p => p.module === module);
  };

  const getAccessibleModules = () => {
    return [...new Set(permissions.map(p => p.module))];
  };

  const value = {
    permissions,
    roles,
    loading,
    currentUser,
    setCurrentUser,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    hasAnyRole,
    isSuperAdmin,
    isAdmin,
    canAccessModule,
    getAccessibleModules,
    refreshPermissions: loadUserPermissions,
  };

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
};

// Hook to use permission context
export const usePermissions = () => {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error('usePermissions must be used within a PermissionProvider');
  }
  return context;
};

// Higher-order component for permission-based rendering
export const withPermission = (permission) => (Component) => {
  return function PermissionWrappedComponent(props) {
    const { hasPermission } = usePermissions();

    if (!hasPermission(permission)) {
      return null; // or a "Access Denied" component
    }

    return <Component {...props} />;
  };
};

// Component for conditional rendering based on permissions
export const CanAccess = ({
  permission,
  permissions = [],
  role,
  roles = [],
  requireAll = false,
  children,
  fallback = null
}) => {
  const { hasPermission, hasAnyPermission, hasAllPermissions, hasRole, hasAnyRole } = usePermissions();

  let hasAccess = false;

  if (permission) {
    hasAccess = hasPermission(permission);
  } else if (permissions.length > 0) {
    hasAccess = requireAll ? hasAllPermissions(permissions) : hasAnyPermission(permissions);
  } else if (role) {
    hasAccess = hasRole(role);
  } else if (roles.length > 0) {
    hasAccess = hasAnyRole(roles);
  }

  return hasAccess ? children : fallback;
};

// Component for module-based access control
export const ModuleAccess = ({ module, children, fallback = null }) => {
  const { canAccessModule } = usePermissions();

  return canAccessModule(module) ? children : fallback;
};

// Hook for checking specific permissions
export const usePermissionCheck = () => {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();

  return {
    can: hasPermission,
    canAny: hasAnyPermission,
    canAll: hasAllPermissions,
  };
};

// Hook for role checking
export const useRoleCheck = () => {
  const { hasRole, hasAnyRole, isSuperAdmin, isAdmin } = usePermissions();

  return {
    hasRole,
    hasAnyRole,
    isSuperAdmin,
    isAdmin,
  };
};
