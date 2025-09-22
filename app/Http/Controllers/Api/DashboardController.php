<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityRecce;
use App\Models\RoutePlan;
use App\Models\PromoterActivity;
use App\Models\Feedback;
use App\Models\Promoter;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * Get dashboard analytics overview
     */
    public function analytics(Request $request)
    {
        try {
            $dateRange = $this->getDateRange($request);

            // Create cache key based on date range and user permissions
            $cacheKey = 'dashboard_analytics_'.
                        md5(implode('-', $dateRange)).'_'.
                        Auth::user()->id;

            // Cache results for 2 minutes to improve performance while keeping data fresh
            $data = cache()->remember($cacheKey, 120, function () use ($dateRange) {
                return [
                    'stats' => $this->getStatsCards($dateRange),
                    'promoter_activity_data' => $this->getPromoterActivityData($dateRange),
                    'feedback_data' => $this->getFeedbackData($dateRange),
                    'activity_by_date' => $this->getActivityByDate($dateRange),
                    'daily_progress' => $this->getDailyProgress($dateRange),
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $data,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch analytics data',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get stats cards data
     */
    private function getStatsCards($dateRange)
    {
        // Promoter Activity Stats
        $totalPromoters = Promoter::where('is_active', true)->count();
        $activePromoters = PromoterActivity::whereBetween('activity_date', $dateRange)
            ->where('status', '!=', 'logged_out')
            ->distinct('promoter_id')
            ->count();

        $totalSessions = PromoterActivity::whereBetween('activity_date', $dateRange)->count();
        $totalPhotos = PromoterActivity::whereBetween('activity_date', $dateRange)
            ->sum('total_photos_captured');

        // Feedback Stats
        $totalFeedback = Feedback::whereBetween('created_at', $dateRange)->count();
        $avgRating = Feedback::whereBetween('created_at', $dateRange)
            ->whereNotNull('experience_rating')
            ->avg('experience_rating');

        // Activity engagement rate
        $engagementRate = $totalPromoters > 0 ? round(($activePromoters / $totalPromoters) * 100, 1) : 0;

        return [
            'total_promoters' => [
                'count' => $totalPromoters,
                'label' => $activePromoters . ' active this period',
                'icon' => 'users',
                'color' => 'primary',
            ],
            'promoter_sessions' => [
                'count' => $totalSessions,
                'label' => $engagementRate . '% engagement rate',
                'icon' => 'activity',
                'color' => 'success',
            ],
            'photos_captured' => [
                'count' => $totalPhotos,
                'label' => 'Photos captured',
                'icon' => 'camera',
                'color' => 'info',
            ],
            'feedback_received' => [
                'count' => $totalFeedback,
                'label' => $avgRating ? round($avgRating, 1) . '/5 avg rating' : 'No ratings yet',
                'icon' => 'message-square',
                'color' => 'warning',
            ],
        ];
    }

    /**
     * Get state wise planned vs activity data
     */
    private function getStateWiseData($dateRange)
    {
        // Optimize with indexes and select only needed fields
        $plannedData = RoutePlan::select('state', DB::raw('sum(wall_count) as planned_count'))
            ->where('is_active', true)
            ->groupBy('state')
            ->orderBy('state')
            ->get()
            ->keyBy('state');

        $activityData = ActivityRecce::forUserStates()->select('state', DB::raw('count(*) as activity_count'))
            ->whereBetween('visit_date', $dateRange)
            ->groupBy('state')
            ->orderBy('state')
            ->get()
            ->keyBy('state');

        // Combine and optimize data structure
        $allStates = collect($plannedData->keys())
            ->merge($activityData->keys())
            ->unique()
            ->sort()
            ->values();

        return $allStates->map(function ($state) use ($plannedData, $activityData) {
            return [
                'state' => $state,
                'planned' => (int) ($plannedData->get($state)->planned_count ?? 0),
                'activity' => (int) ($activityData->get($state)->activity_count ?? 0),
            ];
        })->toArray();
    }

    /**
     * Get activity by date data
     */
    private function getActivityByDate($dateRange)
    {
        $startDate = Carbon::parse($dateRange[0]);
        $endDate = Carbon::parse($dateRange[1]);
        $diffInDays = $startDate->diffInDays($endDate);

        // Determine the grouping based on date range
        if ($diffInDays <= 31) {
            // Daily grouping for ranges <= 31 days
            $groupBy = DB::raw('DATE(visit_date) as date');
            $format = 'Y-m-d';
        } elseif ($diffInDays <= 365) {
            // Weekly grouping for ranges <= 365 days
            $groupBy = DB::raw('YEARWEEK(visit_date) as date');
            $format = 'Y-W';
        } else {
            // Monthly grouping for ranges > 365 days
            $groupBy = DB::raw('DATE_FORMAT(visit_date, "%Y-%m") as date');
            $format = 'Y-m';
        }

        return ActivityRecce::forUserStates()->select(
            $groupBy,
            DB::raw('count(*) as count'),
            DB::raw('count(case when status = "approved" then 1 end) as approved'),
            DB::raw('count(case when status = "pending" then 1 end) as pending'),
            DB::raw('count(case when status = "rejected" then 1 end) as rejected')
        )
            ->whereBetween('visit_date', $dateRange)
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->map(function ($item) use ($format) {
                if ($format === 'Y-W') {
                    // Convert YEARWEEK format to readable week format
                    $year = substr($item->date, 0, 4);
                    $week = substr($item->date, 4, 2);
                    $item->date = "Week $week, $year";
                }

                return $item;
            })
            ->toArray();
    }

    /**
     * Get pie charts data
     */
    private function getPieChartsData($dateRange)
    {
        return [
            'by_walls' => $this->getWallsDistribution($dateRange),
            'by_villages' => $this->getVillagesDistribution($dateRange),
            'by_brands' => $this->getBrandsDistribution($dateRange),
        ];
    }

    /**
     * Get walls distribution data
     */
    private function getWallsDistribution($dateRange)
    {
        // Get approved activities count
        $approvedActivities = ActivityRecce::forUserStates()->whereBetween('visit_date', $dateRange)
            ->where('status', 'approved')
            ->count();

        // Get total planned walls
        $totalPlannedWalls = RoutePlan::where('is_active', true)->sum('wall_count');

        // Calculate remaining planned walls
        $remainingPlannedWalls = max(0, $totalPlannedWalls - $approvedActivities);

        return [
            [
                'name' => 'Approved Activities',
                'value' => $approvedActivities,
                'color' => '#10b981', // green
            ],
            [
                'name' => 'Remaining Planned',
                'value' => $remainingPlannedWalls,
                'color' => '#6b7280', // gray
            ],
        ];
    }

    /**
     * Get villages distribution data
     */
    private function getVillagesDistribution($dateRange)
    {
        $topVillages = ActivityRecce::forUserStates()->select('village', DB::raw('count(*) as count'))
            ->whereBetween('visit_date', $dateRange)
            ->whereNotNull('village')
            ->groupBy('village')
            ->orderByDesc('count')
            ->limit(5)
            ->get();

        $totalCount = ActivityRecce::forUserStates()->whereBetween('visit_date', $dateRange)->count();
        $topVillagesCount = $topVillages->sum('count');
        $othersCount = $totalCount - $topVillagesCount;

        $colors = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#6b7280'];

        $result = $topVillages->map(function ($item, $index) use ($colors, $totalCount) {
            $percentage = $totalCount > 0 ? round(($item->count / $totalCount) * 100, 1) : 0;

            return [
                'name' => $item->village,
                'value' => $item->count,
                'percentage' => $percentage,
                'color' => $colors[$index] ?? '#6b7280',
            ];
        })->toArray();

        if ($othersCount > 0) {
            $othersPercentage = $totalCount > 0 ? round(($othersCount / $totalCount) * 100, 1) : 0;
            $result[] = [
                'name' => 'Others',
                'value' => $othersCount,
                'percentage' => $othersPercentage,
                'color' => '#6b7280',
            ];
        }

        return [
            'data' => $result,
            'total_count' => $totalCount,
        ];
    }

    /**
     * Get brands distribution data (based on product_type)
     */
    private function getBrandsDistribution($dateRange)
    {
        $brandData = ActivityRecce::forUserStates()->select('product_type', DB::raw('count(*) as count'))
            ->whereBetween('visit_date', $dateRange)
            ->whereNotNull('product_type')
            ->groupBy('product_type')
            ->get();

        $colors = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#6b7280'];

        return $brandData->map(function ($item, $index) use ($colors) {
            return [
                'name' => $item->product_type ?: 'Unknown',
                'value' => $item->count,
                'color' => $colors[$index % count($colors)],
            ];
        })->toArray();
    }

    /**
     * Get promoter activity analytics data
     */
    private function getPromoterActivityData($dateRange)
    {
        // Activity by status
        $activityByStatus = PromoterActivity::select('status', DB::raw('count(*) as count'))
            ->whereBetween('activity_date', $dateRange)
            ->groupBy('status')
            ->get()
            ->map(function ($item) {
                return [
                    'name' => ucfirst(str_replace('_', ' ', $item->status)),
                    'value' => $item->count,
                    'status' => $item->status
                ];
            });

        // Top active promoters
        $topPromoters = PromoterActivity::select('promoter_id', DB::raw('count(*) as session_count'), DB::raw('sum(total_photos_captured) as photo_count'))
            ->whereBetween('activity_date', $dateRange)
            ->with('promoter:id,name,state')
            ->groupBy('promoter_id')
            ->orderBy('session_count', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($item) {
                return [
                    'promoter_name' => $item->promoter->name ?? 'Unknown',
                    'state' => $item->promoter->state ?? 'Unknown',
                    'sessions' => $item->session_count,
                    'photos' => $item->photo_count
                ];
            });

        // Activity by state
        $activityByState = PromoterActivity::select('promoters.state', DB::raw('count(promoter_activities.id) as activity_count'))
            ->join('promoters', 'promoter_activities.promoter_id', '=', 'promoters.id')
            ->whereBetween('promoter_activities.activity_date', $dateRange)
            ->groupBy('promoters.state')
            ->orderBy('activity_count', 'desc')
            ->get()
            ->map(function ($item) {
                return [
                    'state' => $item->state,
                    'activities' => $item->activity_count
                ];
            });

        return [
            'activity_by_status' => $activityByStatus,
            'top_promoters' => $topPromoters,
            'activity_by_state' => $activityByState
        ];
    }

    /**
     * Get feedback analytics data
     */
    private function getFeedbackData($dateRange)
    {
        // Feedback ratings distribution
        $ratingDistribution = Feedback::select('experience_rating', DB::raw('count(*) as count'))
            ->whereBetween('created_at', $dateRange)
            ->whereNotNull('experience_rating')
            ->groupBy('experience_rating')
            ->orderBy('experience_rating')
            ->get()
            ->map(function ($item) {
                return [
                    'rating' => $item->experience_rating . ' Star' . ($item->experience_rating > 1 ? 's' : ''),
                    'count' => $item->count
                ];
            });

        // Vivo product satisfaction
        $productSatisfaction = Feedback::select('overall_experience', DB::raw('count(*) as count'))
            ->whereBetween('created_at', $dateRange)
            ->whereNotNull('overall_experience')
            ->groupBy('overall_experience')
            ->get()
            ->map(function ($item) {
                return [
                    'satisfaction' => ucfirst($item->overall_experience),
                    'count' => $item->count
                ];
            });

        // Recent feedback trends
        $feedbackTrends = Feedback::select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('count(*) as feedback_count'),
                DB::raw('avg(experience_rating) as avg_rating')
            )
            ->whereBetween('created_at', $dateRange)
            ->groupBy(DB::raw('DATE(created_at)'))
            ->orderBy('date')
            ->get()
            ->map(function ($item) {
                return [
                    'date' => $item->date,
                    'feedback_count' => $item->feedback_count,
                    'avg_rating' => $item->avg_rating ? round($item->avg_rating, 1) : null
                ];
            });

        return [
            'rating_distribution' => $ratingDistribution,
            'product_satisfaction' => $productSatisfaction,
            'feedback_trends' => $feedbackTrends
        ];
    }

    /**
     * Get daily progress data for date-wise analytics
     */
    private function getDailyProgress($dateRange)
    {
        // Daily promoter activity progress
        $dailyActivity = PromoterActivity::select(
                DB::raw('DATE(activity_date) as date'),
                DB::raw('count(distinct promoter_id) as active_promoters'),
                DB::raw('count(*) as total_sessions'),
                DB::raw('sum(total_photos_captured) as photos_captured'),
                DB::raw('sum(total_feedback_captured) as feedback_captured')
            )
            ->whereBetween('activity_date', $dateRange)
            ->groupBy(DB::raw('DATE(activity_date)'))
            ->orderBy('date')
            ->get();

        // Daily feedback received
        $dailyFeedback = Feedback::select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('count(*) as feedback_count'),
                DB::raw('avg(experience_rating) as avg_rating')
            )
            ->whereBetween('created_at', $dateRange)
            ->groupBy(DB::raw('DATE(created_at)'))
            ->orderBy('date')
            ->get()
            ->keyBy('date');

        // Combine data for comprehensive daily view
        $combinedData = $dailyActivity->map(function ($activity) use ($dailyFeedback) {
            $feedback = $dailyFeedback->get($activity->date);

            return [
                'date' => $activity->date,
                'active_promoters' => $activity->active_promoters,
                'total_sessions' => $activity->total_sessions,
                'photos_captured' => $activity->photos_captured,
                'feedback_captured' => $activity->feedback_captured,
                'feedback_received' => $feedback ? $feedback->feedback_count : 0,
                'avg_rating' => $feedback && $feedback->avg_rating ? round($feedback->avg_rating, 1) : null
            ];
        });

        return $combinedData;
    }

    /**
     * Get date range from request or default to last 30 days
     */
    private function getDateRange(Request $request)
    {
        $startDate = $request->get('start_date');
        $endDate = $request->get('end_date');

        if (! $startDate || ! $endDate) {
            $endDate = Carbon::now()->format('Y-m-d');
            $startDate = Carbon::now()->subDays(30)->format('Y-m-d');
        }

        // Convert to full datetime range for proper whereBetween with datetime columns
        $startDateTime = Carbon::parse($startDate)->startOfDay();
        $endDateTime = Carbon::parse($endDate)->endOfDay();

        return [$startDateTime, $endDateTime];
    }
}
