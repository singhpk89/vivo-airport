<?php

namespace App\Http\Controllers;

use App\Models\PromoterActivity;
use App\Models\PromoterActivityPhoto;
use App\Models\Promoter;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class PromoterActivityController extends Controller
{
    /**
     * Start promoter activity session (login).
     */
    public function login(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'promoter_id' => 'required|exists:promoters,id',
                'latitude' => 'nullable|numeric|between:-90,90',
                'longitude' => 'nullable|numeric|between:-180,180',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $today = Carbon::today();

            // Check if promoter already has an active session today
            $existingActivity = PromoterActivity::where('promoter_id', $request->promoter_id)
                ->where('activity_date', $today)
                ->first();

            if ($existingActivity && $existingActivity->isActive()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Promoter already has an active session today',
                    'data' => $existingActivity
                ], 409);
            }

            // Create or update activity record
            $activity = PromoterActivity::updateOrCreate(
                [
                    'promoter_id' => $request->promoter_id,
                    'activity_date' => $today
                ],
                [
                    'login_time' => now(),
                    'status' => 'logged_in',
                    'login_latitude' => $request->latitude,
                    'login_longitude' => $request->longitude,
                    'logout_time' => null,
                    'logout_latitude' => null,
                    'logout_longitude' => null,
                ]
            );

            return response()->json([
                'success' => true,
                'message' => 'Promoter logged in successfully',
                'data' => $activity->load('promoter')
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error during login',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * End promoter activity session (logout).
     */
    public function logout(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'promoter_id' => 'required|exists:promoters,id',
                'latitude' => 'nullable|numeric|between:-90,90',
                'longitude' => 'nullable|numeric|between:-180,180',
                'activity_notes' => 'nullable|string|max:1000',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $today = Carbon::today();

            $activity = PromoterActivity::where('promoter_id', $request->promoter_id)
                ->where('activity_date', $today)
                ->where('status', '!=', 'logged_out')
                ->first();

            if (!$activity) {
                return response()->json([
                    'success' => false,
                    'message' => 'No active session found for today'
                ], 404);
            }

            $activity->update([
                'logout_time' => now(),
                'status' => 'logged_out',
                'logout_latitude' => $request->latitude,
                'logout_longitude' => $request->longitude,
                'activity_notes' => $request->activity_notes,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Promoter logged out successfully',
                'data' => $activity->load('promoter')
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error during logout',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Upload activity photo.
     */
    public function uploadPhoto(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'promoter_id' => 'required|exists:promoters,id',
                'photo_type' => 'required|in:login,activity,logout',
                'photo' => 'required|image|mimes:jpeg,png,jpg|max:5120', // 5MB max
                'latitude' => 'nullable|numeric|between:-90,90',
                'longitude' => 'nullable|numeric|between:-180,180',
                'description' => 'nullable|string|max:500',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $today = Carbon::today();

            // Get today's activity
            $activity = PromoterActivity::where('promoter_id', $request->promoter_id)
                ->where('activity_date', $today)
                ->first();

            if (!$activity) {
                return response()->json([
                    'success' => false,
                    'message' => 'No activity session found for today. Please login first.'
                ], 404);
            }

            // Store the photo
            $photo = $request->file('photo');
            $filename = 'promoter_' . $request->promoter_id . '_' . time() . '_' . uniqid() . '.' . $photo->getClientOriginalExtension();
            $path = $photo->storeAs('promoter-activity-photos/' . $today->format('Y-m-d'), $filename, 'public');

            // Create photo record
            $photoRecord = PromoterActivityPhoto::create([
                'promoter_activity_id' => $activity->id,
                'photo_type' => $request->photo_type,
                'file_path' => $path,
                'file_name' => $filename,
                'mime_type' => $photo->getMimeType(),
                'file_size' => $photo->getSize(),
                'latitude' => $request->latitude,
                'longitude' => $request->longitude,
                'captured_at' => now(),
                'description' => $request->description,
                'is_synced' => true,
                'synced_at' => now(),
            ]);

            // Update activity photo count
            $activity->increment('total_photos_captured');

            return response()->json([
                'success' => true,
                'message' => 'Photo uploaded successfully',
                'data' => [
                    'photo' => $photoRecord,
                    'url' => Storage::url($path)
                ]
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error uploading photo',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get promoter's activity for a specific date.
     */
    public function getActivity(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'promoter_id' => 'required|exists:promoters,id',
                'date' => 'nullable|date',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $date = $request->date ? Carbon::parse($request->date) : Carbon::today();

            $activity = PromoterActivity::with(['promoter', 'photos'])
                ->where('promoter_id', $request->promoter_id)
                ->where('activity_date', $date)
                ->first();

            if (!$activity) {
                return response()->json([
                    'success' => false,
                    'message' => 'No activity found for the specified date'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $activity
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving activity',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get admin dashboard report.
     */
    public function getDashboardReport(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'date' => 'nullable|date',
                'promoter_id' => 'nullable|exists:promoters,id',
                'status' => 'nullable|in:logged_in,logged_out,active',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $date = $request->date ? Carbon::parse($request->date) : Carbon::today();

            $query = PromoterActivity::with(['promoter', 'photos'])
                ->where('activity_date', $date);

            if ($request->promoter_id) {
                $query->where('promoter_id', $request->promoter_id);
            }

            if ($request->status) {
                $query->where('status', $request->status);
            }

            $activities = $query->orderBy('login_time', 'desc')->get();

            // Calculate summary statistics
            $summary = [
                'total_promoters' => $activities->count(),
                'active_promoters' => $activities->where('status', '!=', 'logged_out')->count(),
                'total_photos' => $activities->sum('total_photos_captured'),
                'total_feedback' => $activities->sum('total_feedback_captured'),
                'average_session_duration' => $activities->filter(function($activity) {
                    return $activity->duration !== null;
                })->avg('duration')
            ];

            return response()->json([
                'success' => true,
                'data' => [
                    'summary' => $summary,
                    'activities' => $activities
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error generating dashboard report',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get detailed information about a specific promoter activity.
     */
    public function getActivityDetails(Request $request, $id): JsonResponse
    {
        try {
            $activity = PromoterActivity::with(['promoter', 'photos'])
                ->find($id);

            if (!$activity) {
                return response()->json([
                    'success' => false,
                    'message' => 'Activity not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $activity->id,
                    'promoter' => [
                        'id' => $activity->promoter->id,
                        'name' => $activity->promoter->name,
                        'state' => $activity->promoter->state,
                        'district' => $activity->promoter->district,
                    ],
                    'activity_date' => $activity->activity_date,
                    'login_time' => $activity->login_time,
                    'logout_time' => $activity->logout_time,
                    'status' => $activity->status,
                    'login_latitude' => $activity->login_latitude,
                    'login_longitude' => $activity->login_longitude,
                    'logout_latitude' => $activity->logout_latitude,
                    'logout_longitude' => $activity->logout_longitude,
                    'total_photos_captured' => $activity->total_photos_captured,
                    'total_feedback_captured' => $activity->total_feedback_captured,
                    'activity_notes' => $activity->activity_notes,
                    'last_sync_time' => $activity->last_sync_time,
                    'is_synced' => $activity->is_synced,
                    'photos' => $activity->photos->map(function ($photo) {
                        return [
                            'id' => $photo->id,
                            'photo_type' => $photo->photo_type,
                            'file_path' => $photo->file_path,
                            'file_name' => $photo->file_name,
                            'mime_type' => $photo->mime_type,
                            'file_size' => $photo->file_size,
                            'latitude' => $photo->latitude,
                            'longitude' => $photo->longitude,
                            'captured_at' => $photo->captured_at,
                            'description' => $photo->description,
                            'is_synced' => $photo->is_synced,
                            'synced_at' => $photo->synced_at,
                        ];
                    }),
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching activity details',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Sync offline data from mobile app.
     */
    public function syncData(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'promoter_id' => 'required|exists:promoters,id',
                'activities' => 'required|array',
                'activities.*.activity_date' => 'required|date',
                'activities.*.login_time' => 'nullable|date',
                'activities.*.logout_time' => 'nullable|date',
                'activities.*.status' => 'required|in:logged_in,logged_out,active',
                'activities.*.latitude' => 'nullable|numeric|between:-90,90',
                'activities.*.longitude' => 'nullable|numeric|between:-180,180',
                'activities.*.photos' => 'nullable|array',
                'activities.*.photos.*.photo_type' => 'required_with:activities.*.photos|string|in:login,logout,activity,selfie,location',
                'activities.*.photos.*.s3_url' => 'required_with:activities.*.photos|url',
                'activities.*.photos.*.file_name' => 'nullable|string|max:255',
                'activities.*.photos.*.mime_type' => 'nullable|string|max:100',
                'activities.*.photos.*.file_size' => 'nullable|integer|min:0',
                'activities.*.photos.*.latitude' => 'nullable|numeric|between:-90,90',
                'activities.*.photos.*.longitude' => 'nullable|numeric|between:-180,180',
                'activities.*.photos.*.captured_at' => 'nullable|date',
                'activities.*.photos.*.description' => 'nullable|string|max:500',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $syncedActivities = 0;
            $syncedPhotos = 0;

            foreach ($request->activities as $activityData) {
                // Extract photos data if present
                $photosData = $activityData['photos'] ?? [];
                unset($activityData['photos']); // Remove photos from activity data

                // Sync activity record
                $activity = PromoterActivity::updateOrCreate(
                    [
                        'promoter_id' => $request->promoter_id,
                        'activity_date' => $activityData['activity_date']
                    ],
                    array_merge($activityData, [
                        'is_synced' => true,
                        'last_sync_time' => now()
                    ])
                );

                $syncedActivities++;

                // Sync photos if provided
                if (!empty($photosData)) {
                    foreach ($photosData as $photoData) {
                        // Create unique identifier for photo to prevent duplicates
                        $photoIdentifier = md5($photoData['s3_url'] . $photoData['captured_at'] ?? now());

                        $photo = PromoterActivityPhoto::updateOrCreate(
                            [
                                'promoter_activity_id' => $activity->id,
                                'file_path' => $photoData['s3_url'], // Store S3 URL in file_path
                            ],
                            [
                                'photo_type' => $photoData['photo_type'],
                                'file_name' => $photoData['file_name'] ?? basename(parse_url($photoData['s3_url'], PHP_URL_PATH)),
                                'mime_type' => $photoData['mime_type'] ?? 'image/jpeg',
                                'file_size' => $photoData['file_size'] ?? null,
                                'latitude' => $photoData['latitude'] ?? null,
                                'longitude' => $photoData['longitude'] ?? null,
                                'captured_at' => $photoData['captured_at'] ?? now(),
                                'description' => $photoData['description'] ?? null,
                                'is_synced' => true,
                                'synced_at' => now(),
                            ]
                        );

                        $syncedPhotos++;
                    }

                    // Update activity photo count
                    $activity->update([
                        'total_photos_captured' => $activity->photos()->count()
                    ]);
                }
            }

            return response()->json([
                'success' => true,
                'message' => "Synced {$syncedActivities} activity records and {$syncedPhotos} photos successfully",
                'data' => [
                    'synced_activities' => $syncedActivities,
                    'synced_photos' => $syncedPhotos
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error syncing data',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
