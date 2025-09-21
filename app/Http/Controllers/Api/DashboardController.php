<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityRecce;
use App\Models\RoutePlan;
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
                    'state_wise_data' => $this->getStateWiseData($dateRange),
                    'activity_by_date' => $this->getActivityByDate($dateRange),
                    'pie_charts' => $this->getPieChartsData($dateRange),
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
        $totalActivities = ActivityRecce::forUserStates()->whereBetween('visit_date', $dateRange)->count();
        $approvedActivities = ActivityRecce::forUserStates()->whereBetween('visit_date', $dateRange)
            ->where('status', 'approved')->count();
        $pendingActivities = ActivityRecce::forUserStates()->whereBetween('visit_date', $dateRange)
            ->where('status', 'pending')->count();
        $rejectedActivities = ActivityRecce::forUserStates()->whereBetween('visit_date', $dateRange)
            ->where('status', 'rejected')->count();

        // Calculate walls completed: Total planned walls vs Approved activities (each approved activity = 1 wall completed)
        $totalPlannedWalls = RoutePlan::where('is_active', true)->sum('wall_count');
        $wallsCompleted = $approvedActivities; // Each approved activity represents 1 wall completed
        $wallCompletionRate = $totalPlannedWalls > 0 ? round(($wallsCompleted / $totalPlannedWalls) * 100, 1) : 0;

        $approvalRate = $totalActivities > 0 ? round(($approvedActivities / $totalActivities) * 100, 1) : 0;

        return [
            'total_walls' => [
                'count' => $totalActivities,
                'label' => 'Total of '.$totalPlannedWalls.' planned walls',
                'icon' => 'activity',
            ],
            'approved_activities' => [
                'count' => $approvedActivities,
                'label' => $approvalRate.'% approval rate',
                'icon' => 'check-circle',
                'color' => 'success',
            ],
            'pending_activities' => [
                'count' => $pendingActivities,
                'label' => 'Awaiting approval',
                'icon' => 'clock',
                'color' => 'warning',
            ],
            'rejected_activities' => [
                'count' => $rejectedActivities,
                'label' => $totalActivities > 0 ? round(($rejectedActivities / $totalActivities) * 100, 1).'% rejection rate' : '0% rejection rate',
                'icon' => 'x-circle',
                'color' => 'danger',
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
