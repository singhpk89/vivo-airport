<?php

namespace App\Traits;

use App\Models\Permission;
use App\Models\Role;

trait HasPermissions
{
    /**
     * Check if user has a specific permission
     */
    public function hasPermissionTo(string $permission): bool
    {
        return $this->hasPermission($permission);
    }

    /**
     * Check if user has any of the given permissions
     */
    public function hasAnyPermission(array $permissions): bool
    {
        foreach ($permissions as $permission) {
            if ($this->hasPermission($permission)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Check if user has all of the given permissions
     */
    public function hasAllPermissions(array $permissions): bool
    {
        foreach ($permissions as $permission) {
            if (!$this->hasPermission($permission)) {
                return false;
            }
        }
        return true;
    }

    /**
     * Check if user has a specific role
     */
    public function hasAnyRole(array $roles): bool
    {
        foreach ($roles as $role) {
            if ($this->hasRole($role)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Check if user is super admin
     */
    public function isSuperAdmin(): bool
    {
        return $this->hasRole('super_admin');
    }

    /**
     * Check if user is admin
     */
    public function isAdmin(): bool
    {
        return $this->hasRole('admin') || $this->isSuperAdmin();
    }

    /**
     * Get permissions for a specific module
     */
    public function getModulePermissions(string $module): \Illuminate\Support\Collection
    {
        return $this->getAllPermissions()->filter(function ($permission) use ($module) {
            return $permission->module === $module;
        });
    }

    /**
     * Check if user can access a module
     */
    public function canAccessModule(string $module): bool
    {
        return $this->getModulePermissions($module)->count() > 0;
    }

    /**
     * Get all modules user has access to
     */
    public function getAccessibleModules(): array
    {
        return $this->getAllPermissions()
            ->pluck('module')
            ->unique()
            ->values()
            ->toArray();
    }
}
