<?php

use App\Http\Controllers\ActivityRecceController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\PermissionController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\UserRoleController;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\PromoterAuthController;
use App\Http\Controllers\PromoterController;
use App\Http\Controllers\RoutePlanController;
use App\Http\Controllers\SettingController;
use App\Http\Controllers\UserStateController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;

// Test endpoint to verify API is working
Route::get('test', function () {
    return response()->json(['message' => 'API is working', 'timestamp' => now()]);
});

// Debug endpoint for testing multipart form data with logo uploads
Route::post('debug/settings', function (Request $request) {
    $data = [
        'all_inputs' => $request->all(),
        'files' => $request->allFiles(),
        'has_admin_logo' => $request->hasFile('admin_logo'),
        'content_type' => $request->header('Content-Type'),
    ];

    // Try to get the admin_logo file details
    if ($request->hasFile('admin_logo')) {
        $file = $request->file('admin_logo');
        $data['admin_logo_details'] = [
            'original_name' => $file->getClientOriginalName(),
            'mime_type' => $file->getMimeType(),
            'size' => $file->getSize(),
            'extension' => $file->getClientOriginalExtension(),
        ];
    }

    // Test parsing settings manually
    $settingsData = [];
    foreach ($request->all() as $key => $value) {
        if (preg_match('/^settings\[(\d+)\]\[(\w+)\]$/', $key, $matches)) {
            $index = (int) $matches[1];
            $field = $matches[2];
            $settingsData[$index][$field] = $value;
        }
    }
    $data['parsed_settings'] = $settingsData;

    return response()->json($data);
})->middleware('auth:sanctum');

// Test endpoint for API logging verification
Route::post('test-logging', function (Request $request) {
    return response()->json([
        'message' => 'API logging test successful',
        'timestamp' => now(),
        'request_data' => $request->all(),
        'user_id' => Auth::id(),
        'ip' => $request->ip(),
    ]);
});

// Test slow endpoint
Route::get('test-slow', function () {
    sleep(2); // Simulate slow operation

    return response()->json(['message' => 'Slow endpoint completed', 'duration' => '2 seconds']);
});

// Test error endpoint
Route::get('test-error', function () {
    return response()->json(['error' => 'Test error response'], 500);
});

// Authentication Routes (Public)
Route::prefix('auth')->group(function () {
    Route::post('login', [AuthController::class, 'login']);
    Route::post('register', [AuthController::class, 'register']);

    // Protected auth routes
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('profile', [AuthController::class, 'profile']);
        Route::put('profile', [AuthController::class, 'updateProfile']);
        Route::post('logout', [AuthController::class, 'logout']);
        Route::post('logout-all', [AuthController::class, 'logoutAll']);
        Route::post('refresh', [AuthController::class, 'refresh']);
        Route::post('check-permission', [AuthController::class, 'checkPermission']);
        Route::get('accessible-menus', [AuthController::class, 'getAccessibleMenus']);
    });
});

// Mobile App Authentication Routes (Public)
Route::prefix('mobile/auth')->group(function () {
    Route::post('login', [PromoterAuthController::class, 'login']);

    // Protected mobile auth routes
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('profile', [PromoterAuthController::class, 'profile']);
        Route::put('profile', [PromoterAuthController::class, 'updateProfile']);
        Route::post('change-password', [PromoterAuthController::class, 'changePassword']);
        Route::post('logout', [PromoterAuthController::class, 'logout']);
    });
});

// Mobile API Routes for S3 Image Upload (Protected)
Route::prefix('mobile')->middleware('auth:sanctum')->group(function () {
    // Image Upload Routes
    Route::post('upload-image', [\App\Http\Controllers\Api\Mobile\ImageUploadController::class, 'uploadSingle']);
    Route::post('upload-images', [\App\Http\Controllers\Api\Mobile\ImageUploadController::class, 'uploadMultiple']);
    Route::delete('delete-image', [\App\Http\Controllers\Api\Mobile\ImageUploadController::class, 'deleteImage']);

    // Activity Routes with S3 Image Support
    Route::prefix('activities')->group(function () {
        Route::get('/', [\App\Http\Controllers\Api\Mobile\ActivityController::class, 'index']);
        Route::post('/', [\App\Http\Controllers\Api\Mobile\ActivityController::class, 'create']);
        Route::post('bulk', [\App\Http\Controllers\Api\Mobile\ActivityController::class, 'createBulk']);
        Route::post('with-images', [\App\Http\Controllers\Api\Mobile\ActivityController::class, 'createWithImages']);
        Route::get('export-csv', [\App\Http\Controllers\Api\Mobile\ActivityController::class, 'exportCsv']);
        Route::get('export-ppt', [\App\Http\Controllers\Api\Mobile\ActivityController::class, 'exportPpt']);
        Route::get('photos', [\App\Http\Controllers\Api\Mobile\ActivityController::class, 'getPhotos']);
        Route::get('{activity}/download-photo', [\App\Http\Controllers\Api\Mobile\ActivityController::class, 'downloadPhoto']);
    });

    // Enhanced Auth Routes for Profile Image Upload
    Route::prefix('auth')->group(function () {
        Route::post('profile/with-image', [AuthController::class, 'updateProfileWithImage']);
    });
});

// Mobile App API Routes (Protected)
Route::prefix('mobile')->middleware('auth:sanctum')->group(function () {
    Route::get('route-plans', [PromoterAuthController::class, 'getRoutePlans']);
    Route::get('activities', [PromoterAuthController::class, 'getActivities']);
    Route::post('activities', [PromoterAuthController::class, 'createActivity']);
});

// Protected API Routes
Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // Role Management Routes (require roles.view permission)
    Route::apiResource('roles', RoleController::class);
    Route::get('roles-permissions', [RoleController::class, 'permissions']);

    // Permission Management Routes (require permissions.view permission)
    Route::apiResource('permissions', PermissionController::class);
    Route::get('permissions-by-module', [PermissionController::class, 'byModule']);

    // User Management Routes (require users.view permission)
    Route::apiResource('users', UserController::class);
    Route::post('users/{user}/toggle-status', [UserController::class, 'toggleStatus']);

    // User Role Assignment Routes (require users.view permission)
    Route::prefix('users')->group(function () {
        Route::get('with-roles', [UserRoleController::class, 'index']);
        Route::post('{user}/assign-roles', [UserRoleController::class, 'assignRoles']);
        Route::post('{user}/assign-permissions', [UserRoleController::class, 'assignPermissions']);
        Route::delete('{user}/remove-role', [UserRoleController::class, 'removeRole']);
        Route::delete('{user}/remove-permission', [UserRoleController::class, 'removePermission']);
        Route::get('{user}/permissions', [UserRoleController::class, 'userPermissions']);
        Route::post('{user}/check-permission', [UserRoleController::class, 'checkPermission']);
    });

    // User State Assignment Routes
    Route::prefix('user-states')->group(function () {
        Route::get('available-states', [UserStateController::class, 'getAvailableStates']);
        Route::get('{user}', [UserStateController::class, 'getUserStates']);
        Route::post('{user}/assign', [UserStateController::class, 'assignStates']);
        Route::post('{user}/remove', [UserStateController::class, 'removeState']);
    });

    // Promoter Management Routes
    Route::prefix('promoters')->group(function () {
        Route::get('/', [PromoterController::class, 'index']);
        Route::get('filters', [PromoterController::class, 'forFilters']);
        Route::get('states', [PromoterController::class, 'getStates']);
        Route::get('districts', [PromoterController::class, 'getDistricts']);
        Route::get('export', [PromoterController::class, 'export']);
        Route::post('/', [PromoterController::class, 'store']);
        Route::post('import/validate', [PromoterController::class, 'validateImport']);
        Route::post('import', [PromoterController::class, 'import']);
        Route::delete('bulk-delete', [PromoterController::class, 'bulkDelete']);
        Route::put('bulk-update-status', [PromoterController::class, 'bulkUpdateStatus']);
        Route::post('{promoter}/reset-login', [PromoterController::class, 'resetLogin']);
        Route::get('{promoter}', [PromoterController::class, 'show']);
        Route::put('{promoter}', [PromoterController::class, 'update']);
        Route::delete('{promoter}', [PromoterController::class, 'destroy']);
        Route::post('{promoter}/assign-routes', [PromoterController::class, 'assignToRoutes']);
        Route::get('{promoter}/accessible-routes', [PromoterController::class, 'getAccessibleRoutes']);
        Route::post('{promoter}/toggle-status', [PromoterController::class, 'toggleStatus']);
    });

    // Dashboard Analytics Routes
    Route::prefix('dashboard')->group(function () {
        Route::get('analytics', [DashboardController::class, 'analytics']);
    });

    // Route Plan Management Routes
    Route::prefix('route-plans')->group(function () {
        Route::get('/', [RoutePlanController::class, 'index']);
        Route::post('/', [RoutePlanController::class, 'store']);
        Route::get('filters', [RoutePlanController::class, 'forFilters']);
        Route::get('filter-options', [RoutePlanController::class, 'getFilterOptions']);
        Route::get('states', [RoutePlanController::class, 'getStates']);
        Route::get('districts', [RoutePlanController::class, 'getDistricts']);
        Route::get('locations', [RoutePlanController::class, 'getLocations']);
        Route::get('sub-districts', [RoutePlanController::class, 'getSubDistricts']);
        Route::get('villages', [RoutePlanController::class, 'getVillages']);
        Route::post('bulk-update-status', [RoutePlanController::class, 'bulkUpdateStatus']);
        Route::post('bulk-delete', [RoutePlanController::class, 'bulkDelete']);
        Route::post('import/validate', [RoutePlanController::class, 'validateImport']);
        Route::post('import', [RoutePlanController::class, 'import']);
        Route::get('{routePlan}', [RoutePlanController::class, 'show']);
        Route::put('{routePlan}', [RoutePlanController::class, 'update']);
        Route::delete('{routePlan}', [RoutePlanController::class, 'destroy']);
    });

    // Activity Recce Management Routes
    Route::prefix('activity-recces')->group(function () {
        Route::get('/', [ActivityRecceController::class, 'index']);
        Route::post('/', [ActivityRecceController::class, 'store']);
        Route::post('create-single', [ActivityRecceController::class, 'createSingle']);
        Route::post('create-bulk', [ActivityRecceController::class, 'createBulk']);
        Route::post('bulk-update-status', [ActivityRecceController::class, 'bulkUpdateStatus']);
        Route::post('fix-na-values', [ActivityRecceController::class, 'fixNAValues']);
        Route::get('activity-types', [ActivityRecceController::class, 'getActivityTypes']);
        Route::get('dashboard-stats', [ActivityRecceController::class, 'getDashboardStats']);
        Route::get('export-ppt', [ActivityRecceController::class, 'exportPpt']);
        Route::get('export-csv', [ActivityRecceController::class, 'exportCsv']);
        Route::get('{activityRecce}', [ActivityRecceController::class, 'show']);
        Route::put('{activityRecce}', [ActivityRecceController::class, 'update']);
        Route::delete('{activityRecce}', [ActivityRecceController::class, 'destroy']);
        Route::post('{activityRecce}/update-status', [ActivityRecceController::class, 'updateStatus']);
    });

    // Settings Management Routes (require settings.view permission)
    Route::prefix('settings')->group(function () {
        Route::get('/', [SettingController::class, 'index']);
        Route::post('/', [SettingController::class, 'store']);
        Route::post('batch', [SettingController::class, 'updateBatch']); // Changed from PUT to POST for multipart support
        Route::put('{key}', [SettingController::class, 'update']);
        Route::delete('{key}', [SettingController::class, 'destroy']);
    });

    // Feedback Management Routes
    Route::prefix('feedbacks')->group(function () {
        Route::get('/', [\App\Http\Controllers\FeedbackController::class, 'index']);
        Route::post('/', [\App\Http\Controllers\FeedbackController::class, 'store']);
        Route::get('{feedback}', [\App\Http\Controllers\FeedbackController::class, 'show']);
        Route::put('{feedback}', [\App\Http\Controllers\FeedbackController::class, 'update']);
        Route::delete('{feedback}', [\App\Http\Controllers\FeedbackController::class, 'destroy']);
        Route::post('{feedback}/respond', [\App\Http\Controllers\FeedbackController::class, 'respond']);
    });
});

// Public Settings Routes (no authentication required)
Route::get('public-settings', [SettingController::class, 'publicSettings']);

// Public Feedback Routes (no authentication required for visitor feedback)
Route::post('vivo-experience-feedback', [\App\Http\Controllers\FeedbackController::class, 'storeVivoExperience']);
Route::post('feedback', [\App\Http\Controllers\FeedbackController::class, 'store']);

// Mobile App Routes for Promoter Activity Tracking (no authentication for now - can be secured later)
Route::prefix('mobile/promoter-activity')->group(function () {
    Route::post('login', [\App\Http\Controllers\PromoterActivityController::class, 'login']);
    Route::post('logout', [\App\Http\Controllers\PromoterActivityController::class, 'logout']);
    Route::post('upload-photo', [\App\Http\Controllers\PromoterActivityController::class, 'uploadPhoto']);
    Route::get('activity', [\App\Http\Controllers\PromoterActivityController::class, 'getActivity']);
    Route::post('sync', [\App\Http\Controllers\PromoterActivityController::class, 'syncData']);
});

// Admin Dashboard Routes for Promoter Activity Reports (protected)
Route::middleware('auth:sanctum')->group(function () {
    Route::prefix('admin/promoter-reports')->group(function () {
        Route::get('dashboard', [\App\Http\Controllers\PromoterActivityController::class, 'getDashboardReport']);
        Route::get('activity/{id}', [\App\Http\Controllers\PromoterActivityController::class, 'getActivityDetails']);
    });
});
