<?php

namespace App\Models;

use App\Traits\HasStateFiltering;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RoutePlan extends Model
{
    use HasFactory, HasStateFiltering;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'state',
        'district',
        'sub_district',
        'village',
        'village_code',
        'width',
        'height',
        'area',
        'wall_count',
        'status',
        'is_active',
        'latitude',
        'longitude',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'width' => 'decimal:2',
            'height' => 'decimal:2',
            'area' => 'decimal:2',
            'wall_count' => 'integer',
            'is_active' => 'boolean',
            'latitude' => 'decimal:7',
            'longitude' => 'decimal:7',
        ];
    }

    /**
     * Get the assignments for this route plan.
     * Since there's no direct foreign key, we match by state and district
     */
    public function assignments()
    {
        return PromoterAssignment::where('state', $this->state)
            ->where('district', $this->district);
    }

    /**
     * Get the activity recces for this route plan through state/district matching.
     */
    public function activityRecces()
    {
        return ActivityRecce::where('state', $this->state)
            ->where('district', $this->district);
    }

    /**
     * Get the assigned promoters for this route plan through state/district matching.
     */
    public function promoters()
    {
        return $this->hasManyThrough(
            Promoter::class,
            PromoterAssignment::class,
            'state', // Foreign key on PromoterAssignment table
            'id', // Foreign key on Promoter table
            'state', // Local key on RoutePlan table
            'promoter_id' // Local key on PromoterAssignment table
        )->where('promoter_assignments.district', $this->district)
            ->where('promoter_assignments.is_active', true);
    }

    /**
     * Check if the route plan is currently active.
     */
    public function isCurrentlyActive(): bool
    {
        return $this->status === 'active';
    }

    /**
     * Get activity recces within date range.
     */
    public function getActivitiesInRange(?string $startDate = null, ?string $endDate = null)
    {
        $query = $this->activityRecces();

        if ($startDate) {
            $query->whereDate('visit_date', '>=', $startDate);
        }

        if ($endDate) {
            $query->whereDate('visit_date', '<=', $endDate);
        }

        return $query;
    }

    /**
     * Calculate total area (width * height).
     */
    public function calculateArea(): float
    {
        if ($this->width && $this->height) {
            return $this->width * $this->height;
        }

        return $this->area ?? 0;
    }

    /**
     * Check if route plan has coordinates.
     */
    public function hasCoordinates(): bool
    {
        return ! is_null($this->latitude) && ! is_null($this->longitude);
    }

    /**
     * Get coordinates as array.
     */
    public function getCoordinates(): ?array
    {
        if ($this->hasCoordinates()) {
            return [
                'latitude' => (float) $this->latitude,
                'longitude' => (float) $this->longitude,
            ];
        }

        return null;
    }

    /**
     * Calculate distance to another route plan in kilometers.
     * Uses Haversine formula for distance calculation.
     */
    public function getDistanceTo(RoutePlan $other): ?float
    {
        if (! $this->hasCoordinates() || ! $other->hasCoordinates()) {
            return null;
        }

        $earthRadius = 6371; // Earth's radius in kilometers

        $lat1 = deg2rad((float) $this->latitude);
        $lon1 = deg2rad((float) $this->longitude);
        $lat2 = deg2rad((float) $other->latitude);
        $lon2 = deg2rad((float) $other->longitude);

        $deltaLat = $lat2 - $lat1;
        $deltaLon = $lon2 - $lon1;

        $a = sin($deltaLat / 2) * sin($deltaLat / 2) +
             cos($lat1) * cos($lat2) *
             sin($deltaLon / 2) * sin($deltaLon / 2);
        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return $earthRadius * $c;
    }

    /**
     * Find route plans within given radius (in kilometers).
     */
    public static function withinRadius(float $latitude, float $longitude, float $radiusKm = 10)
    {
        // Using bounding box for initial filtering (more efficient than calculating distance for all records)
        $latDelta = $radiusKm / 111; // Approximately 111 km per degree of latitude
        $lonDelta = $radiusKm / (111 * cos(deg2rad($latitude))); // Longitude adjustment based on latitude

        return static::whereNotNull('latitude')
            ->whereNotNull('longitude')
            ->whereBetween('latitude', [$latitude - $latDelta, $latitude + $latDelta])
            ->whereBetween('longitude', [$longitude - $lonDelta, $longitude + $lonDelta]);
    }

    /**
     * Get status badge configuration.
     */
    public function getStatusConfig(): array
    {
        $statusConfig = [
            'active' => [
                'label' => 'Active',
                'class' => 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
            ],
            'pending' => [
                'label' => 'Pending',
                'class' => 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400 border-amber-200 dark:border-amber-800',
            ],
            'completed' => [
                'label' => 'Completed',
                'class' => 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-800',
            ],
            'cancelled' => [
                'label' => 'Cancelled',
                'class' => 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 border-red-200 dark:border-red-800',
            ],
        ];

        return $statusConfig[$this->status] ?? $statusConfig['active'];
    }

    /**
     * Get completion percentage based on activity recces status.
     */
    public function getCompletionPercentage(): float
    {
        $totalActivities = $this->activityRecces()->count();

        if ($totalActivities === 0) {
            return 0.0;
        }

        $completedActivities = $this->activityRecces()->where('status', 'completed')->count();

        return round(($completedActivities / $totalActivities) * 100, 2);
    }
}
