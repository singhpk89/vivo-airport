<?php

namespace App\Http\Controllers\Api\Mobile;

use App\Http\Controllers\Controller;
use App\Models\ActivityRecce;
use App\Services\TextFormattingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use PhpOffice\PhpPresentation\PhpPresentation;
use PhpOffice\PhpPresentation\IOFactory;

class ActivityController extends Controller
{
    /**
     * Create activity with image uploads (multipart/form-data)
     */
    public function createWithImages(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'local_id' => 'nullable|string|max:255', // Mobile local ID for tracking
            'plan_id' => 'required|integer|min:0', // Allow 0 as valid plan_id value
            'visit_date' => 'required|date',
            'device_id' => 'nullable|string|max:255',
            'state' => 'nullable|string|max:255',
            'district' => 'nullable|string|max:255',
            'sub_district' => 'nullable|string|max:255',
            'village' => 'nullable|string|max:255',
            'village_code' => 'nullable|string|max:255',
            'product_type' => 'nullable|string|max:255',
            'location' => 'required|string|max:255',
            'landmark' => 'nullable|string|max:255',
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'remarks' => 'nullable|string|max:1000',
            'close_shot1' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:10240',
            'close_shot_2' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:10240',
            'long_shot_1' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:10240',
            'long_shot_2' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:10240',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        // Additional validation for plan_id and set default dimensions
        $planId = $request->input('plan_id');
        $width = 8; // Default width
        $height = 5; // Default height

        if ($planId > 0) {
            // Validate that route plan exists if plan_id is not 0
            $routePlan = \App\Models\RoutePlan::find($planId);
            if ($routePlan) {
                // Use route plan dimensions if available
                $width = $routePlan->width ?? 8;
                $height = $routePlan->height ?? 5;
            } else {
                // Route plan not found, use default dimensions but continue processing
                $width = 8;
                $height = 5;
            }
        }

        try {
            // Check for existing activity (duplicate detection)
            $existingActivity = null;
            $isUpdate = false;

            // First check by local_id if provided
            if (! empty($request->input('local_id'))) {
                $existingActivity = ActivityRecce::where('local_id', $request->input('local_id'))
                    ->where('promoter_id', Auth::id())
                    ->first();
            }

            // If no match by local_id, check by location, date, and promoter (duplicate location/date detection)
            if (! $existingActivity) {
                $existingActivity = ActivityRecce::where('promoter_id', Auth::id())
                    ->where('visit_date', $request->input('visit_date'))
                    ->where('location', $request->input('location'))
                    ->where('latitude', $request->input('latitude'))
                    ->where('longitude', $request->input('longitude'))
                    ->first();
            }

            // Prepare activity data
            $activityData = $request->only([
                'local_id', 'plan_id', 'visit_date', 'device_id', 'state', 'district', 'sub_district',
                'village', 'village_code', 'product_type', 'location', 'landmark',
                'latitude', 'longitude', 'remarks',
            ]);

            $activityData['promoter_id'] = Auth::id();
            $activityData['status'] = 'pending';
            $activityData['width'] = $width;
            $activityData['height'] = $height;

            // Upload images to S3 if provided
            $imageUrls = [];

            // Handle image uploads to S3
            $imageFields = ['close_shot1', 'close_shot_2', 'long_shot_1', 'long_shot_2'];
            foreach ($imageFields as $field) {
                if ($request->hasFile($field)) {
                    $image = $request->file($field);

                    // Generate unique filename
                    $filename = Str::random(32).'.'.$image->getClientOriginalExtension();
                    $path = 'activities/'.date('Y/m/d')."/{$filename}";

                    // Upload to S3
                    $uploaded = Storage::disk('s3')->put($path, file_get_contents($image), 'public');

                    if ($uploaded) {
                        // Generate S3 URL
                        $bucket = env('AWS_BUCKET');
                        $region = env('AWS_DEFAULT_REGION');
                        $activityData[$field] = "https://{$bucket}.s3.{$region}.amazonaws.com/{$path}";
                    }
                }
            }

            // Create or update activity
            if ($existingActivity) {
                // Update existing activity
                $existingActivity->update($activityData);
                $activity = $existingActivity;
                $isUpdate = true;
            } else {
                // Create new activity
                $activity = ActivityRecce::create($activityData);
                $isUpdate = false;
            }

            // Generate wall_code: LI + village_code + server_id
            if (! empty($activityData['village_code'])) {
                $villageCode = $activityData['village_code'];
                // Remove "Oth_" prefix if present
                if (str_starts_with($villageCode, 'Oth_')) {
                    $villageCode = substr($villageCode, 4);
                }
                $wallCode = 'LI'.$villageCode.$activity->id;
                $activity->update(['wall_code' => $wallCode]);
            }

            // Load relationships
            $activity->load(['promoter', 'routePlan']);

            return response()->json([
                'success' => true,
                'message' => $isUpdate ? 'Activity updated successfully' : 'Activity created successfully',
                'is_update' => $isUpdate,
                'local_id' => $request->input('local_id'),
                'server_id' => $activity->id,
                'data' => [
                    'id' => $activity->id,
                    'local_id' => $request->input('local_id'),
                    'plan_id' => $activity->plan_id,
                    'visit_date' => $activity->visit_date,
                    'promoter_id' => $activity->promoter_id,
                    'location' => $activity->location,
                    'landmark' => $activity->landmark,
                    'village' => $activity->village,
                    'village_code' => $activity->village_code,
                    'wall_code' => $activity->wall_code,
                    'width' => $activity->width,
                    'height' => $activity->height,
                    'latitude' => $activity->latitude,
                    'longitude' => $activity->longitude,
                    'remarks' => $activity->remarks,
                    'close_shot1' => $activity->close_shot1,
                    'close_shot_2' => $activity->close_shot_2,
                    'long_shot_1' => $activity->long_shot_1,
                    'long_shot_2' => $activity->long_shot_2,
                    'status' => $activity->status,
                    'created_at' => $activity->created_at,
                    'promoter' => $activity->promoter ? [
                        'id' => $activity->promoter->id,
                        'name' => $activity->promoter->name,
                        'email' => $activity->promoter->email,
                    ] : null,
                    'route_plan' => $activity->routePlan ? [
                        'id' => $activity->routePlan->id,
                        'title' => $activity->routePlan->title,
                        'location' => $activity->routePlan->location,
                    ] : null,
                ],
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create activity: '.$e->getMessage(),
            ], 500);
        }
    }

    /**
     * Create activity with S3 URLs (JSON payload)
     */
    public function create(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'local_id' => 'nullable|string|max:255', // Mobile local ID for tracking
            'plan_id' => 'required|integer|min:0', // Allow 0 as valid plan_id value
            'visit_date' => 'required|date',
            'device_id' => 'nullable|string|max:255',
            'state' => 'nullable|string|max:255',
            'district' => 'nullable|string|max:255',
            'sub_district' => 'nullable|string|max:255',
            'village' => 'nullable|string|max:255',
            'village_code' => 'nullable|string|max:255',
            'product_type' => 'nullable|string|max:255',
            'location' => 'required|string|max:255',
            'landmark' => 'nullable|string|max:255',
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'remarks' => 'nullable|string|max:1000',
            'close_shot1' => 'nullable|url',
            'close_shot_2' => 'nullable|url',
            'long_shot_1' => 'nullable|url',
            'long_shot_2' => 'nullable|url',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'local_id' => $request->input('local_id'),
                'errors' => $validator->errors(),
            ], 422);
        }

        // Additional validation for plan_id and set default dimensions
        $planId = $request->input('plan_id');
        $width = 8; // Default width
        $height = 5; // Default height

        if ($planId > 0) {
            // Validate that route plan exists if plan_id is not 0
            $routePlan = \App\Models\RoutePlan::find($planId);
            if ($routePlan) {
                // Use route plan dimensions if available
                $width = $routePlan->width ?? 8;
                $height = $routePlan->height ?? 5;
            } else {
                // Route plan not found, use default dimensions but continue processing
                $width = 8;
                $height = 5;
            }
        }

        try {
            // Check for existing activity (duplicate detection)
            $existingActivity = null;
            $isUpdate = false;

            // First check by local_id if provided
            if (! empty($request->input('local_id'))) {
                $existingActivity = ActivityRecce::where('local_id', $request->input('local_id'))
                    ->where('promoter_id', Auth::id())
                    ->first();
            }

            // If no match by local_id, check by location, date, and promoter (duplicate location/date detection)
            if (! $existingActivity) {
                $existingActivity = ActivityRecce::where('promoter_id', Auth::id())
                    ->where('visit_date', $request->input('visit_date'))
                    ->where('location', $request->input('location'))
                    ->where('latitude', $request->input('latitude'))
                    ->where('longitude', $request->input('longitude'))
                    ->first();
            }

            // Prepare activity data
            $activityData = $request->only([
                'local_id', 'plan_id', 'visit_date', 'device_id', 'state', 'district', 'sub_district',
                'village', 'village_code', 'product_type', 'location', 'landmark',
                'latitude', 'longitude', 'remarks',
                'close_shot1', 'close_shot_2', 'long_shot_1', 'long_shot_2',
            ]);

            $activityData['promoter_id'] = Auth::id();
            $activityData['status'] = 'pending';
            $activityData['width'] = $width;
            $activityData['height'] = $height;

            // Create or update activity
            if ($existingActivity) {
                // Update existing activity
                $existingActivity->update($activityData);
                $activity = $existingActivity;
                $isUpdate = true;
            } else {
                // Create new activity
                $activity = ActivityRecce::create($activityData);
                $isUpdate = false;
            }

            // Generate wall_code: LI + village_code + server_id
            if (! empty($activityData['village_code'])) {
                $villageCode = $activityData['village_code'];
                // Remove "Oth_" prefix if present
                if (str_starts_with($villageCode, 'Oth_')) {
                    $villageCode = substr($villageCode, 4);
                }
                $wallCode = 'LI'.$villageCode.$activity->id;
                $activity->update(['wall_code' => $wallCode]);
            }

            // Load relationships
            $activity->load(['promoter', 'routePlan']);

            return response()->json([
                'success' => true,
                'message' => $isUpdate ? 'Activity updated successfully' : 'Activity created successfully',
                'is_update' => $isUpdate,
                'local_id' => $request->input('local_id'),
                'server_id' => $activity->id,
                'data' => [
                    'id' => $activity->id,
                    'plan_id' => $activity->plan_id,
                    'visit_date' => $activity->visit_date,
                    'promoter_id' => $activity->promoter_id,
                    'device_id' => $activity->device_id,
                    'state' => $activity->state,
                    'district' => $activity->district,
                    'sub_district' => $activity->sub_district,
                    'village' => $activity->village,
                    'village_code' => $activity->village_code,
                    'wall_code' => $activity->wall_code,
                    'product_type' => $activity->product_type,
                    'width' => $activity->width,
                    'height' => $activity->height,
                    'location' => $activity->location,
                    'landmark' => $activity->landmark,
                    'latitude' => $activity->latitude,
                    'longitude' => $activity->longitude,
                    'remarks' => $activity->remarks,
                    'close_shot1' => $activity->close_shot1,
                    'close_shot_2' => $activity->close_shot_2,
                    'long_shot_1' => $activity->long_shot_1,
                    'long_shot_2' => $activity->long_shot_2,
                    'status' => $activity->status,
                    'created_at' => $activity->created_at,
                    'promoter' => $activity->promoter ? [
                        'id' => $activity->promoter->id,
                        'name' => $activity->promoter->name,
                        'email' => $activity->promoter->email,
                    ] : null,
                    'route_plan' => $activity->routePlan ? [
                        'id' => $activity->routePlan->id,
                        'title' => $activity->routePlan->title,
                        'location' => $activity->routePlan->location,
                    ] : null,
                ],
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create activity: '.$e->getMessage(),
                'local_id' => $request->input('local_id'),
                'server_id' => null,
            ], 500);
        }
    }

    /**
     * Get activities list
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = ActivityRecce::with(['promoter', 'routePlan'])
                ->where('promoter_id', Auth::id());

            // Filter by plan_id if provided
            if ($request->has('plan_id')) {
                $query->where('plan_id', $request->get('plan_id'));
            }

            // Filter by status if provided
            if ($request->has('status')) {
                $query->where('status', $request->get('status'));
            }

            $activities = $query->orderBy('created_at', 'desc')->get();

            return response()->json([
                'success' => true,
                'message' => 'Activities retrieved successfully',
                'data' => $activities->map(function ($activity) {
                    return [
                        'id' => $activity->id,
                        'plan_id' => $activity->plan_id,
                        'visit_date' => $activity->visit_date,
                        'device_id' => $activity->device_id,
                        'state' => $activity->state,
                        'district' => $activity->district,
                        'sub_district' => $activity->sub_district,
                        'village' => $activity->village,
                        'village_code' => $activity->village_code,
                        'wall_code' => $activity->wall_code,
                        'product_type' => $activity->product_type,
                        'location' => $activity->location,
                        'landmark' => $activity->landmark,
                        'latitude' => $activity->latitude,
                        'longitude' => $activity->longitude,
                        'remarks' => $activity->remarks,
                        'close_shot1' => $activity->close_shot1,
                        'close_shot_2' => $activity->close_shot_2,
                        'long_shot_1' => $activity->long_shot_1,
                        'long_shot_2' => $activity->long_shot_2,
                        'status' => $activity->status,
                        'created_at' => $activity->created_at,
                        'route_plan' => $activity->routePlan ? [
                            'id' => $activity->routePlan->id,
                            'title' => $activity->routePlan->title,
                            'location' => $activity->routePlan->location,
                        ] : null,
                    ];
                }),
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve activities: '.$e->getMessage(),
            ], 500);
        }
    }

    /**
     * Create multiple activities with S3 URLs (Bulk upload)
     */
    public function createBulk(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'activities' => 'required|array|min:1|max:50', // Max 50 activities per batch
            'activities.*.local_id' => 'required|string|max:255', // Mobile local ID for tracking
            'activities.*.plan_id' => 'required|integer|min:0', // Allow 0 as valid plan_id value
            'activities.*.visit_date' => 'required|date',
            'activities.*.device_id' => 'nullable|string|max:255',
            'activities.*.state' => 'nullable|string|max:255',
            'activities.*.district' => 'nullable|string|max:255',
            'activities.*.sub_district' => 'nullable|string|max:255',
            'activities.*.village' => 'nullable|string|max:255',
            'activities.*.village_code' => 'nullable|string|max:255',
            'activities.*.product_type' => 'nullable|string|max:255',
            'activities.*.location' => 'required|string|max:255',
            'activities.*.landmark' => 'nullable|string|max:255',
            'activities.*.latitude' => 'required|numeric|between:-90,90',
            'activities.*.longitude' => 'required|numeric|between:-180,180',
            'activities.*.remarks' => 'nullable|string|max:1000',
            'activities.*.close_shot1' => 'nullable|url',
            'activities.*.close_shot_2' => 'nullable|url',
            'activities.*.long_shot_1' => 'nullable|url',
            'activities.*.long_shot_2' => 'nullable|url',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $activities = $request->input('activities');

            // Additional validation for plan_ids and dimension preparation
            $planDimensions = []; // Cache for plan dimensions
            foreach ($activities as $index => $activityData) {
                $planId = $activityData['plan_id'] ?? 0;
                if ($planId > 0 && ! isset($planDimensions[$planId])) {
                    // Validate that route plan exists if plan_id is not 0
                    $routePlan = \App\Models\RoutePlan::find($planId);
                    if ($routePlan) {
                        $planDimensions[$planId] = [
                            'width' => $routePlan->width ?? 8,
                            'height' => $routePlan->height ?? 5,
                        ];
                    } else {
                        // Route plan not found, use default dimensions
                        $planDimensions[$planId] = [
                            'width' => 8,
                            'height' => 5,
                        ];
                    }
                } elseif ($planId === 0) {
                    // Default dimensions for plan_id = 0
                    $planDimensions[0] = [
                        'width' => 8,
                        'height' => 5,
                    ];
                }
            }

            $successResults = [];
            $errorResults = [];
            $promoterId = Auth::id();

            foreach ($activities as $index => $activityData) {
                try {
                    // Check for existing activity (duplicate detection)
                    $existingActivity = null;
                    $isUpdate = false;

                    // First check by local_id if provided
                    if (! empty($activityData['local_id'])) {
                        $existingActivity = ActivityRecce::where('local_id', $activityData['local_id'])
                            ->where('promoter_id', $promoterId)
                            ->first();
                    }

                    // If no match by local_id, check by location, date, and promoter (duplicate location/date detection)
                    if (! $existingActivity) {
                        $existingActivity = ActivityRecce::where('promoter_id', $promoterId)
                            ->where('visit_date', $activityData['visit_date'])
                            ->where('location', $activityData['location'])
                            ->where('latitude', $activityData['latitude'])
                            ->where('longitude', $activityData['longitude'])
                            ->first();
                    }

                    // Prepare activity data
                    $planId = $activityData['plan_id'];

                    // Get dimensions for this plan_id
                    if (isset($planDimensions[$planId])) {
                        $dimensions = $planDimensions[$planId];
                    } else {
                        $dimensions = ['width' => 8, 'height' => 5]; // Default fallback
                    }

                    $createData = [
                        'local_id' => $activityData['local_id'],
                        'plan_id' => $planId, // Accept plan_id = 0 as valid value
                        'visit_date' => $activityData['visit_date'],
                        'promoter_id' => $promoterId,
                        'device_id' => $activityData['device_id'] ?? null,
                        'state' => $activityData['state'] ?? null,
                        'district' => $activityData['district'] ?? null,
                        'sub_district' => $activityData['sub_district'] ?? null,
                        'village' => $activityData['village'] ?? null,
                        'village_code' => $activityData['village_code'] ?? null,
                        'product_type' => $activityData['product_type'] ?? null,
                        'location' => $activityData['location'],
                        'landmark' => $activityData['landmark'] ?? null,
                        'latitude' => $activityData['latitude'],
                        'longitude' => $activityData['longitude'],
                        'remarks' => $activityData['remarks'] ?? null,
                        'width' => $dimensions['width'],
                        'height' => $dimensions['height'],
                        'close_shot1' => $activityData['close_shot1'] ?? null,
                        'close_shot_2' => $activityData['close_shot_2'] ?? null,
                        'long_shot_1' => $activityData['long_shot_1'] ?? null,
                        'long_shot_2' => $activityData['long_shot_2'] ?? null,
                        'status' => 'pending',
                    ];

                    // Create or update activity
                    if ($existingActivity) {
                        // Update existing activity
                        $existingActivity->update($createData);
                        $activity = $existingActivity;
                        $isUpdate = true;
                    } else {
                        // Create new activity
                        $activity = ActivityRecce::create($createData);
                        $isUpdate = false;
                    }

                    // Generate wall_code: LI + village_code + server_id
                    if (! empty($activityData['village_code'])) {
                        $villageCode = $activityData['village_code'];
                        // Remove "Oth_" prefix if present
                        if (str_starts_with($villageCode, 'Oth_')) {
                            $villageCode = substr($villageCode, 4);
                        }
                        $wallCode = 'LI'.$villageCode.$activity->id;
                        $activity->update(['wall_code' => $wallCode]);
                    }

                    $successResults[] = [
                        'local_id' => $activityData['local_id'],
                        'server_id' => $activity->id,
                        'index' => $index,
                        'status' => 'success',
                        'is_update' => $isUpdate,
                        'message' => $isUpdate ? 'Activity updated successfully' : 'Activity created successfully',
                    ];

                } catch (\Exception $e) {
                    $errorResults[] = [
                        'local_id' => $activityData['local_id'],
                        'server_id' => null,
                        'index' => $index,
                        'status' => 'error',
                        'message' => 'Failed to create activity: '.$e->getMessage(),
                    ];
                }
            }

            $totalCount = count($activities);
            $successCount = count($successResults);
            $errorCount = count($errorResults);

            return response()->json([
                'success' => $errorCount === 0,
                'message' => $errorCount === 0
                    ? "All {$totalCount} activities created successfully"
                    : "{$successCount} of {$totalCount} activities created successfully, {$errorCount} failed",
                'data' => [
                    'total_count' => $totalCount,
                    'success_count' => $successCount,
                    'error_count' => $errorCount,
                    'results' => array_merge($successResults, $errorResults),
                ],
            ], $errorCount === 0 ? 201 : 207); // 207 Multi-Status for partial success

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Bulk upload failed: '.$e->getMessage(),
                'data' => [
                    'total_count' => 0,
                    'success_count' => 0,
                    'error_count' => 0,
                    'results' => [],
                ],
            ], 500);
        }
    }

    /**
     * Export all activities to CSV with memory-efficient streaming
     */
    public function exportCsv(Request $request)
    {
        try {
            // Validate optional filters
            $validator = Validator::make($request->all(), [
                'promoter_id' => 'nullable|integer|exists:users,id',
                'status' => 'nullable|string|in:pending,approved,rejected',
                'plan_id' => 'nullable|integer',
                'start_date' => 'nullable|date',
                'end_date' => 'nullable|date|after_or_equal:start_date',
                'state' => 'nullable|string',
                'district' => 'nullable|string',
                'village_code' => 'nullable|string',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors(),
                ], 422);
            }

            // Generate filename with timestamp
            $timestamp = now()->format('Y-m-d_H-i-s');
            $filename = "activities_export_{$timestamp}.csv";

            // Return streaming response
            return response()->stream(function () use ($request) {
                // Open output stream
                $handle = fopen('php://output', 'w');

                // Add UTF-8 BOM for proper Excel encoding
                fwrite($handle, "\xEF\xBB\xBF");

                // Write CSV headers
                $headers = [
                    'Wall Code',
                    'Date',
                    'Time',
                    'State',
                    'District',
                    'Sub District',
                    'Village',
                    'Village Code',
                    'Location',
                    'Product Type',
                    'Landmark',
                    'Latitude',
                    'Longitude',
                    'Promoter Name',
                ];
                fputcsv($handle, $headers);

                // Build query with filters
                $query = DB::table('activity_recces')
                    ->join('users', 'activity_recces.promoter_id', '=', 'users.id')
                    ->select([
                        'activity_recces.wall_code',
                        'activity_recces.visit_date',
                        'activity_recces.state',
                        'activity_recces.district',
                        'activity_recces.sub_district',
                        'activity_recces.village',
                        'activity_recces.village_code',
                        'activity_recces.location',
                        'activity_recces.product_type',
                        'activity_recces.landmark',
                        'activity_recces.latitude',
                        'activity_recces.longitude',
                        'users.name as promoter_name',
                    ]);

                // Apply filters
                if ($request->filled('promoter_id')) {
                    $query->where('activity_recces.promoter_id', $request->get('promoter_id'));
                }

                if ($request->filled('status')) {
                    $query->where('activity_recces.status', $request->get('status'));
                }

                if ($request->filled('plan_id')) {
                    $query->where('activity_recces.plan_id', $request->get('plan_id'));
                }

                if ($request->filled('start_date')) {
                    $query->where('activity_recces.visit_date', '>=', $request->get('start_date'));
                }

                if ($request->filled('end_date')) {
                    $query->where('activity_recces.visit_date', '<=', $request->get('end_date'));
                }

                if ($request->filled('state')) {
                    $query->where('activity_recces.state', 'like', '%'.$request->get('state').'%');
                }

                if ($request->filled('district')) {
                    $query->where('activity_recces.district', 'like', '%'.$request->get('district').'%');
                }

                if ($request->filled('village_code')) {
                    $query->where('activity_recces.village_code', 'like', '%'.$request->get('village_code').'%');
                }

                // Order by visit_date descending for latest first
                $query->orderBy('activity_recces.visit_date', 'desc')
                    ->orderBy('activity_recces.created_at', 'desc');

                // Stream data in chunks for memory efficiency (1000 records at a time)
                $query->chunk(1000, function ($activities) use ($handle) {
                    foreach ($activities as $activity) {
                        // Parse visit_date to extract date and time
                        $visitDateTime = \Carbon\Carbon::parse($activity->visit_date);
                        $date = $visitDateTime->format('Y-m-d');
                        $time = $visitDateTime->format('H:i:s');

                        // Prepare row data with sentence case formatting for better visibility
                        $row = [
                            TextFormattingService::formatDisplayValue($activity->wall_code ?? ''),
                            $date,
                            $time,
                            TextFormattingService::formatLocation($activity->state ?? ''),
                            TextFormattingService::formatLocation($activity->district ?? ''),
                            TextFormattingService::formatLocation($activity->sub_district ?? ''),
                            TextFormattingService::formatLocation($activity->village ?? ''),
                            TextFormattingService::formatDisplayValue($activity->village_code ?? ''),
                            TextFormattingService::formatDisplayValue($activity->location ?? ''),
                            TextFormattingService::formatDisplayValue($activity->product_type ?? ''),
                            TextFormattingService::formatDisplayValue($activity->landmark ?? ''),
                            $activity->latitude ?? '',
                            $activity->longitude ?? '',
                            TextFormattingService::formatDisplayValue($activity->promoter_name ?? ''),
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
                'message' => 'Export failed: '.$e->getMessage(),
            ], 500);
        }
    }

    /**
     * Export activities as PowerPoint presentation with images
     */
    public function exportPpt(Request $request)
    {
        try {
            $user = Auth::user();
            $query = ActivityRecce::query()
                ->where('promoter_id', $user->id);

            // Apply filters
            if ($request->filled('status')) {
                $query->where('status', $request->status);
            }

            if ($request->filled('state')) {
                $query->where('state', 'like', '%'.$request->state.'%');
            }

            if ($request->filled('district')) {
                $query->where('district', 'like', '%'.$request->district.'%');
            }

            if ($request->filled('promoter_id')) {
                $query->where('promoter_id', $request->promoter_id);
            }

            // Date filters
            if ($request->filled('start_date')) {
                $query->whereDate('visit_date', '>=', $request->start_date);
            }

            if ($request->filled('end_date')) {
                $query->whereDate('visit_date', '<=', $request->end_date);
            }

            $activities = $query->orderBy('visit_date', 'desc')->get();

            if ($activities->isEmpty()) {
                return response()->json([
                    'success' => false,
                    'message' => 'No activities found for the current filters',
                ], 404);
            }

            // Create PowerPoint presentation
            $presentation = new \PhpOffice\PhpPresentation\PhpPresentation();
            $presentation->getDocumentProperties()
                ->setCreator('Li Council Activity Management')
                ->setTitle('Activity Report')
                ->setSubject('Activity Recce Report')
                ->setDescription('Generated activity report with images');

            // Remove default slide
            $presentation->removeSlideByIndex(0);

            // Process activities in batches for better memory management
            $batchSize = 10;
            $activityChunks = $activities->chunk($batchSize);
            $slideNumber = 1;

            foreach ($activityChunks as $chunk) {
                foreach ($chunk as $activity) {
                    $slide = $presentation->createSlide();

                    // Title - More compact
                    $titleShape = $slide->createRichTextShape()
                        ->setHeight(40)
                        ->setWidth(720)
                        ->setOffsetX(40)
                        ->setOffsetY(10);

                    $titleShape->getActiveParagraph()->getAlignment()
                        ->setHorizontal(\PhpOffice\PhpPresentation\Style\Alignment::HORIZONTAL_CENTER);

                    $textRun = $titleShape->createTextRun('Activity #' . $activity->id);
                    $textRun->getFont()
                        ->setBold(true)
                        ->setSize(20)
                        ->setColor(new \PhpOffice\PhpPresentation\Style\Color('FF000000'));

                    // Activity details - 2 lines format as requested
                    $detailsShape = $slide->createRichTextShape()
                        ->setHeight(60)
                        ->setWidth(720)
                        ->setOffsetX(40)
                        ->setOffsetY(55);

                    // Line 1: Location information with sentence case formatting
                    $line1 = "State: " . TextFormattingService::formatLocation($activity->state ?? 'N/A') . " | District: " . TextFormattingService::formatLocation($activity->district ?? 'N/A') . " | Sub District: " . TextFormattingService::formatLocation($activity->sub_district ?? 'N/A');
                    // Line 2: Village and other details with sentence case formatting
                    $line2 = "Village: " . TextFormattingService::formatLocation($activity->village ?? 'N/A') . " | ID: " . $activity->id . " | Date: " . ($activity->visit_date ? $activity->visit_date->format('Y-m-d') : 'N/A');

                    $details = $line1 . "\n" . $line2;

                    $detailsShape->createTextRun($details)
                        ->getFont()
                        ->setSize(11)
                        ->setColor(new \PhpOffice\PhpPresentation\Style\Color('FF000000'));

                    // Add images in 50-50 layout with margins and padding
                    $imageCount = 0;
                    $imageFields = ['close_shot1', 'close_shot_2', 'long_shot_1', 'long_shot_2'];

                    // Image area starts at Y=130, with 50-50 split
                    $imageStartY = 130;
                    $leftImageX = 60;  // Left margin
                    $rightImageX = 400; // Right side start
                    $imageWidth = 280;  // Larger images for better visibility
                    $imageHeight = 280;
                    $margin = 20;

                    foreach ($imageFields as $field) {
                        if ($imageCount >= 2) break;

                        $imageUrl = $activity->{$field};
                        if (!empty($imageUrl)) {
                            try {
                                // Optimize image loading - use context with timeout
                                if (filter_var($imageUrl, FILTER_VALIDATE_URL)) {
                                    $context = stream_context_create([
                                        'http' => [
                                            'timeout' => 10, // 10 second timeout
                                            'user_agent' => 'Li-Council-PPT-Export/1.0'
                                        ]
                                    ]);

                                    $imageContent = @file_get_contents($imageUrl, false, $context);
                                    if ($imageContent !== false && strlen($imageContent) > 0) {
                                        // Create temporary file with proper extension
                                        $extension = pathinfo(parse_url($imageUrl, PHP_URL_PATH), PATHINFO_EXTENSION) ?: 'jpg';
                                        $tempPath = tempnam(sys_get_temp_dir(), 'ppt_image_') . '.' . $extension;
                                        file_put_contents($tempPath, $imageContent);

                                        // Add image to slide
                                        $imageShape = $slide->createDrawingShape();
                                        $imageShape->setName('Image ' . ($imageCount + 1))
                                            ->setDescription('Activity Image')
                                            ->setPath($tempPath);

                                        // Position images in 50-50 layout with margins
                                        if ($imageCount == 0) {
                                            // Left image (50% area)
                                            $imageShape->setOffsetX($leftImageX)
                                                ->setOffsetY($imageStartY)
                                                ->setWidth($imageWidth)
                                                ->setHeight($imageHeight);
                                        } else {
                                            // Right image (50% area)
                                            $imageShape->setOffsetX($rightImageX)
                                                ->setOffsetY($imageStartY)
                                                ->setWidth($imageWidth)
                                                ->setHeight($imageHeight);
                                        }

                                        $imageCount++;

                                        // Schedule cleanup - improved memory management
                                        register_shutdown_function(function() use ($tempPath) {
                                            if (file_exists($tempPath)) {
                                                @unlink($tempPath);
                                            }
                                        });
                                    }
                                }
                            } catch (\Exception $e) {
                                // Continue if image fails to load
                                error_log("Failed to load image {$imageUrl}: " . $e->getMessage());
                                continue;
                            }
                        }
                    }

                    // Add page number - positioned at bottom
                    $pageShape = $slide->createRichTextShape()
                        ->setHeight(25)
                        ->setWidth(100)
                        ->setOffsetX(620)
                        ->setOffsetY(515);

                    $pageShape->getActiveParagraph()->getAlignment()
                        ->setHorizontal(\PhpOffice\PhpPresentation\Style\Alignment::HORIZONTAL_RIGHT);

                    $pageShape->createTextRun("Page {$slideNumber}")
                        ->getFont()
                        ->setSize(9)
                        ->setColor(new \PhpOffice\PhpPresentation\Style\Color('FF666666'));

                    $slideNumber++;

                    // Memory cleanup after each slide
                    if ($slideNumber % 5 == 0) {
                        gc_collect_cycles();
                    }
                }
            }

            // Generate filename
            $timestamp = now()->format('Y-m-d_H-i-s');
            $filename = "activities_presentation_{$timestamp}.pptx";

            // Create writer and save to temporary file
            $writer = \PhpOffice\PhpPresentation\IOFactory::createWriter($presentation, 'PowerPoint2007');
            $tempFile = tempnam(sys_get_temp_dir(), 'ppt_export_');
            $writer->save($tempFile);

            // Return file as download
            return response()->download($tempFile, $filename, [
                'Content-Type' => 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                'Content-Disposition' => 'attachment; filename="' . $filename . '"',
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
     * Get photos for photo gallery with search and filters
     */
    public function getPhotos(Request $request)
    {
        try {
            $user = Auth::user();

            $query = ActivityRecce::query()
                ->select([
                    'id',
                    'visit_date',
                    'state',
                    'district',
                    'sub_district',
                    'village',
                    'village_code',
                    'location',
                    'latitude',
                    'longitude',
                    'close_shot1',
                    'close_shot_2',
                    'long_shot_1',
                    'long_shot_2',
                    'promoter_id',
                    'status'
                ])
                ->where(function($q) {
                    $q->whereNotNull('close_shot1')
                      ->orWhereNotNull('close_shot_2')
                      ->orWhereNotNull('long_shot_1')
                      ->orWhereNotNull('long_shot_2');
                });

            // Apply user state-based filtering
            if ($user && !$user->hasAllStateAccess()) {
                $assignedStates = $user->getAssignedStates();
                if (!empty($assignedStates)) {
                    $query->whereIn('state', $assignedStates);
                }
            }

            // Apply search filter
            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('village', 'like', "%{$search}%")
                        ->orWhere('state', 'like', "%{$search}%")
                        ->orWhere('district', 'like', "%{$search}%")
                        ->orWhere('sub_district', 'like', "%{$search}%")
                        ->orWhere('village_code', 'like', "%{$search}%")
                        ->orWhere('location', 'like', "%{$search}%");
                });
            }

            // Apply status filter
            if ($request->filled('status') && $request->status !== 'all') {
                $query->where('status', $request->status);
            }

            // Apply state filter
            if ($request->filled('state') && $request->state !== 'all') {
                $query->where('state', $request->state);
            }

            // Apply district filter
            if ($request->filled('district') && $request->district !== 'all') {
                $query->where('district', $request->district);
            }

            // Apply sub_district filter
            if ($request->filled('sub_district') && $request->sub_district !== 'all') {
                $query->where('sub_district', $request->sub_district);
            }

            // Apply village filter
            if ($request->filled('village') && $request->village !== 'all') {
                $query->where('village', $request->village);
            }

            // Apply date filters
            if ($request->filled('start_date')) {
                $query->whereDate('visit_date', '>=', $request->start_date);
            }

            if ($request->filled('end_date')) {
                $query->whereDate('visit_date', '<=', $request->end_date);
            }

            // Get paginated results
            $perPage = $request->get('per_page', 12);
            $activities = $query->orderBy('visit_date', 'desc')->paginate($perPage);

            // Transform data to include all photos for each activity
            $photos = [];
            foreach ($activities as $activity) {
                $imageFields = [
                    'close_shot1' => 'Close Shot 1',
                    'close_shot_2' => 'Close Shot 2',
                    'long_shot_1' => 'Long Shot 1',
                    'long_shot_2' => 'Long Shot 2'
                ];

                foreach ($imageFields as $field => $label) {
                    if (!empty($activity->{$field})) {
                        $photos[] = [
                            'id' => $activity->id . '_' . $field,
                            'activity_id' => $activity->id,
                            'title' => $label,
                            'url' => $activity->{$field},
                            'thumbnail' => $activity->{$field},
                            'state' => $activity->state,
                            'district' => $activity->district,
                            'sub_district' => $activity->sub_district,
                            'village' => $activity->village,
                            'village_code' => $activity->village_code,
                            'location' => $activity->location,
                            'latitude' => $activity->latitude,
                            'longitude' => $activity->longitude,
                            'visit_date' => $activity->visit_date,
                            'status' => $activity->status,
                            'image_type' => $field
                        ];
                    }
                }
            }

            return response()->json([
                'success' => true,
                'data' => $photos,
                'pagination' => [
                    'current_page' => $activities->currentPage(),
                    'last_page' => $activities->lastPage(),
                    'per_page' => $activities->perPage(),
                    'total' => $activities->total(),
                ],
                'message' => 'Photos retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve photos: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Download a photo by activity ID and image type
     */
    public function downloadPhoto(Request $request, $activityId): Response
    {
        $validator = Validator::make($request->all(), [
            'image_type' => 'required|string|in:close_shot_1,close_shot_2,long_shot_1,long_shot_2',
        ]);

        if ($validator->fails()) {
            return response('Invalid image type', 400);
        }

        try {
            $activity = ActivityRecce::findOrFail($activityId);
            $imageType = $request->input('image_type');
            $imageUrl = $activity->{$imageType};

            if (!$imageUrl) {
                return response('Image not found', 404);
            }

            // Handle both S3 URLs and local storage paths
            if (Str::startsWith($imageUrl, ['http://', 'https://'])) {
                // External URL (S3) - fetch and stream
                $imageContents = file_get_contents($imageUrl);
                if ($imageContents === false) {
                    return response('Failed to download image', 500);
                }

                // Extract file extension from URL or default to jpg
                $extension = pathinfo(parse_url($imageUrl, PHP_URL_PATH), PATHINFO_EXTENSION) ?: 'jpg';
                $filename = "activity_{$activityId}_{$imageType}.{$extension}";

                return response($imageContents)
                    ->header('Content-Type', 'image/' . $extension)
                    ->header('Content-Disposition', 'attachment; filename="' . $filename . '"');
            } else {
                // Local storage - use Storage facade
                if (!Storage::disk('public')->exists($imageUrl)) {
                    return response('Image file not found', 404);
                }

                $fileContents = Storage::disk('public')->get($imageUrl);
                $extension = pathinfo($imageUrl, PATHINFO_EXTENSION) ?: 'jpg';
                $filename = "activity_{$activityId}_{$imageType}.{$extension}";

                return response($fileContents)
                    ->header('Content-Type', 'image/' . $extension)
                    ->header('Content-Disposition', 'attachment; filename="' . $filename . '"');
            }

        } catch (\Exception $e) {
            return response('Failed to download image: ' . $e->getMessage(), 500);
        }
    }
}
