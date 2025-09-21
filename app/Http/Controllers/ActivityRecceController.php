<?php

namespace App\Http\Controllers;

use App\Http\Requests\ActivityRecceBulkStoreRequest;
use App\Http\Requests\ActivityRecceStoreRequest;
use App\Http\Resources\ActivityRecceResource;
use App\Models\ActivityRecce;
use App\Models\Promoter;
use App\Services\TextFormattingService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class ActivityRecceController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        // Check if user has permission to view activity recces
        if (! Auth::user()->hasPermissionTo('activity_recces.view')) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have permission to view activity recces',
            ], 403);
        }

        // Optimize eager loading with only required fields to reduce memory usage
        $query = ActivityRecce::with([
            'promoter:id,name,username,state,district,is_active,status',
            'routePlan:id,state,district,sub_district,village,village_code,width,height,area,wall_count,status,is_active',
        ])
            ->select([
                'id', 'visit_date', 'plan_id', 'promoter_id', 'device_id', 'local_id',
                'state', 'district', 'sub_district', 'village', 'village_code', 'wall_code',
                'location', 'landmark', 'latitude', 'longitude', 'width', 'height',
                'promoter_remarks', 'remarks', 'status', 'product_type', 'client_status',
                'created_at', 'updated_at', 'close_shot1', 'close_shot_2', 'long_shot_1', 'long_shot_2',
            ]);

        // Apply state filtering based on user permissions
        $query->forUserStates();

        // Search functionality
        if ($request->has('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('location', 'like', "%{$search}%")
                    ->orWhere('landmark', 'like', "%{$search}%")
                    ->orWhere('village', 'like', "%{$search}%")
                    ->orWhere('remarks', 'like', "%{$search}%");
            });
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->get('status'));
        }

        // Filter by promoter
        if ($request->has('promoter_id')) {
            $query->where('promoter_id', $request->get('promoter_id'));
        }

        // Filter by route plan
        if ($request->has('plan_id')) {
            $query->where('plan_id', $request->get('plan_id'));
        }

        // Filter by location fields
        if ($request->filled('state') && $request->state !== 'all') {
            $query->where('state', $request->get('state'));
        }

        if ($request->filled('district') && $request->district !== 'all') {
            $query->where('district', $request->get('district'));
        }

        if ($request->filled('sub_district') && $request->sub_district !== 'all') {
            $query->where('sub_district', $request->get('sub_district'));
        }

        if ($request->filled('village') && $request->village !== 'all') {
            $query->where('village', $request->get('village'));
        }

        // Handle date filtering
        if ($request->filled('date_filter')) {
            $dateFilter = $request->get('date_filter');
            $today = now()->toDateString();

            switch ($dateFilter) {
                case 'today':
                    $query->whereDate('visit_date', $today);
                    break;
                case 'week':
                    $query->whereDate('visit_date', '>=', now()->subDays(7)->toDateString())
                        ->whereDate('visit_date', '<=', $today);
                    break;
                case 'month':
                    $query->whereDate('visit_date', '>=', now()->subDays(30)->toDateString())
                        ->whereDate('visit_date', '<=', $today);
                    break;
            }
        } elseif ($request->has('start_date') || $request->has('end_date')) {
            // Handle custom date range
            if ($request->filled('start_date')) {
                $query->whereDate('visit_date', '>=', $request->get('start_date'));
            }
            if ($request->filled('end_date')) {
                $query->whereDate('visit_date', '<=', $request->get('end_date'));
            }
        }

        // Filter by activity type
        if ($request->has('activity_type')) {
            $query->where('activity_type', $request->get('activity_type'));
        }

        // Filter by product type
        if ($request->has('product_type')) {
            $query->where('product_type', $request->get('product_type'));
        }

        // Get per_page parameter from request, default to 15, max 1000
        $perPage = $request->get('per_page', 15);
        $perPage = min($perPage, 1000); // Cap at 1000 to prevent memory issues

        // Add database query optimization
        $activities = $query->orderBy('created_at', 'desc')
            ->paginate($perPage)
            ->withQueryString(); // Preserve query parameters in pagination links

        return response()->json([
            'success' => true,
            'data' => $activities,
            'meta' => [
                'total' => $activities->total(),
                'per_page' => $activities->perPage(),
                'current_page' => $activities->currentPage(),
                'last_page' => $activities->lastPage(),
            ],
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Check if user has permission to create activity recces
        if (! Auth::user()->hasPermissionTo('activity_recces.create')) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have permission to create activity recces',
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'visit_date' => 'required|date',
            'promoter_id' => 'required|exists:promoters,id',
            'plan_id' => 'nullable|numeric|min:0',
            'device_id' => 'nullable|string|max:100',
            'state' => 'required|string|max:100',
            'district' => 'required|string|max:100',
            'sub_district' => 'required|string|max:100',
            'village' => 'required|string|max:100',
            'village_code' => 'required|string|max:20',
            'location' => 'required|string|max:255',
            'landmark' => 'nullable|string|max:255',
            'close_shot1' => 'nullable|string', // Base64 encoded image or file path
            'close_shot_2' => 'nullable|string',
            'long_shot_1' => 'nullable|string',
            'long_shot_2' => 'nullable|string',
            'remarks' => 'nullable|string|max:1000',
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'width' => 'nullable|numeric|min:0',
            'height' => 'nullable|numeric|min:0',
            'status' => 'nullable|in:pending,approved,rejected,completed,in_progress',
            'product_type' => 'nullable|string|in:Motor,Health,Crop',
        ]);

        // Additional validation for plan_id if it's not 0 or null
        if ($request->filled('plan_id') && $request->plan_id > 0) {
            $planExists = \App\Models\RoutePlan::where('id', $request->plan_id)->exists();
            if (! $planExists) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => [
                        'plan_id' => ['The selected plan id is invalid.'],
                    ],
                ], 422);
            }
        }

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            // Process image uploads
            $imageFields = ['close_shot1', 'close_shot_2', 'long_shot_1', 'long_shot_2'];
            $processedData = $request->all();

            foreach ($imageFields as $field) {
                if ($request->has($field) && $request->$field) {
                    $processedData[$field] = $this->processPhotoUpload($request->$field, $field);
                }
            }

            $activity = ActivityRecce::create($processedData);

            return response()->json([
                'success' => true,
                'message' => 'Activity recce created successfully',
                'data' => $activity->load(['promoter', 'routePlan']),
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create activity recce',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(ActivityRecce $activityRecce)
    {
        // Check if user has permission to view activity recces
        if (! Auth::user()->hasPermissionTo('activity_recces.view')) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have permission to view activity recces',
            ], 403);
        }

        $activityRecce->load(['promoter', 'routePlan']);

        return response()->json([
            'success' => true,
            'data' => $activityRecce,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, ActivityRecce $activityRecce)
    {
        // Check if user has permission to edit activity recces
        if (! Auth::user()->hasPermissionTo('activity_recces.edit')) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have permission to edit activity recces',
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'visit_date' => 'required|date',
            'plan_id' => 'nullable|numeric|min:0',
            'device_id' => 'nullable|string|max:100',
            'state' => 'required|string|max:100',
            'district' => 'required|string|max:100',
            'sub_district' => 'required|string|max:100',
            'village' => 'required|string|max:100',
            'village_code' => 'required|string|max:20',
            'location' => 'required|string|max:255',
            'landmark' => 'nullable|string|max:255',
            'close_shot1' => 'nullable|string',
            'close_shot_2' => 'nullable|string',
            'long_shot_1' => 'nullable|string',
            'long_shot_2' => 'nullable|string',
            'remarks' => 'nullable|string|max:1000',
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'width' => 'nullable|numeric|min:0',
            'height' => 'nullable|numeric|min:0',
            'status' => 'nullable|in:pending,approved,rejected',
            'product_type' => 'nullable|string|in:Motor,Health,Crop',
        ]);

        // Additional validation for plan_id if it's not 0 or null
        if ($request->filled('plan_id') && $request->plan_id > 0) {
            $planExists = \App\Models\RoutePlan::where('id', $request->plan_id)->exists();
            if (! $planExists) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => [
                        'plan_id' => ['The selected plan id is invalid.'],
                    ],
                ], 422);
            }
        }

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            // Process image uploads
            $imageFields = ['close_shot1', 'close_shot_2', 'long_shot_1', 'long_shot_2'];
            $updateData = $request->all();

            foreach ($imageFields as $field) {
                if ($request->has($field) && $request->$field) {
                    // Only process if it's a new base64 image
                    if (str_contains($request->$field, 'data:image')) {
                        $updateData[$field] = $this->processPhotoUpload($request->$field, $field);
                    }
                }
            }

            $activityRecce->update($updateData);

            return response()->json([
                'success' => true,
                'message' => 'Activity recce updated successfully',
                'data' => $activityRecce->load(['promoter', 'routePlan']),
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update activity recce',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(ActivityRecce $activityRecce)
    {
        // Check if user has permission to delete activity recces
        if (! Auth::user()->hasPermissionTo('activity_recces.delete')) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have permission to delete activity recces',
            ], 403);
        }

        try {
            // Delete associated photos
            if ($activityRecce->photos && is_array($activityRecce->photos)) {
                foreach ($activityRecce->photos as $photoUrl) {
                    if (Storage::exists($photoUrl)) {
                        Storage::delete($photoUrl);
                    }
                }
            }

            $activityRecce->delete();

            return response()->json([
                'success' => true,
                'message' => 'Activity recce deleted successfully',
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete activity recce',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update activity status.
     */
    public function updateStatus(Request $request, ActivityRecce $activityRecce)
    {
        // Check if user has permission to edit activity recces
        if (! Auth::user()->hasPermissionTo('activity_recces.edit')) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have permission to edit activity recces',
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'status' => 'required|in:pending,approved,rejected,in_progress,completed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid status',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $status = $request->get('status');

            switch ($status) {
                case 'completed':
                    $activityRecce->markCompleted();
                    break;
                case 'in_progress':
                    $activityRecce->markInProgress();
                    break;
                case 'cancelled':
                    $activityRecce->cancel();
                    break;
                default:
                    // For pending, approved, rejected - just update the status directly
                    $activityRecce->status = $status;
                    $activityRecce->save();
            }

            return response()->json([
                'success' => true,
                'message' => 'Activity status updated successfully',
                'data' => $activityRecce,
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
     * Get activity types for dropdown.
     */
    public function getActivityTypes()
    {
        $activityTypes = ActivityRecce::distinct('activity_type')
            ->pluck('activity_type')
            ->sort()
            ->values();

        return response()->json([
            'success' => true,
            'data' => $activityTypes,
        ]);
    }

    /**
     * Get dashboard statistics.
     */
    public function getDashboardStats(Request $request)
    {
        $startDate = $request->get('start_date');
        $endDate = $request->get('end_date');

        $query = ActivityRecce::query();

        if ($startDate && $endDate) {
            $query->whereBetween('completed_at', [$startDate, $endDate]);
        }

        $activities = $query->get();

        $stats = [
            'total_activities' => $activities->count(),
            'completed_activities' => $activities->where('status', 'completed')->count(),
            'pending_activities' => $activities->where('status', 'pending')->count(),
            'in_progress_activities' => $activities->where('status', 'in_progress')->count(),
            'cancelled_activities' => $activities->where('status', 'cancelled')->count(),
            'total_audience_reached' => $activities->sum('actual_audience'),
            'average_feedback_rating' => $activities->where('feedback_rating', '>', 0)->avg('feedback_rating'),
            'activities_by_type' => $activities->groupBy('activity_type')->map(function ($group) {
                return $group->count();
            }),
            'recent_activities' => ActivityRecce::with(['promoter', 'routePlan'])
                ->orderBy('created_at', 'desc')
                ->take(5)
                ->get(),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }

    /**
     * Create a single Activity Recce via API.
     */
    public function createSingle(ActivityRecceStoreRequest $request)
    {
        // Check if user has permission to create activity recces
        if (! Auth::user()->hasPermissionTo('activity_recces.create')) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have permission to create activity recces',
            ], 403);
        }

        try {
            DB::beginTransaction();

            $validatedData = $request->validated();

            // Set default status if not provided
            if (! isset($validatedData['status'])) {
                $validatedData['status'] = 'pending';
            }

            // Process image uploads if they are base64 encoded
            $imageFields = ['close_shot1', 'close_shot_2', 'long_shot_1', 'long_shot_2'];
            foreach ($imageFields as $field) {
                if (isset($validatedData[$field]) && ! empty($validatedData[$field])) {
                    $validatedData[$field] = $this->processPhotoUpload($validatedData[$field], $field);
                }
            }

            $activityRecce = ActivityRecce::create($validatedData);
            $activityRecce->load(['promoter', 'routePlan']);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Activity Recce created successfully',
                'data' => [
                    'activity_recce' => new ActivityRecceResource($activityRecce),
                    'mapping' => [
                        'local_id' => $validatedData['local_id'] ?? null,
                        'server_id' => $activityRecce->id,
                    ],
                ],
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Failed to create Activity Recce',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Create multiple Activity Recces via API (Bulk creation).
     */
    public function createBulk(ActivityRecceBulkStoreRequest $request)
    {
        // Check if user has permission to create activity recces
        if (! Auth::user()->hasPermissionTo('activity_recces.create')) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have permission to create activity recces',
            ], 403);
        }

        try {
            DB::beginTransaction();

            $validatedData = $request->validated();
            $activities = $validatedData['activities'];

            $createdActivities = [];
            $mappings = [];
            $errors = [];

            foreach ($activities as $index => $activityData) {
                try {
                    // Set default status if not provided
                    if (! isset($activityData['status'])) {
                        $activityData['status'] = 'pending';
                    }

                    // Process image uploads if they are base64 encoded
                    $imageFields = ['close_shot1', 'close_shot_2', 'long_shot_1', 'long_shot_2'];
                    foreach ($imageFields as $field) {
                        if (isset($activityData[$field]) && ! empty($activityData[$field])) {
                            $activityData[$field] = $this->processPhotoUpload($activityData[$field], $field);
                        }
                    }

                    $activityRecce = ActivityRecce::create($activityData);
                    $activityRecce->load(['promoter', 'routePlan']);

                    $createdActivities[] = new ActivityRecceResource($activityRecce);

                    // Store local_id to server_id mapping
                    $mappings[] = [
                        'local_id' => $activityData['local_id'] ?? null,
                        'server_id' => $activityRecce->id,
                        'index' => $index,
                    ];

                } catch (\Exception $e) {
                    $errors[] = [
                        'index' => $index,
                        'local_id' => $activityData['local_id'] ?? null,
                        'error' => $e->getMessage(),
                    ];
                }
            }

            DB::commit();

            $responseCode = empty($errors) ? 201 : 207; // 207 Multi-Status if there are partial errors

            return response()->json([
                'success' => empty($errors),
                'message' => empty($errors)
                    ? 'All Activity Recces created successfully'
                    : 'Some Activity Recces failed to create',
                'data' => [
                    'created_count' => count($createdActivities),
                    'total_count' => count($activities),
                    'error_count' => count($errors),
                    'activity_recces' => $createdActivities,
                    'mappings' => $mappings,
                    'errors' => $errors,
                ],
            ], $responseCode);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Failed to create Activity Recces',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Process photo upload (Base64 to storage).
     */
    private function processPhotoUpload($photoData, $fieldName)
    {
        if (str_contains($photoData, 'data:image')) {
            // Extract base64 data
            $photo = substr($photoData, strpos($photoData, ',') + 1);
            $photo = base64_decode($photo);

            // Generate filename
            $filename = 'activity_recce_images/'.uniqid().'_'.$fieldName.'.jpg';

            // Store the file
            Storage::put($filename, $photo);

            return $filename;
        }

        return $photoData; // Return as-is if not base64
    }

    /**
     * Bulk update status for multiple activities.
     */
    public function bulkUpdateStatus(Request $request)
    {
        // Check if user has permission to edit activity recces
        if (! Auth::user()->hasPermissionTo('activity_recces.edit')) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have permission to edit activity recces',
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'ids' => 'required|array|min:1',
            'ids.*' => 'exists:activity_recces,id',
            'status' => 'required|in:pending,approved,rejected,in_progress,completed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $ids = $request->get('ids');
            $status = $request->get('status');

            $updatedCount = ActivityRecce::whereIn('id', $ids)->update(['status' => $status]);

            return response()->json([
                'success' => true,
                'message' => "Successfully updated {$updatedCount} activities to {$status}",
                'updated_count' => $updatedCount,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update activity statuses',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Export activities as PowerPoint presentation
     */
    public function exportPpt(Request $request)
    {
        // Check if user has permission to view activity recces
        if (! Auth::user()->hasPermissionTo('activity_recces.view')) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have permission to export activity recces',
            ], 403);
        }

        // Validate that state is selected for performance optimization
        if (! $request->filled('state') || $request->state === 'all') {
            return response()->json([
                'success' => false,
                'message' => 'Please select a specific state before exporting PowerPoint presentation. Exporting all states at once is not allowed for performance reasons.',
                'error_code' => 'STATE_REQUIRED',
            ], 422);
        }

        try {
            $query = ActivityRecce::with([
                'promoter:id,name,username,state,district',
                'routePlan:id,state,district,sub_district,village,village_code,width,height',
            ]);

            // Apply state filtering based on user permissions
            $query->forUserStates();

            // Apply required state filter
            $query->where('state', $request->state);

            // Apply other filters
            if ($request->filled('status') && $request->status !== 'all') {
                $query->where('status', $request->status);
            }

            if ($request->filled('district') && $request->district !== 'all') {
                $query->where('district', $request->district);
            }

            if ($request->filled('promoter_id') && $request->promoter_id !== 'all') {
                $query->where('promoter_id', $request->promoter_id);
            }

            // Handle date filtering
            if ($request->filled('date_filter')) {
                $dateFilter = $request->get('date_filter');
                $today = now()->toDateString();

                switch ($dateFilter) {
                    case 'today':
                        $query->whereDate('visit_date', $today);
                        break;
                    case 'week':
                        $query->whereDate('visit_date', '>=', now()->subDays(7)->toDateString())
                            ->whereDate('visit_date', '<=', $today);
                        break;
                    case 'month':
                        $query->whereDate('visit_date', '>=', now()->subDays(30)->toDateString())
                            ->whereDate('visit_date', '<=', $today);
                        break;
                }
            } elseif ($request->has('start_date') || $request->has('end_date')) {
                // Handle custom date range
                if ($request->filled('start_date')) {
                    $query->whereDate('visit_date', '>=', $request->get('start_date'));
                }
                if ($request->filled('end_date')) {
                    $query->whereDate('visit_date', '<=', $request->get('end_date'));
                }
            }

            // Search functionality
            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('village', 'like', "%{$search}%")
                        ->orWhere('district', 'like', "%{$search}%")
                        ->orWhere('sub_district', 'like', "%{$search}%")
                        ->orWhere('village_code', 'like', "%{$search}%")
                        ->orWhere('location', 'like', "%{$search}%")
                        ->orWhere('wall_code', 'like', "%{$search}%")
                        ->orWhere('landmark', 'like', "%{$search}%")
                        ->orWhere('promoter_remarks', 'like', "%{$search}%")
                        ->orWhere('remarks', 'like', "%{$search}%");
                });
            }

            // Limit results for performance - max 100 activities per export
            $activities = $query->orderBy('visit_date', 'desc')->limit(100)->get();

            if ($activities->isEmpty()) {
                return response()->json([
                    'success' => false,
                    'message' => 'No activities found for the selected state and filters',
                ], 404);
            }

            // Create PowerPoint presentation
            $presentation = new \PhpOffice\PhpPresentation\PhpPresentation;
            $presentation->getDocumentProperties()
                ->setCreator('Li Council Activity Management')
                ->setTitle('Activity Report - '.TextFormattingService::formatLocation($request->state))
                ->setSubject('Activity Recce Report for '.TextFormattingService::formatLocation($request->state))
                ->setDescription('Generated activity report with images for '.TextFormattingService::formatLocation($request->state).' state');

            // Remove default slide
            $presentation->removeSlideByIndex(0);

            // Process activities in smaller batches for better memory management
            $batchSize = 5; // Reduced batch size for better performance
            $activityChunks = $activities->chunk($batchSize);
            $slideNumber = 1;
            $totalActivities = $activities->count();
            $totalActivities = $activities->count();

            foreach ($activityChunks as $chunk) {
                foreach ($chunk as $activity) {
                    $slide = $presentation->createSlide();

                    // Title with state information
                    $titleShape = $slide->createRichTextShape()
                        ->setHeight(40)
                        ->setWidth(720)
                        ->setOffsetX(40)
                        ->setOffsetY(10);

                    $titleShape->getActiveParagraph()->getAlignment()
                        ->setHorizontal(\PhpOffice\PhpPresentation\Style\Alignment::HORIZONTAL_CENTER);

                    $textRun = $titleShape->createTextRun('Activity #'.$activity->id.' - '.TextFormattingService::formatLocation($request->state));
                    $textRun->getFont()
                        ->setBold(true)
                        ->setSize(18)
                        ->setColor(new \PhpOffice\PhpPresentation\Style\Color('FF000000'));

                    // Activity details - optimized layout
                    $detailsShape = $slide->createRichTextShape()
                        ->setHeight(80)
                        ->setWidth(720)
                        ->setOffsetX(40)
                        ->setOffsetY(55);

                    // Line 1: Location information with sentence case formatting
                    $line1 = 'State: '.TextFormattingService::formatLocation($activity->state ?? 'N/A').' | District: '.TextFormattingService::formatLocation($activity->district ?? 'N/A').' | Sub District: '.TextFormattingService::formatLocation($activity->sub_district ?? 'N/A');
                    // Line 2: Village and other details with sentence case formatting
                    $line2 = 'Village: '.TextFormattingService::formatLocation($activity->village ?? 'N/A').' | Promoter: '.TextFormattingService::formatDisplayValue($activity->promoter->name ?? 'N/A').' | Date: '.($activity->visit_date ? $activity->visit_date->format('Y-m-d') : 'N/A');
                    // Line 3: Status and location details with sentence case formatting
                    $line3 = 'Status: '.TextFormattingService::formatStatus($activity->status ?? 'N/A').' | Location: '.TextFormattingService::formatDisplayValue($activity->location ?? 'N/A');

                    $details = $line1."\n".$line2."\n".$line3;

                    $detailsShape->createTextRun($details)
                        ->getFont()
                        ->setSize(10)
                        ->setColor(new \PhpOffice\PhpPresentation\Style\Color('FF000000'));

                    // Add only close shot images (2 images max) with larger size
                    $imageCount = 0;
                    $imageFields = ['close_shot1', 'close_shot_2']; // Only use close shots

                    // Image area starts at Y=150, side-by-side layout
                    $imageStartY = 150;
                    $leftImageX = 80;   // Left image position
                    $rightImageX = 380; // Right image position
                    $imageWidth = 300;  // Increased width for better visibility
                    $imageHeight = 225; // Increased height for better visibility

                    foreach ($imageFields as $index => $field) {
                        $imageUrl = $activity->{$field};
                        if (! empty($imageUrl) && $imageCount < 2) {
                            try {
                                // Optimized image loading with timeout
                                if (filter_var($imageUrl, FILTER_VALIDATE_URL)) {
                                    $context = stream_context_create([
                                        'http' => [
                                            'timeout' => 5, // Reduced timeout for better performance
                                            'user_agent' => 'Li-Council-PPT-Export/1.0',
                                        ],
                                    ]);

                                    $imageContent = @file_get_contents($imageUrl, false, $context);
                                    if ($imageContent !== false && strlen($imageContent) > 0) {
                                        // Create temporary file with proper extension
                                        $extension = pathinfo(parse_url($imageUrl, PHP_URL_PATH), PATHINFO_EXTENSION) ?: 'jpg';
                                        $tempPath = tempnam(sys_get_temp_dir(), 'ppt_image_').'.'.$extension;
                                        file_put_contents($tempPath, $imageContent);

                                        // Add image to slide
                                        $imageShape = $slide->createDrawingShape();
                                        $imageShape->setName('Close Shot '.($imageCount + 1))
                                            ->setDescription('Activity Close Shot Image')
                                            ->setPath($tempPath);

                                        // Position images side-by-side (left and right)
                                        if ($imageCount == 0) {
                                            // Left image
                                            $imageShape->setOffsetX($leftImageX)
                                                ->setOffsetY($imageStartY);
                                        } else {
                                            // Right image
                                            $imageShape->setOffsetX($rightImageX)
                                                ->setOffsetY($imageStartY);
                                        }

                                        $imageShape->setWidth($imageWidth)->setHeight($imageHeight);
                                        $imageCount++;

                                        // Schedule cleanup
                                        register_shutdown_function(function () use ($tempPath) {
                                            if (file_exists($tempPath)) {
                                                @unlink($tempPath);
                                            }
                                        });
                                    }
                                }
                            } catch (\Exception $e) {
                                // Continue if image fails to load
                                error_log("Failed to load image {$imageUrl}: ".$e->getMessage());

                                continue;
                            }
                        }
                    }

                    // Add page number and progress indicator
                    $pageShape = $slide->createRichTextShape()
                        ->setHeight(25)
                        ->setWidth(200)
                        ->setOffsetX(520)
                        ->setOffsetY(515);

                    $pageShape->getActiveParagraph()->getAlignment()
                        ->setHorizontal(\PhpOffice\PhpPresentation\Style\Alignment::HORIZONTAL_RIGHT);

                    $pageShape->createTextRun("Page {$slideNumber} of {$totalActivities}")
                        ->getFont()
                        ->setSize(9)
                        ->setColor(new \PhpOffice\PhpPresentation\Style\Color('FF666666'));

                    $slideNumber++;

                    // More frequent memory cleanup for better performance
                    if ($slideNumber % 3 == 0) {
                        gc_collect_cycles();
                    }
                }
            }

            // Generate filename with state information
            $timestamp = now()->format('Y-m-d_H-i-s');
            $stateName = str_replace(' ', '_', $request->state);
            $filename = "activities_presentation_{$stateName}_{$timestamp}.pptx";

            // Create writer and save to temporary file
            $writer = \PhpOffice\PhpPresentation\IOFactory::createWriter($presentation, 'PowerPoint2007');
            $tempFile = tempnam(sys_get_temp_dir(), 'ppt_export_');
            $writer->save($tempFile);

            // Return file as download
            return response()->download($tempFile, $filename, [
                'Content-Type' => 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                'Content-Disposition' => 'attachment; filename="'.$filename.'"',
                'Cache-Control' => 'no-cache, no-store, must-revalidate',
                'Pragma' => 'no-cache',
                'Expires' => '0',
            ])->deleteFileAfterSend(true);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'PowerPoint export failed: '.$e->getMessage(),
            ], 500);
        }
    }

    /**
     * Export activities as CSV with all filters applied
     */
    public function exportCsv(Request $request)
    {
        // Check if user has permission to view activity recces
        if (! Auth::user()->hasPermissionTo('activity_recces.view')) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have permission to export activity recces',
            ], 403);
        }

        try {
            // Generate filename with timestamp
            $timestamp = now()->format('Y-m-d_H-i-s');
            $filename = "activities_export_{$timestamp}.csv";

            // Return streaming response for large datasets
            return response()->stream(function () use ($request) {
                // Open output stream
                $handle = fopen('php://output', 'w');

                // Add UTF-8 BOM for proper Excel encoding
                fwrite($handle, "\xEF\xBB\xBF");

                // Write CSV headers
                $headers = [
                    'ID',
                    'Wall Code',
                    'Visit Date',
                    'Visit Time',
                    'State',
                    'District',
                    'Sub District',
                    'Village',
                    'Village Code',
                    'Location',
                    'Landmark',
                    'Product Type',
                    'Width',
                    'Height',
                    'Latitude',
                    'Longitude',
                    'Promoter Name',
                    'Promoter Username',
                    'Status',
                    'Client Status',
                    'Promoter Remarks',
                    'Admin Remarks',
                    'Close Shot 1',
                    'Close Shot 2',
                    'Long Shot 1',
                    'Long Shot 2',
                    'Created At',
                    'Updated At',
                ];
                fputcsv($handle, $headers);

                // Build query with all the same filters as the index method
                $query = ActivityRecce::with([
                    'promoter:id,name,username,state,district',
                    'routePlan:id,state,district,sub_district,village,village_code,width,height',
                ])
                    ->select([
                        'id', 'visit_date', 'plan_id', 'promoter_id', 'device_id', 'local_id',
                        'state', 'district', 'sub_district', 'village', 'village_code', 'wall_code',
                        'location', 'landmark', 'width', 'height', 'promoter_remarks', 'remarks',
                        'status', 'product_type', 'client_status', 'created_at', 'updated_at',
                        'close_shot1', 'close_shot_2', 'long_shot_1', 'long_shot_2',
                        'latitude', 'longitude',
                    ]);

                // Apply state filtering based on user permissions
                $query->forUserStates();

                // Apply all filters exactly like the index method
                if ($request->filled('status') && $request->status !== 'all') {
                    $query->where('status', $request->status);
                }

                if ($request->filled('state') && $request->state !== 'all') {
                    $query->where('state', $request->state);
                }

                if ($request->filled('district') && $request->district !== 'all') {
                    $query->where('district', $request->district);
                }

                if ($request->filled('sub_district') && $request->sub_district !== 'all') {
                    $query->where('sub_district', $request->sub_district);
                }

                if ($request->filled('village') && $request->village !== 'all') {
                    $query->where('village', $request->village);
                }

                if ($request->filled('promoter_id') && $request->promoter_id !== 'all') {
                    $query->where('promoter_id', $request->promoter_id);
                }

                // Handle date filtering
                if ($request->filled('date_filter')) {
                    $dateFilter = $request->get('date_filter');
                    $today = now()->toDateString();

                    switch ($dateFilter) {
                        case 'today':
                            $query->whereDate('visit_date', $today);
                            break;
                        case 'week':
                            $query->whereDate('visit_date', '>=', now()->subDays(7)->toDateString())
                                ->whereDate('visit_date', '<=', $today);
                            break;
                        case 'month':
                            $query->whereDate('visit_date', '>=', now()->subDays(30)->toDateString())
                                ->whereDate('visit_date', '<=', $today);
                            break;
                    }
                } elseif ($request->has('start_date') || $request->has('end_date')) {
                    // Handle custom date range
                    if ($request->filled('start_date')) {
                        $query->whereDate('visit_date', '>=', $request->get('start_date'));
                    }
                    if ($request->filled('end_date')) {
                        $query->whereDate('visit_date', '<=', $request->get('end_date'));
                    }
                }

                // Search functionality - same as index method
                if ($request->filled('search')) {
                    $search = $request->search;
                    $query->where(function ($q) use ($search) {
                        $q->where('village', 'like', "%{$search}%")
                            ->orWhere('state', 'like', "%{$search}%")
                            ->orWhere('district', 'like', "%{$search}%")
                            ->orWhere('sub_district', 'like', "%{$search}%")
                            ->orWhere('village_code', 'like', "%{$search}%")
                            ->orWhere('location', 'like', "%{$search}%")
                            ->orWhere('wall_code', 'like', "%{$search}%")
                            ->orWhere('landmark', 'like', "%{$search}%")
                            ->orWhere('promoter_remarks', 'like', "%{$search}%")
                            ->orWhere('remarks', 'like', "%{$search}%");
                    });
                }

                // Order by visit_date descending for latest first
                $query->orderBy('visit_date', 'desc')
                    ->orderBy('created_at', 'desc');

                // Stream data in chunks for memory efficiency (500 records at a time)
                $query->chunk(500, function ($activities) use ($handle) {
                    foreach ($activities as $activity) {
                        // Parse visit_date to extract date and time
                        $visitDateTime = $activity->visit_date ? \Carbon\Carbon::parse($activity->visit_date) : null;
                        $date = $visitDateTime ? $visitDateTime->format('Y-m-d') : '';
                        $time = $visitDateTime ? $visitDateTime->format('H:i:s') : '';

                        // Parse created_at and updated_at
                        $createdAt = $activity->created_at ? $activity->created_at->format('Y-m-d H:i:s') : '';
                        $updatedAt = $activity->updated_at ? $activity->updated_at->format('Y-m-d H:i:s') : '';

                        // Prepare row data with sentence case formatting for better visibility
                        $row = [
                            $activity->id ?? '',
                            TextFormattingService::formatDisplayValue($activity->wall_code ?? ''),
                            $date,
                            $time,
                            TextFormattingService::formatLocation($activity->state ?? ''),
                            TextFormattingService::formatLocation($activity->district ?? ''),
                            TextFormattingService::formatLocation($activity->sub_district ?? ''),
                            TextFormattingService::formatLocation($activity->village ?? ''),
                            TextFormattingService::formatDisplayValue($activity->village_code ?? ''),
                            TextFormattingService::formatDisplayValue($activity->location ?? ''),
                            TextFormattingService::formatDisplayValue($activity->landmark ?? ''),
                            TextFormattingService::formatDisplayValue($activity->product_type ?? ''),
                            $activity->width ?? '',
                            $activity->height ?? '',
                            $activity->latitude ?? '',
                            $activity->longitude ?? '',
                            TextFormattingService::formatDisplayValue($activity->promoter->name ?? ''),
                            $activity->promoter->username ?? '',
                            TextFormattingService::formatStatus($activity->status ?? ''),
                            TextFormattingService::formatStatus($activity->client_status ?? ''),
                            TextFormattingService::formatDisplayValue($activity->promoter_remarks ?? ''),
                            TextFormattingService::formatDisplayValue($activity->remarks ?? ''),
                            $activity->close_shot1 ?? '',
                            $activity->close_shot_2 ?? '',
                            $activity->long_shot_1 ?? '',
                            $activity->long_shot_2 ?? '',
                            $createdAt,
                            $updatedAt,
                        ];

                        fputcsv($handle, $row);
                    }
                });

                fclose($handle);
            }, 200, [
                'Content-Type' => 'text/csv; charset=utf-8',
                'Content-Disposition' => "attachment; filename=\"{$filename}\"",
                'Cache-Control' => 'no-cache, no-store, must-revalidate',
                'Pragma' => 'no-cache',
                'Expires' => '0',
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'CSV export failed: '.$e->getMessage(),
            ], 500);
        }
    }

    /**
     * Fix N/A values in village_code and wall_code columns
     */
    public function fixNAValues(Request $request)
    {
        // Check if user has permission to edit activity recces
        if (! Auth::user()->hasPermissionTo('activity_recces.edit')) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have permission to edit activity recces',
            ], 403);
        }

        try {
            DB::beginTransaction();

            // Find activities with #N/A values and get the count
            $activitiesWithNA = ActivityRecce::whereIn('plan_id', function ($query) {
                $query->select('id')
                    ->from('route_plans')
                    ->whereNotNull('village_code')
                    ->where('village_code', '!=', '#N/A');
            })
            ->where('village_code', '#N/A')
            ->get();

            if ($activitiesWithNA->isEmpty()) {
                return response()->json([
                    'success' => true,
                    'message' => 'No records with #N/A values found',
                    'updated_count' => 0,
                ]);
            }

            $updatedCount = 0;

            // Group by plan_id for efficient processing
            $groupedActivities = $activitiesWithNA->groupBy('plan_id');

            foreach ($groupedActivities as $planId => $activities) {
                // Get the correct village code from route_plans
                $routePlan = DB::table('route_plans')
                    ->where('id', $planId)
                    ->whereNotNull('village_code')
                    ->where('village_code', '!=', '#N/A')
                    ->first(['village_code']);

                if (!$routePlan || !$routePlan->village_code) {
                    continue;
                }

                $correctVillageCode = $routePlan->village_code;

                // Update all activities for this plan
                foreach ($activities as $activity) {
                    $newWallCode = str_replace('#N/A', $correctVillageCode, $activity->wall_code);

                    ActivityRecce::where('id', $activity->id)
                        ->update([
                            'village_code' => $correctVillageCode,
                            'wall_code' => $newWallCode,
                            'updated_at' => now(),
                        ]);

                    $updatedCount++;
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => "Successfully updated {$updatedCount} records with correct village codes",
                'updated_count' => $updatedCount,
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Fix operation failed: ' . $e->getMessage(),
            ], 500);
        }
    }
}
