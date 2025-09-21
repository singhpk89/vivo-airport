<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Login user and create token
     */
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
            'remember' => 'boolean',
        ]);

        $credentials = $request->only('email', 'password');

        if (! Auth::attempt($credentials)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        $user = Auth::user();
        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Login successful',
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                ],
                'token' => $token,
                'expires_at' => now()->addDay(),
            ],
        ]);
    }

    /**
     * Register a new user
     */
    public function register(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Registration successful',
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                ],
                'token' => $token,
                'expires_at' => now()->addDay(),
            ],
        ], 201);
    }

    /**
     * Get user profile
     */
    public function profile(Request $request): JsonResponse
    {
        $user = $request->user();
        $user->load('roles');

        return response()->json([
            'success' => true,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'roles' => $user->roles->map(function ($role) {
                    return [
                        'id' => $role->id,
                        'name' => $role->name,
                    ];
                }),
                'created_at' => $user->created_at,
                'updated_at' => $user->updated_at,
            ],
        ]);
    }

    /**
     * Update user profile with optional image upload
     */
    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|string|email|max:255|unique:users,email,'.$user->id,
            'password' => 'sometimes|required|string|min:8|confirmed',
            'phone' => 'nullable|string|max:20',
            'profile_image' => 'nullable|url',
        ]);

        $updateData = [];

        if ($request->filled('name')) {
            $updateData['name'] = $request->name;
        }

        if ($request->filled('email')) {
            $updateData['email'] = $request->email;
        }

        if ($request->filled('phone')) {
            $updateData['phone'] = $request->phone;
        }

        if ($request->filled('profile_image')) {
            $updateData['profile_image'] = $request->profile_image;
        }

        if ($request->filled('password')) {
            $updateData['password'] = Hash::make($request->password);
        }

        $user->update($updateData);

        return response()->json([
            'success' => true,
            'message' => 'Profile updated successfully',
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'profile_image' => $user->profile_image,
                'updated_at' => $user->updated_at,
            ],
        ]);
    }

    /**
     * Logout user (revoke token)
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logout successful',
        ]);
    }

    /**
     * Logout from all devices
     */
    public function logoutAll(Request $request): JsonResponse
    {
        $request->user()->tokens()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logged out from all devices',
        ]);
    }

    /**
     * Refresh token
     */
    public function refresh(Request $request): JsonResponse
    {
        $user = $request->user();

        // Revoke current token
        $request->user()->currentAccessToken()->delete();

        // Create new token
        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Token refreshed successfully',
            'data' => [
                'token' => $token,
                'expires_at' => now()->addDay(),
            ],
        ]);
    }

    /**
     * Check if user has a specific permission
     */
    public function checkPermission(Request $request): JsonResponse
    {
        $request->validate([
            'permission' => 'required|string',
        ]);

        $user = $request->user();

        // Check if user has admin or super_admin role
        $userRoles = $user->roles->pluck('name')->toArray();
        $isAdminOrSuperAdmin = in_array('admin', $userRoles) || in_array('super_admin', $userRoles);

        // Admin and Super Admin have all permissions
        $hasPermission = $isAdminOrSuperAdmin || $user->hasPermission($request->permission);

        return response()->json([
            'success' => true,
            'data' => [
                'permission' => $request->permission,
                'has_permission' => $hasPermission,
            ],
        ]);
    }

    /**
     * Get user's accessible menu items
     */
    public function getAccessibleMenus(Request $request): JsonResponse
    {
        $user = $request->user();
        $user->load(['roles.permissions', 'permissions']);

        // Check if user has admin or super_admin role
        $userRoles = $user->roles->pluck('name')->toArray();
        $isAdminOrSuperAdmin = in_array('admin', $userRoles) || in_array('super_admin', $userRoles);

        $allMenus = [
            [
                'name' => 'Dashboard',
                'href' => '/dashboard',
                'icon' => 'Home',
                'permission' => 'dashboard.view',
                'module' => 'dashboard',
            ],
            [
                'name' => 'User Management',
                'href' => '/users',
                'icon' => 'Users',
                'permission' => 'users.view',
                'module' => 'users',
            ],
            [
                'name' => 'Role Management',
                'href' => '/roles',
                'icon' => 'Shield',
                'permission' => 'roles.view',
                'module' => 'roles',
            ],
            [
                'name' => 'Permission Management',
                'href' => '/permissions',
                'icon' => 'Key',
                'permission' => 'permissions.view',
                'module' => 'permissions',
            ],
            [
                'name' => 'Promoter Management',
                'href' => '/promoters',
                'icon' => 'Users',
                'permission' => 'promoters.view',
                'module' => 'promoters',
            ],
            [
                'name' => 'Route Plans',
                'href' => '/route-plans',
                'icon' => 'Route',
                'permission' => 'route_plans.view',
                'module' => 'route_plans',
            ],
            [
                'name' => 'Activity Recces',
                'href' => '/activity-recces',
                'icon' => 'Activity',
                'permission' => 'activity_recces.view',
                'module' => 'activity_recces',
            ],
            [
                'name' => 'Photo Gallery',
                'href' => '/photos/gallery',
                'icon' => 'Images',
                'permission' => 'photos.view',
                'module' => 'photos',
            ],
            [
                'name' => 'Analytics',
                'href' => '/analytics',
                'icon' => 'BarChart3',
                'permission' => 'analytics.view',
                'module' => 'analytics',
            ],
            [
                'name' => 'Reports',
                'href' => '/reports',
                'icon' => 'FileText',
                'permission' => 'reports.view',
                'module' => 'reports',
            ],
            [
                'name' => 'Settings',
                'href' => '/settings',
                'icon' => 'Settings',
                'permission' => 'settings.view',
                'module' => 'settings',
            ],
        ];

        // Filter menus based on permissions
        // Admin and Super Admin can see all menus, others need specific permissions
        $accessibleMenus = array_filter($allMenus, function ($menu) use ($user, $isAdminOrSuperAdmin) {
            // Admin and Super Admin can access all menus
            if ($isAdminOrSuperAdmin) {
                return true;
            }

            // Other users need specific permissions
            return $user->hasPermission($menu['permission']);
        });

        return response()->json([
            'success' => true,
            'data' => [
                'menus' => array_values($accessibleMenus),
                'user_permissions' => $user->getAllPermissions()->pluck('name'),
                'user_roles' => $user->roles->pluck('name'),
            ],
        ]);
    }

    /**
     * Update profile with image upload (multipart/form-data)
     */
    public function updateProfileWithImage(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,'.Auth::id(),
            'phone' => 'nullable|string|max:20',
            'profile_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:5120', // 5MB max
        ]);

        try {
            $user = Auth::user();

            $updateData = $request->only(['name', 'email', 'phone']);

            // Upload profile image to S3 if provided
            if ($request->hasFile('profile_image')) {
                $image = $request->file('profile_image');

                // Generate unique filename
                $filename = \Illuminate\Support\Str::random(32).'.'.$image->getClientOriginalExtension();
                $path = 'profiles/'.date('Y/m/d')."/{$filename}";

                // Upload to S3
                $uploaded = \Illuminate\Support\Facades\Storage::disk('s3')->put($path, file_get_contents($image), 'public');

                if ($uploaded) {
                    // Delete old profile image if exists
                    if ($user->profile_image) {
                        $oldPath = $this->extractS3PathFromUrl($user->profile_image);
                        if ($oldPath) {
                            \Illuminate\Support\Facades\Storage::disk('s3')->delete($oldPath);
                        }
                    }

                    // Generate S3 URL
                    $bucket = env('AWS_BUCKET');
                    $region = env('AWS_DEFAULT_REGION');
                    $updateData['profile_image'] = "https://{$bucket}.s3.{$region}.amazonaws.com/{$path}";
                }
            }

            $user->update($updateData);

            return response()->json([
                'success' => true,
                'message' => 'Profile updated successfully',
                'data' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'profile_image' => $user->profile_image,
                    'updated_at' => $user->updated_at,
                ],
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update profile: '.$e->getMessage(),
            ], 500);
        }
    }

    /**
     * Extract S3 path from full URL
     */
    private function extractS3PathFromUrl(?string $url): ?string
    {
        if (! $url) {
            return null;
        }

        $parsedUrl = parse_url($url);
        $path = ltrim($parsedUrl['path'], '/');

        // Remove bucket name from path if present
        $bucketName = env('AWS_BUCKET');
        if (strpos($path, $bucketName.'/') === 0) {
            $path = substr($path, strlen($bucketName) + 1);
        }

        return $path;
    }
}
