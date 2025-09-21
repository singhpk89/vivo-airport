<?php

namespace App\Http\Controllers;

use App\Models\Promoter;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class PromoterController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        // Add select fields to reduce data transfer - only select existing columns
        $query = Promoter::select([
            'id', 'name', 'username', 'state', 'district', 'is_active',
            'status', 'last_active', 'created_at',
        ]);

        // Apply state filtering based on user permissions
        $query->forUserStates();

        // Search functionality
        if ($request->has('search') && ! empty($request->search)) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('username', 'like', "%{$search}%")
                    ->orWhere('state', 'like', "%{$search}%")
                    ->orWhere('district', 'like', "%{$search}%");
            });
        }

        // Filter by state
        if ($request->has('state') && ! empty($request->state) && $request->state !== 'all-states') {
            $query->where('state', $request->state);
        }

        // Filter by district
        if ($request->has('district') && ! empty($request->district) && $request->district !== 'all-districts') {
            $query->where('district', $request->district);
        }

        // Filter by status
        if ($request->has('status') && ! empty($request->status) && $request->status !== 'all-status') {
            $query->where('status', $request->status);
        }

        // Filter by login status
        if ($request->has('is_logged_in') && $request->is_logged_in !== 'all') {
            $query->where('is_logged_in', $request->is_logged_in === 'true');
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');

        $allowedSortFields = ['name', 'username', 'state', 'district', 'status', 'last_active', 'created_at'];
        if (in_array($sortBy, $allowedSortFields)) {
            $query->orderBy($sortBy, $sortOrder);
        }

        $perPage = $request->get('per_page', 15);

        // If requesting all data or a very high number, get all records
        if ($perPage >= 1000 || $request->get('all') === 'true') {
            $promoters = $query->get();

            return response()->json([
                'success' => true,
                'data' => $promoters,
                'pagination' => [
                    'current_page' => 1,
                    'last_page' => 1,
                    'per_page' => $promoters->count(),
                    'total' => $promoters->count(),
                    'from' => 1,
                    'to' => $promoters->count(),
                ],
            ]);
        }

        $promoters = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $promoters->items(),
            'pagination' => [
                'current_page' => $promoters->currentPage(),
                'last_page' => $promoters->lastPage(),
                'per_page' => $promoters->perPage(),
                'total' => $promoters->total(),
                'from' => $promoters->firstItem(),
                'to' => $promoters->lastItem(),
            ],
        ]);
    }

    /**
     * Get unique states for filtering.
     */
    public function getStates()
    {
        $states = Promoter::whereNotNull('state')
            ->distinct()
            ->pluck('state')
            ->sort()
            ->values();

        return response()->json([
            'success' => true,
            'data' => $states,
        ]);
    }

    /**
     * Get unique districts for filtering.
     */
    public function getDistricts()
    {
        $districts = Promoter::whereNotNull('district')
            ->distinct()
            ->pluck('district')
            ->sort()
            ->values();

        return response()->json([
            'success' => true,
            'data' => $districts,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'username' => 'required|string|max:255|unique:promoters,username',
            'password' => 'required|string|min:6',
            'state' => 'nullable|string|max:100',
            'district' => 'nullable|string|max:100',
            'status' => 'required|in:active,inactive,pending,suspended',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $promoter = Promoter::create([
                'name' => $request->name,
                'username' => $request->username,
                'password' => Hash::make($request->password),
                'state' => $request->state,
                'district' => $request->district,
                'status' => $request->status,
                'is_active' => $request->boolean('is_active', true),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Promoter created successfully',
                'data' => $promoter,
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create promoter',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Promoter $promoter)
    {
        $promoter->load([
            'activityRecces' => function ($query) {
                $query->orderBy('created_at', 'desc')->take(10);
            },
        ]);

        // Get statistics
        $stats = [
            'accessible_routes' => $promoter->accessibleRoutePlans()->count(),
            'total_activities' => $promoter->activityRecces()->count(),
            'completed_activities' => $promoter->activityRecces()->where('status', 'completed')->count(),
            'pending_activities' => $promoter->activityRecces()->where('status', 'pending')->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => $promoter,
            'stats' => $stats,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Promoter $promoter)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'username' => 'required|string|max:255|unique:promoters,username,'.$promoter->id,
            'password' => 'nullable|string|min:6',
            'state' => 'nullable|string|max:100',
            'district' => 'nullable|string|max:100',
            'status' => 'required|in:active,inactive,pending,suspended',
            'is_active' => 'boolean',
            'is_logged_in' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $updateData = [
                'name' => $request->name,
                'username' => $request->username,
                'state' => $request->state,
                'district' => $request->district,
                'status' => $request->status,
                'is_active' => $request->boolean('is_active', true),
                'is_logged_in' => $request->boolean('is_logged_in', false),
            ];

            // Only update password if provided
            if (! empty($request->password)) {
                $updateData['password'] = Hash::make($request->password);
            }

            $promoter->update($updateData);

            return response()->json([
                'success' => true,
                'message' => 'Promoter updated successfully',
                'data' => $promoter->fresh(),
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update promoter',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Promoter $promoter)
    {
        try {
            $promoter->delete();

            return response()->json([
                'success' => true,
                'message' => 'Promoter deleted successfully',
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete promoter',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Bulk delete promoters.
     */
    public function bulkDelete(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'ids' => 'required|array|min:1',
            'ids.*' => 'required|integer|exists:promoters,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $deletedCount = Promoter::whereIn('id', $request->ids)->delete();

            return response()->json([
                'success' => true,
                'message' => "Successfully deleted {$deletedCount} promoters",
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete promoters',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Bulk update status of promoters.
     */
    public function bulkUpdateStatus(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'ids' => 'required|array|min:1',
            'ids.*' => 'required|integer|exists:promoters,id',
            'status' => 'required|in:active,inactive,pending,suspended',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $updatedCount = Promoter::whereIn('id', $request->ids)
                ->update(['status' => $request->status]);

            return response()->json([
                'success' => true,
                'message' => "Successfully updated status for {$updatedCount} promoters",
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update promoter status',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Reset login status for a promoter.
     */
    public function resetLogin(Promoter $promoter)
    {
        try {
            // Reset login status and clear device information
            $promoter->update([
                'is_logged_in' => false,
                'device_id' => null,
                'device_token' => null,
                'last_active' => now(),
            ]);

            // Revoke all tokens for this promoter
            $promoter->tokens()->delete();

            return response()->json([
                'success' => true,
                'message' => 'Login status reset successfully. User has been logged out from all devices.',
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to reset login status',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Export promoters data.
     */
    public function export(Request $request)
    {
        try {
            $query = Promoter::query();

            // Apply same filters as index method
            if ($request->has('search') && ! empty($request->search)) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('username', 'like', "%{$search}%")
                        ->orWhere('state', 'like', "%{$search}%")
                        ->orWhere('district', 'like', "%{$search}%");
                });
            }

            if ($request->has('state') && ! empty($request->state) && $request->state !== 'all-states') {
                $query->where('state', $request->state);
            }

            if ($request->has('district') && ! empty($request->district) && $request->district !== 'all-districts') {
                $query->where('district', $request->district);
            }

            if ($request->has('status') && ! empty($request->status) && $request->status !== 'all-status') {
                $query->where('status', $request->status);
            }

            $promoters = $query->get([
                'name', 'username', 'state', 'district', 'status', 'is_active', 'is_logged_in',
                'last_active', 'app_version', 'created_at',
            ]);

            return response()->json([
                'success' => true,
                'data' => $promoters,
                'message' => 'Promoters data exported successfully',
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to export promoters data',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get lightweight promoter data for filters (only id and name).
     */
    public function forFilters(Request $request)
    {
        try {
            $query = Promoter::select(['id', 'name'])
                ->where('is_active', true)
                ->where('status', 'active');

            // Apply state filtering based on user permissions
            $query->forUserStates();

            // Optional search for filters
            if ($request->has('search') && ! empty($request->search)) {
                $search = $request->search;
                $query->where('name', 'like', "%{$search}%");
            }

            $promoters = $query->orderBy('name', 'asc')->get();

            return response()->json([
                'success' => true,
                'data' => $promoters,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch promoters for filters: '.$e->getMessage(),
            ], 500);
        }
    }
}
