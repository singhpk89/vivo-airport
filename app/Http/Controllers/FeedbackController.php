<?php

namespace App\Http\Controllers;

use App\Models\Feedback;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class FeedbackController extends Controller
{
    /**
     * Display a listing of feedbacks.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Feedback::query()->orderBy('created_at', 'desc');

            // Apply filters if provided
            if ($request->has('form_type')) {
                $query->byFormType($request->form_type);
            }

            if ($request->has('status')) {
                $query->byStatus($request->status);
            }

            if ($request->has('category')) {
                $query->where('category', $request->category);
            }

            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('subject', 'like', "%{$search}%")
                      ->orWhere('message', 'like', "%{$search}%")
                      ->orWhere('visitor_name', 'like', "%{$search}%")
                      ->orWhere('name', 'like', "%{$search}%");
                });
            }

            $feedbacks = $query->with('respondedByUser')->paginate(10);

            return response()->json([
                'success' => true,
                'data' => $feedbacks->items(),
                'meta' => [
                    'current_page' => $feedbacks->currentPage(),
                    'last_page' => $feedbacks->lastPage(),
                    'per_page' => $feedbacks->perPage(),
                    'total' => $feedbacks->total(),
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching feedbacks',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created feedback in storage.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            // Basic validation - only email format if provided (all fields are optional)
            $validator = Validator::make($request->all(), [
                'visitor_email' => 'nullable|email',
                'email' => 'nullable|email',
                'experience_rating' => 'nullable|integer|min:1|max:5',
                'recommendation_likelihood' => 'nullable|integer|min:1|max:5',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Create feedback with all provided data
            $feedbackData = $request->all();

            // Set default values if not provided
            $feedbackData['status'] = $feedbackData['status'] ?? 'open';
            $feedbackData['priority'] = $feedbackData['priority'] ?? 'medium';
            $feedbackData['form_type'] = $feedbackData['form_type'] ?? 'general';

            $feedback = Feedback::create($feedbackData);

            return response()->json([
                'success' => true,
                'message' => 'Feedback submitted successfully',
                'data' => $feedback
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error submitting feedback',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store Vivo Experience feedback specifically.
     */
    public function storeVivoExperience(Request $request): JsonResponse
    {
        try {
            // Enhanced validation for updated questions and multi-select fields
            $validator = Validator::make($request->all(), [
                'visitor_email' => 'nullable|email',
                'overall_experience' => 'nullable|in:excellent,good,average,poor',
                'key_drivers' => 'nullable|array|max:2',
                'key_drivers.*' => 'nullable|in:hands_on_demo,photography_zones,staff_support,ambience_design,photo_souvenir,other',
                'brand_perception' => 'nullable|in:significantly_improved,slightly_improved,no_change,worsened',
                'brand_image' => 'nullable|array|max:2',
                'brand_image.*' => 'nullable|in:innovative_future_ready,premium_aspirational,approachable_friendly,modern_trendy,reliable_trustworthy,no_clear_image,other',
                'suggestions' => 'nullable|string|max:2000',
                'assisted_by_promoter_id' => 'nullable|string',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Create Vivo Experience feedback with all provided data
            $feedbackData = $request->all();

            // Handle multi-select arrays - ensure they're properly formatted
            if (isset($feedbackData['key_drivers']) && is_array($feedbackData['key_drivers'])) {
                // Remove empty values and limit to 2 selections
                $feedbackData['key_drivers'] = array_filter($feedbackData['key_drivers']);
                $feedbackData['key_drivers'] = array_slice($feedbackData['key_drivers'], 0, 2);
            }

            if (isset($feedbackData['brand_image']) && is_array($feedbackData['brand_image'])) {
                // Remove empty values and limit to 2 selections
                $feedbackData['brand_image'] = array_filter($feedbackData['brand_image']);
                $feedbackData['brand_image'] = array_slice($feedbackData['brand_image'], 0, 2);
            }

            // Set Vivo Experience specific defaults
            $feedbackData['form_type'] = 'vivo_experience';
            $feedbackData['category'] = $feedbackData['category'] ?? 'experience_feedback';
            $feedbackData['subject'] = $feedbackData['subject'] ?? 'Xperience Studio by Vivo - Visitor Feedback';
            $feedbackData['status'] = $feedbackData['status'] ?? 'open';
            $feedbackData['priority'] = $feedbackData['priority'] ?? 'medium';

            $feedback = Feedback::create($feedbackData);

            // Update promoter activity if promoter is assigned
            if (!empty($feedbackData['assisted_by_promoter_id']) && $feedbackData['assisted_by_promoter_id'] !== 'none') {
                $today = \Carbon\Carbon::today();
                $activity = \App\Models\PromoterActivity::where('promoter_id', $feedbackData['assisted_by_promoter_id'])
                    ->where('activity_date', $today)
                    ->first();

                if ($activity) {
                    $activity->increment('total_feedback_captured');
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Vivo Experience feedback submitted successfully',
                'data' => $feedback
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error submitting Vivo Experience feedback',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified feedback.
     */
    public function show(string $id): JsonResponse
    {
        try {
            $feedback = Feedback::with('respondedByUser')->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $feedback
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Feedback not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Update the specified feedback in storage.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        try {
            $feedback = Feedback::findOrFail($id);

            // Basic validation
            $validator = Validator::make($request->all(), [
                'visitor_email' => 'nullable|email',
                'email' => 'nullable|email',
                'status' => 'nullable|in:open,in_progress,resolved,closed',
                'priority' => 'nullable|in:low,medium,high,urgent',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $feedback->update($request->all());

            return response()->json([
                'success' => true,
                'message' => 'Feedback updated successfully',
                'data' => $feedback
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error updating feedback',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Add admin response to feedback.
     */
    public function respond(Request $request, string $id): JsonResponse
    {
        try {
            $feedback = Feedback::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'admin_response' => 'required|string|max:2000',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $feedback->update([
                'admin_response' => $request->admin_response,
                'responded_at' => now(),
                'responded_by' => auth()->id(), // Will need authentication
                'status' => 'resolved'
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Response added successfully',
                'data' => $feedback->load('respondedByUser')
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error adding response',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified feedback from storage.
     */
    public function destroy(string $id): JsonResponse
    {
        try {
            $feedback = Feedback::findOrFail($id);
            $feedback->delete();

            return response()->json([
                'success' => true,
                'message' => 'Feedback deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error deleting feedback',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
