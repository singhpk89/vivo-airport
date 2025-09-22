<?php

namespace App\Http\Controllers;

use App\Models\ActivityRecce;
use App\Models\Promoter;
use App\Models\RoutePlan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class PromoterAuthController extends Controller
{
    /**
     * Mobile app login for promoters.
     */
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'username' => 'required|string',
            'password' => 'required|string',
            'app_version' => 'nullable|string|max:50',
            'device_token' => 'nullable|string|max:255',
            'device_id' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $promoter = Promoter::where('username', $request->username)->first();

            if (! $promoter || ! Hash::check($request->password, $promoter->password)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid credentials',
                ], 401);
            }

            if (! $promoter->is_active) {
                return response()->json([
                    'success' => false,
                    'message' => 'Account is deactivated. Please contact administrator.',
                ], 403);
            }

            // Check if user is already logged in
            if ($promoter->is_logged_in) {
                // If device_id is provided, check if it's the same device
                if ($request->filled('device_id')) {
                    if ($promoter->device_id && $promoter->device_id !== $request->device_id) {
                        return response()->json([
                            'success' => false,
                            'message' => 'User already logged in on another device',
                        ], 403);
                    } elseif ($promoter->device_id === $request->device_id) {
                        return response()->json([
                            'success' => false,
                            'message' => 'User already loggedin',
                        ], 403);
                    }
                } else {
                    return response()->json([
                        'success' => false,
                        'message' => 'User already loggedin',
                    ], 403);
                }
            }

            // Device binding check: If promoter has an existing device_id and it's different from the current device, deny login
            if ($request->filled('device_id') && $promoter->device_id && $promoter->device_id !== $request->device_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'This account is already bound to another device. Please use the registered device or contact administrator.',
                ], 403);
            }

            // If promoter has no device_id (null), allow login and bind to this device
            // If promoter already has this device_id, allow login
            // If no device_id provided in request but promoter has one, still allow (backwards compatibility)

            // Create token for mobile app
            $token = $promoter->createToken('mobile-app')->plainTextToken;

            // Update login status
            $updateData = [
                'is_logged_in' => true,
                'last_active' => now(),
            ];

            // Update app_version if provided
            if ($request->filled('app_version')) {
                $updateData['app_version'] = $request->app_version;
            }

            // Update device_token if provided
            if ($request->filled('device_token')) {
                $updateData['device_token'] = $request->device_token;
            }

            // Update device_id if provided
            if ($request->filled('device_id')) {
                $updateData['device_id'] = $request->device_id;
            }

            $promoter->update($updateData);

            // Refresh to get updated data
            $promoter->refresh();

            // Get promoter's accessible route plans using state filtering
            $accessibleRoutes = \App\Models\RoutePlan::applyStateFiltering($promoter)
                ->where('is_active', true)
                ->get();

            return response()->json([
                'success' => true,
                'message' => 'Login successful',
                'data' => [
                    'promoter' => $promoter,
                    'token' => $token,
                    'accessible_routes' => $accessibleRoutes,
                    'permissions' => [
                        'can_create_activity' => true,
                        'can_update_activity' => true,
                        'can_view_routes' => true,
                    ],
                ],
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Login failed',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get promoter profile.
     */
    public function profile(Request $request)
    {
        try {
            $promoter = $request->user();

            // Get statistics
            $stats = [
                'total_activities' => $promoter->activityRecces()->count(),
                'completed_activities' => $promoter->activityRecces()->where('status', 'completed')->count(),
                'pending_activities' => $promoter->activityRecces()->where('status', 'pending')->count(),
                'this_month_activities' => $promoter->activityRecces()
                    ->whereMonth('created_at', now()->month)
                    ->whereYear('created_at', now()->year)
                    ->count(),
                'accessible_routes' => \App\Models\RoutePlan::applyStateFiltering($promoter)
                    ->where('is_active', true)
                    ->count(),
            ];

            return response()->json([
                'success' => true,
                'data' => [
                    'promoter' => $promoter,
                    'stats' => $stats,
                ],
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get profile',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update promoter profile.
     */
    public function updateProfile(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'address' => 'nullable|string|max:500',
            'profile_image' => 'nullable|string', // Base64 encoded image
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $promoter = $request->user();

            $updateData = [
                'name' => $request->name,
                'phone' => $request->phone,
                'address' => $request->address,
            ];

            // Handle profile image upload
            if ($request->filled('profile_image')) {
                $updateData['profile_image'] = $this->processImageUpload($request->profile_image);
            }

            $promoter->update($updateData);

            return response()->json([
                'success' => true,
                'message' => 'Profile updated successfully',
                'data' => $promoter,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update profile',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Change password.
     */
    public function changePassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $promoter = $request->user();

            if (! Hash::check($request->current_password, $promoter->password)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Current password is incorrect',
                ], 400);
            }

            $promoter->update([
                'password' => Hash::make($request->new_password),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Password changed successfully',
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to change password',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get accessible route plans for the promoter based on assigned states.
     */
    public function getRoutePlans(Request $request)
    {
        try {
            $promoter = $request->user();

            // Use the state filtering system to get route plans for assigned states only
            $routePlansQuery = \App\Models\RoutePlan::applyStateFiltering($promoter)
                ->where('is_active', true);

            // Apply additional filters if provided
            if ($request->has('status')) {
                $routePlansQuery->where('status', $request->status);
            }

            if ($request->has('district')) {
                $routePlansQuery->where('district', $request->district);
            }

            // Get paginated results
            $perPage = $request->get('per_page', 15);
            $routePlans = $routePlansQuery->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $routePlans->items(),
                'current_page' => $routePlans->currentPage(),
                'last_page' => $routePlans->lastPage(),
                'per_page' => $routePlans->perPage(),
                'total' => $routePlans->total(),
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get route plans',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get promoter's activity recces filtered by assigned states.
     */
    public function getActivities(Request $request)
    {
        try {
            $promoter = $request->user();

            // Start with activities that belong to route plans in the promoter's assigned states
            $query = \App\Models\ActivityRecce::applyStateFiltering($promoter)
                ->with(['routePlan', 'promoter'])
                ->where('promoter_id', $promoter->id);

            // Filter by status
            if ($request->has('status')) {
                $query->where('status', $request->get('status'));
            }

            // Filter by route plan
            if ($request->has('route_plan_id')) {
                $query->where('route_plan_id', $request->get('route_plan_id'));
            }

            // Filter by date range
            if ($request->has('start_date') && $request->has('end_date')) {
                $query->whereBetween('created_at', [
                    $request->get('start_date'),
                    $request->get('end_date'),
                ]);
            }

            $perPage = $request->get('per_page', 20);
            $activities = $query->orderBy('created_at', 'desc')->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $activities->items(),
                'current_page' => $activities->currentPage(),
                'last_page' => $activities->lastPage(),
                'per_page' => $activities->perPage(),
                'total' => $activities->total(),
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get activities',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Create new activity recce.
     */
    public function createActivity(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'route_plan_id' => 'required|exists:route_plans,id',
            'activity_type' => 'required|string|max:100',
            'location_name' => 'required|string|max:255',
            'location_coordinates' => 'nullable|array',
            'location_coordinates.lat' => 'required_with:location_coordinates|numeric|between:-90,90',
            'location_coordinates.lng' => 'required_with:location_coordinates|numeric|between:-180,180',
            'photos' => 'nullable|array',
            'photos.*' => 'nullable|string',
            'notes' => 'nullable|string|max:1000',
            'contact_person' => 'nullable|string|max:255',
            'contact_phone' => 'nullable|string|max:20',
            'estimated_audience' => 'nullable|integer|min:0',
            'actual_audience' => 'nullable|integer|min:0',
            'feedback_rating' => 'nullable|numeric|between:1,5',
            'feedback_comments' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $promoter = $request->user();

            // Verify promoter has access to this route plan
            $routePlan = RoutePlan::find($request->route_plan_id);
            if (! $promoter->isAssignedTo($routePlan->state, $routePlan->district)) {
                return response()->json([
                    'success' => false,
                    'message' => 'You are not assigned to this route plan',
                ], 403);
            }

            // Process photo uploads
            $photoUrls = [];
            if ($request->has('photos') && is_array($request->photos)) {
                foreach ($request->photos as $index => $photo) {
                    if ($photo) {
                        $photoUrls[] = $this->processImageUpload($photo, 'activity_'.$index);
                    }
                }
            }

            $activity = ActivityRecce::create([
                'promoter_id' => $promoter->id,
                'route_plan_id' => $request->route_plan_id,
                'activity_type' => $request->activity_type,
                'location_name' => $request->location_name,
                'location_coordinates' => $request->location_coordinates,
                'photos' => $photoUrls,
                'notes' => $request->notes,
                'contact_person' => $request->contact_person,
                'contact_phone' => $request->contact_phone,
                'estimated_audience' => $request->estimated_audience,
                'actual_audience' => $request->actual_audience,
                'feedback_rating' => $request->feedback_rating,
                'feedback_comments' => $request->feedback_comments,
                'status' => 'completed', // Mobile activities are typically completed when submitted
                'completed_at' => now(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Activity created successfully',
                'data' => $activity->load('routePlan'),
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create activity',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Logout.
     */
    public function logout(Request $request)
    {
        try {
            $user = $request->user();
            $currentToken = $user->currentAccessToken();

            if ($currentToken) {
                // Delete the token from the database
                $user->tokens()->where('id', $currentToken->id)->delete();
            }

            // Update login status
            $user->update([
                'is_logged_in' => false,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Logged out successfully',
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Logout failed',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Reset device binding for a promoter (Admin only).
     * This allows a promoter to login on a new device.
     */
    public function resetDeviceBinding(Request $request, Promoter $promoter)
    {
        try {
            // Force logout from current device
            $promoter->tokens()->delete();

            // Reset device binding
            $promoter->update([
                'device_id' => null,
                'device_token' => null,
                'is_logged_in' => false,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Device binding reset successfully. Promoter can now login on a new device.',
                'data' => [
                    'promoter_id' => $promoter->id,
                    'promoter_name' => $promoter->name,
                    'reset_at' => now()->toISOString(),
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to reset device binding',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Process image upload (Base64 to storage).
     */
    private function processImageUpload($imageData, $prefix = 'image')
    {
        if (str_contains($imageData, 'data:image')) {
            // Extract base64 data
            $image = substr($imageData, strpos($imageData, ',') + 1);
            $image = base64_decode($image);

            // Generate filename
            $filename = 'promoter_uploads/'.$prefix.'_'.uniqid().'.jpg';

            // Store the file
            Storage::put($filename, $image);

            return $filename;
        }

        return $imageData; // Return as-is if not base64
    }
}
