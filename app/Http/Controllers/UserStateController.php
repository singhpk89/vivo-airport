<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\UserState;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class UserStateController extends Controller
{
    /**
     * Get user's assigned states
     */
    public function getUserStates(User $user): JsonResponse
    {
        try {
            $states = $user->assignedStates()->get(['state', 'is_active']);

            return response()->json([
                'success' => true,
                'states' => $states->pluck('state')->toArray(),
                'data' => $states
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch user states',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Assign states to a user
     */
    public function assignStates(Request $request, User $user): JsonResponse
    {
        try {
            $request->validate([
                'states' => 'required|array',
                'states.*' => 'required|string|max:255',
            ]);

            DB::transaction(function () use ($request, $user) {
                // Remove existing state assignments
                $user->userStates()->delete();

                // Add new state assignments
                foreach ($request->states as $state) {
                    $user->assignState($state);
                }
            });

            return response()->json([
                'success' => true,
                'message' => 'States assigned successfully',
                'assigned_states' => $request->states
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to assign states',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove a state assignment from a user
     */
    public function removeState(Request $request, User $user): JsonResponse
    {
        try {
            $request->validate([
                'state' => 'required|string|max:255',
            ]);

            $user->removeState($request->state);

            return response()->json([
                'success' => true,
                'message' => 'State removed successfully'
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to remove state',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all available states from the system
     */
    public function getAvailableStates(): JsonResponse
    {
        try {
            // Get unique states from all data models
            $activityStates = DB::table('activity_recces')
                ->select('state')
                ->whereNotNull('state')
                ->where('state', '!=', '')
                ->distinct()
                ->pluck('state');

            $routePlanStates = DB::table('route_plans')
                ->select('state')
                ->whereNotNull('state')
                ->where('state', '!=', '')
                ->distinct()
                ->pluck('state');

            $promoterStates = DB::table('promoters')
                ->select('state')
                ->whereNotNull('state')
                ->where('state', '!=', '')
                ->distinct()
                ->pluck('state');

            // Merge and get unique states
            $allStates = $activityStates
                ->merge($routePlanStates)
                ->merge($promoterStates)
                ->unique()
                ->filter()
                ->sort()
                ->values()
                ->toArray();

            return response()->json([
                'success' => true,
                'states' => $allStates
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch available states',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
