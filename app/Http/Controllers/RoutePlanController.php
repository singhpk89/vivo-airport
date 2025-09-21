<?php

namespace App\Http\Controllers;

use App\Models\RoutePlan;
use App\Services\RoutePlanImportService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class RoutePlanController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = RoutePlan::query();

        // Apply state filtering based on user permissions
        $query->forUserStates();

        // Search functionality
        if ($request->has('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('state', 'like', "%{$search}%")
                    ->orWhere('district', 'like', "%{$search}%")
                    ->orWhere('sub_district', 'like', "%{$search}%")
                    ->orWhere('village', 'like', "%{$search}%")
                    ->orWhere('village_code', 'like', "%{$search}%");
            });
        }

        // Filter by status
        if ($request->has('status') && $request->get('status') !== 'all') {
            $query->where('status', $request->get('status'));
        }

        // Filter by state
        if ($request->has('state') && $request->get('state') !== 'all-states') {
            $query->where('state', $request->get('state'));
        }

        // Filter by district
        if ($request->has('district') && $request->get('district') !== 'all-districts') {
            $query->where('district', $request->get('district'));
        }

        // Filter by sub_district
        if ($request->has('sub_district') && $request->get('sub_district') !== 'all-sub-districts') {
            $query->where('sub_district', $request->get('sub_district'));
        }

        // Filter by village
        if ($request->has('village') && $request->get('village') !== 'all-villages') {
            $query->where('village_code', $request->get('village'));
        }

        // Special case: return only IDs for bulk selection
        if ($request->has('ids_only') && $request->get('ids_only') === 'true') {
            $ids = $query->pluck('id')->toArray();

            return response()->json([
                'success' => true,
                'data' => $ids,
            ]);
        }

        // Get pagination parameters from request, with defaults
        $perPage = $request->get('per_page', 15);
        $perPage = in_array($perPage, [10, 20, 30, 40, 50, 100]) ? $perPage : 15;

        $routePlans = $query->orderBy('created_at', 'desc')->paginate($perPage);

        // Get total count without pagination for display
        $totalCount = RoutePlan::count();

        return response()->json([
            'success' => true,
            'data' => $routePlans,
            'meta' => [
                'total' => $routePlans->total(),
                'total_records' => $totalCount,
                'per_page' => $routePlans->perPage(),
                'current_page' => $routePlans->currentPage(),
                'last_page' => $routePlans->lastPage(),
                'from' => $routePlans->firstItem(),
                'to' => $routePlans->lastItem(),
            ],
        ]);
    }

    /**
     * Get all filter options for dropdowns
     */
    public function getFilterOptions()
    {
        // Use caching for frequently accessed filter options
        $cacheKey = 'route_plan_filter_options_'.Auth::user()->id;

        return cache()->remember($cacheKey, 300, function () { // Cache for 5 minutes
            // Apply user state restrictions and optimize queries
            $query = RoutePlan::forUserStates();

            $states = $query->clone()->distinct()->orderBy('state')->pluck('state')->filter()->values();
            $districts = $query->clone()->distinct()->orderBy('district')->pluck('district')->filter()->values();
            $subDistricts = $query->clone()->distinct()->orderBy('sub_district')->pluck('sub_district')->filter()->values();
            $villages = $query->clone()->distinct()->orderBy('village')->pluck('village')->filter()->values();

            return [
                'success' => true,
                'data' => [
                    'states' => $states,
                    'districts' => $districts,
                    'sub_districts' => $subDistricts,
                    'villages' => $villages,
                ],
            ];
        });
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'state' => 'required|string|max:100',
            'district' => 'required|string|max:100',
            'sub_district' => 'required|string|max:100',
            'village' => 'required|string|max:100',
            'village_code' => 'required|string|max:20|unique:route_plans,village_code',
            'width' => 'nullable|numeric|min:0|max:999999.99',
            'height' => 'nullable|numeric|min:0|max:999999.99',
            'area' => 'nullable|numeric|min:0|max:9999999999.99',
            'status' => 'required|in:active,pending,completed,cancelled',
            'wall_count' => 'required|integer|min:1|max:999',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $data = $request->only([
                'state', 'district', 'sub_district', 'village', 'village_code',
                'width', 'height', 'area', 'status', 'wall_count',
            ]);

            // Auto-calculate area if width and height are provided but area is not
            if (! empty($data['width']) && ! empty($data['height']) && empty($data['area'])) {
                $data['area'] = $data['width'] * $data['height'];
            }

            $routePlan = RoutePlan::create($data);

            return response()->json([
                'success' => true,
                'message' => 'Route plan created successfully',
                'data' => $routePlan,
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create route plan',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(RoutePlan $routePlan)
    {
        return response()->json([
            'success' => true,
            'data' => $routePlan,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, RoutePlan $routePlan)
    {
        $validator = Validator::make($request->all(), [
            'state' => 'required|string|max:100',
            'district' => 'required|string|max:100',
            'sub_district' => 'required|string|max:100',
            'village' => 'required|string|max:100',
            'village_code' => 'required|string|max:20|unique:route_plans,village_code,'.$routePlan->id,
            'width' => 'nullable|numeric|min:0|max:999999.99',
            'height' => 'nullable|numeric|min:0|max:999999.99',
            'area' => 'nullable|numeric|min:0|max:9999999999.99',
            'status' => 'required|in:active,pending,completed,cancelled',
            'wall_count' => 'required|integer|min:1|max:999',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $data = $request->only([
                'state', 'district', 'sub_district', 'village', 'village_code',
                'width', 'height', 'area', 'status', 'wall_count',
            ]);

            // Auto-calculate area if width and height are provided but area is not
            if (! empty($data['width']) && ! empty($data['height']) && empty($data['area'])) {
                $data['area'] = $data['width'] * $data['height'];
            }

            $routePlan->update($data);

            return response()->json([
                'success' => true,
                'message' => 'Route plan updated successfully',
                'data' => $routePlan->fresh(),
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update route plan',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(RoutePlan $routePlan)
    {
        try {
            $routePlan->delete();

            return response()->json([
                'success' => true,
                'message' => 'Route plan deleted successfully',
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete route plan',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get route plan statistics.
     */
    public function getStatistics(RoutePlan $routePlan, Request $request)
    {
        // Basic stats without complex relationships for now
        $stats = [
            'route_plan_id' => $routePlan->id,
            'state' => $routePlan->state,
            'district' => $routePlan->district,
            'sub_district' => $routePlan->sub_district,
            'village' => $routePlan->village,
            'status' => $routePlan->status,
            'area' => $routePlan->area,
            'wall_count' => $routePlan->wall_count,
            'is_active' => $routePlan->is_active,
        ];

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }

    /**
     * Get available states (for dropdown).
     */
    public function getStates()
    {
        $states = RoutePlan::distinct('state')->pluck('state')->sort()->values();

        return response()->json([
            'success' => true,
            'data' => $states,
        ]);
    }

    /**
     * Get districts by state.
     */
    public function getDistricts(Request $request)
    {
        $state = $request->get('state');

        $query = RoutePlan::distinct('district');

        if ($state) {
            $query->where('state', $state);
        }

        $districts = $query->whereNotNull('district')
            ->pluck('district')
            ->sort()
            ->values();

        return response()->json([
            'success' => true,
            'data' => $districts,
        ]);
    }

    /**
     * Get states and districts for dropdowns (for promoter forms).
     */
    public function getLocations()
    {
        $states = RoutePlan::distinct('state')
            ->whereNotNull('state')
            ->pluck('state')
            ->sort()
            ->values();

        $districts = RoutePlan::select('state', 'district')
            ->distinct()
            ->whereNotNull('state')
            ->whereNotNull('district')
            ->orderBy('state')
            ->orderBy('district')
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'states' => $states,
                'districts' => $districts,
            ],
        ]);
    }

    /**
     * Toggle route plan status.
     */
    public function toggleStatus(RoutePlan $routePlan)
    {
        try {
            $routePlan->is_active = ! $routePlan->is_active;
            $routePlan->save();

            return response()->json([
                'success' => true,
                'message' => 'Route plan status updated successfully',
                'data' => $routePlan,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update status',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Validate import file before processing
     */
    public function validateImport(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'file' => 'required|file|mimes:csv,txt|max:51200', // 50MB max for large files
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'File validation failed',
                    'errors' => $validator->errors(),
                ], 422);
            }

            $file = $request->file('file');

            // Store file using Laravel's storage system
            $fileName = time().'_'.$file->getClientOriginalName();
            $filePath = $file->storeAs('temp-imports', $fileName, 'local');

            // Get the absolute file path
            $absolutePath = Storage::disk('local')->path($filePath);

            // Use the import service for validation
            $importService = new RoutePlanImportService;
            $validationResults = $importService->validateFile($absolutePath);

            return response()->json([
                'success' => true,
                'message' => 'File validation completed',
                'data' => array_merge($validationResults, ['file_path' => $filePath]),
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed: '.$e->getMessage(),
            ], 500);
        }
    }

    /**
     * Process the import file and save route plans to database
     */
    public function import(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'file_path' => 'required|string',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'File path validation failed',
                    'errors' => $validator->errors(),
                ], 422);
            }

            $filePath = $request->get('file_path');
            $absolutePath = Storage::disk('local')->path($filePath);

            if (! file_exists($absolutePath)) {
                return response()->json([
                    'success' => false,
                    'message' => 'File not found. Please re-upload the file.',
                ], 404);
            }

            // Use the import service for processing
            $importService = new RoutePlanImportService;
            $importResults = $importService->importFile($absolutePath);

            // Clean up the temporary file
            Storage::disk('local')->delete($filePath);

            return response()->json([
                'success' => true,
                'message' => 'Import completed successfully',
                'data' => $importResults,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Import failed: '.$e->getMessage(),
            ], 500);
        }
    }

    /**
     * Bulk update status for multiple route plans
     */
    public function bulkUpdateStatus(Request $request)
    {
        $request->validate([
            'ids' => 'required|array|max:1000', // Limit max IDs to prevent memory issues
            'ids.*' => 'integer|min:1',
            'status' => 'required|string|in:active,pending,completed,cancelled',
        ]);

        try {
            // Remove duplicates and ensure all IDs are valid integers
            $ids = array_unique(array_filter(array_map('intval', $request->ids)));

            if (empty($ids)) {
                return response()->json([
                    'success' => false,
                    'message' => 'No valid IDs provided',
                ], 400);
            }

            // Validate that all IDs exist in a single query (much faster than individual validation)
            $existingIds = RoutePlan::whereIn('id', $ids)->pluck('id')->toArray();
            $invalidIds = array_diff($ids, $existingIds);

            if (! empty($invalidIds)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Some route plans do not exist: '.implode(', ', $invalidIds),
                ], 400);
            }

            // Process in chunks to avoid query size limitations and improve performance
            $chunkSize = 100; // Process 100 records at a time
            $totalUpdated = 0;

            foreach (array_chunk($ids, $chunkSize) as $chunk) {
                $updated = RoutePlan::whereIn('id', $chunk)
                    ->update([
                        'status' => $request->status,
                        'updated_at' => now(), // Ensure updated_at is set
                    ]);
                $totalUpdated += $updated;
            }

            return response()->json([
                'success' => true,
                'message' => "Successfully updated status for {$totalUpdated} route plans",
                'data' => [
                    'updated_count' => $totalUpdated,
                    'status' => $request->status,
                    'processed_ids' => count($ids),
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Bulk status update failed', [
                'ids_count' => count($request->ids ?? []),
                'status' => $request->status ?? 'unknown',
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to update status: Database error occurred',
            ], 500);
        }
    }

    /**
     * Bulk delete multiple route plans
     */
    public function bulkDelete(Request $request)
    {
        $request->validate([
            'ids' => 'required|array|max:1000', // Limit max IDs to prevent memory issues
            'ids.*' => 'integer|min:1',
        ]);

        try {
            // Remove duplicates and ensure all IDs are valid integers
            $ids = array_unique(array_filter(array_map('intval', $request->ids)));

            if (empty($ids)) {
                return response()->json([
                    'success' => false,
                    'message' => 'No valid IDs provided',
                ], 400);
            }

            // Validate that all IDs exist in a single query (much faster than individual validation)
            $existingIds = RoutePlan::whereIn('id', $ids)->pluck('id')->toArray();
            $invalidIds = array_diff($ids, $existingIds);

            if (! empty($invalidIds)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Some route plans do not exist: '.implode(', ', $invalidIds),
                ], 400);
            }

            // Process in chunks to avoid query size limitations and improve performance
            $chunkSize = 100; // Process 100 records at a time
            $totalDeleted = 0;

            foreach (array_chunk($ids, $chunkSize) as $chunk) {
                $deleted = RoutePlan::whereIn('id', $chunk)->delete();
                $totalDeleted += $deleted;
            }

            return response()->json([
                'success' => true,
                'message' => "Successfully deleted {$totalDeleted} route plans",
                'data' => [
                    'deleted_count' => $totalDeleted,
                    'processed_ids' => count($ids),
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Bulk delete failed', [
                'ids_count' => count($request->ids ?? []),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to delete route plans: Database error occurred',
            ], 500);
        }
    }

    /**
     * Get unique sub districts for filtering from route plans.
     */
    public function getSubDistricts(Request $request)
    {
        $query = RoutePlan::whereNotNull('sub_district')->distinct();

        // Filter by state if provided
        if ($request->has('state') && $request->state !== 'all') {
            $query->where('state', $request->state);
        }

        // Filter by district if provided
        if ($request->has('district') && $request->district !== 'all') {
            $query->where('district', $request->district);
        }

        $subDistricts = $query->pluck('sub_district')
            ->sort()
            ->values();

        return response()->json([
            'success' => true,
            'data' => $subDistricts,
        ]);
    }

    /**
     * Get unique villages for filtering from route plans.
     */
    public function getVillages(Request $request)
    {
        $query = RoutePlan::whereNotNull('village')->distinct();

        // Filter by state if provided
        if ($request->has('state') && $request->state !== 'all') {
            $query->where('state', $request->state);
        }

        // Filter by district if provided
        if ($request->has('district') && $request->district !== 'all') {
            $query->where('district', $request->district);
        }

        // Filter by sub_district if provided
        if ($request->has('sub_district') && $request->sub_district !== 'all') {
            $query->where('sub_district', $request->sub_district);
        }

        $villages = $query->pluck('village')
            ->sort()
            ->values();

        return response()->json([
            'success' => true,
            'data' => $villages,
        ]);
    }

    /**
     * Get lightweight route plan data for form dropdowns.
     */
    public function forFilters(Request $request)
    {
        try {
            $query = RoutePlan::select([
                'id', 'village', 'district', 'state', 'village_code',
                'sub_district', 'width', 'height',
            ]);

            // Apply state filtering based on user permissions
            $query->forUserStates();

            // Optional search for filters
            if ($request->has('search') && ! empty($request->search)) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('village', 'like', "%{$search}%")
                        ->orWhere('district', 'like', "%{$search}%")
                        ->orWhere('state', 'like', "%{$search}%")
                        ->orWhere('village_code', 'like', "%{$search}%");
                });
            }

            $routePlans = $query->orderBy('state')
                ->orderBy('district')
                ->orderBy('village')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $routePlans,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch route plans for filters: '.$e->getMessage(),
            ], 500);
        }
    }
}
