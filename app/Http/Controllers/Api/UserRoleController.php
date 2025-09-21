<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Role;
use App\Models\Permission;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class UserRoleController extends Controller
{
    /**
     * Get all users with their roles and permissions
     */
    public function index(): JsonResponse
    {
        $users = User::with(['roles', 'permissions'])->get();

        return response()->json([
            'success' => true,
            'data' => $users->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'roles' => $user->roles,
                    'direct_permissions' => $user->permissions,
                    'all_permissions' => $user->getAllPermissions(),
                    'created_at' => $user->created_at,
                ];
            })
        ]);
    }

    /**
     * Assign roles to a user
     */
    public function assignRoles(Request $request, User $user): JsonResponse
    {
        $request->validate([
            'roles' => 'required|array',
            'roles.*' => 'exists:roles,id'
        ]);

        $user->roles()->sync($request->roles);
        $user->load(['roles', 'permissions']);

        return response()->json([
            'success' => true,
            'message' => 'Roles assigned successfully',
            'data' => [
                'user' => $user,
                'all_permissions' => $user->getAllPermissions()
            ]
        ]);
    }

    /**
     * Assign direct permissions to a user
     */
    public function assignPermissions(Request $request, User $user): JsonResponse
    {
        $request->validate([
            'permissions' => 'required|array',
            'permissions.*' => 'exists:permissions,id'
        ]);

        $user->permissions()->sync($request->permissions);
        $user->load(['roles', 'permissions']);

        return response()->json([
            'success' => true,
            'message' => 'Permissions assigned successfully',
            'data' => [
                'user' => $user,
                'all_permissions' => $user->getAllPermissions()
            ]
        ]);
    }

    /**
     * Remove role from user
     */
    public function removeRole(Request $request, User $user): JsonResponse
    {
        $request->validate([
            'role_id' => 'required|exists:roles,id'
        ]);

        $user->roles()->detach($request->role_id);
        $user->load(['roles', 'permissions']);

        return response()->json([
            'success' => true,
            'message' => 'Role removed successfully',
            'data' => [
                'user' => $user,
                'all_permissions' => $user->getAllPermissions()
            ]
        ]);
    }

    /**
     * Remove permission from user
     */
    public function removePermission(Request $request, User $user): JsonResponse
    {
        $request->validate([
            'permission_id' => 'required|exists:permissions,id'
        ]);

        $user->permissions()->detach($request->permission_id);
        $user->load(['roles', 'permissions']);

        return response()->json([
            'success' => true,
            'message' => 'Permission removed successfully',
            'data' => [
                'user' => $user,
                'all_permissions' => $user->getAllPermissions()
            ]
        ]);
    }

    /**
     * Get user's effective permissions
     */
    public function userPermissions(User $user): JsonResponse
    {
        $user->load(['roles.permissions', 'permissions']);

        return response()->json([
            'success' => true,
            'data' => [
                'user' => $user,
                'roles' => $user->roles,
                'direct_permissions' => $user->permissions,
                'role_permissions' => $user->roles->flatMap->permissions->unique('id'),
                'all_permissions' => $user->getAllPermissions(),
            ]
        ]);
    }

    /**
     * Check if user has specific permission
     */
    public function checkPermission(Request $request, User $user): JsonResponse
    {
        $request->validate([
            'permission' => 'required|string'
        ]);

        $hasPermission = $user->hasPermission($request->permission);

        return response()->json([
            'success' => true,
            'data' => [
                'user_id' => $user->id,
                'permission' => $request->permission,
                'has_permission' => $hasPermission
            ]
        ]);
    }
}
