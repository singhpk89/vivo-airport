<?php

namespace App\Models;

use App\Traits\HasStateFiltering;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ActivityRecce extends Model
{
    use HasFactory, HasStateFiltering;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'visit_date',
        'promoter_id',
        'plan_id',
        'device_id',
        'state',
        'district',
        'sub_district',
        'village',
        'village_code',
        'wall_code',
        'location',
        'landmark',
        'close_shot1',
        'close_shot_2',
        'long_shot_1',
        'long_shot_2',
        'remarks',
        'latitude',
        'longitude',
        'width',
        'height',
        'status',
        'local_id',
        'product_type',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'visit_date' => 'datetime',
            'latitude' => 'decimal:7',
            'longitude' => 'decimal:7',
            'width' => 'decimal:2',
            'height' => 'decimal:2',
        ];
    }

    /**
     * Get the promoter that owns the activity recce.
     */
    public function promoter()
    {
        return $this->belongsTo(Promoter::class);
    }

    /**
     * Get the route plan that owns the activity recce.
     */
    public function routePlan()
    {
        return $this->belongsTo(RoutePlan::class, 'plan_id');
    }

    /**
     * Scope a query to only include completed activities.
     */
    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    /**
     * Scope a query to only include pending activities.
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope a query to only include approved activities.
     */
    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    /**
     * Scope a query to only include rejected activities.
     */
    public function scopeRejected($query)
    {
        return $query->where('status', 'rejected');
    }

    /**
     * Scope a query to only include in-progress activities.
     */
    public function scopeInProgress($query)
    {
        return $query->where('status', 'in_progress');
    }

    /**
     * Scope a query for activities within date range.
     */
    public function scopeWithinDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('visit_date', [$startDate, $endDate]);
    }

    /**
     * Scope a query for activities by promoter.
     */
    public function scopeByPromoter($query, $promoterId)
    {
        return $query->where('promoter_id', $promoterId);
    }

    /**
     * Scope a query for activities by route plan.
     */
    public function scopeByRoutePlan($query, $routePlanId)
    {
        return $query->where('plan_id', $routePlanId);
    }

    /**
     * Scope a query for activities by product type.
     */
    public function scopeByProductType($query, $productType)
    {
        return $query->where('product_type', $productType);
    }

    /**
     * Get the status color for UI display.
     */
    public function getStatusColorAttribute(): string
    {
        return match ($this->status) {
            'completed' => 'green',
            'approved' => 'blue',
            'in_progress' => 'yellow',
            'pending' => 'gray',
            'rejected' => 'red',
            default => 'gray',
        };
    }

    /**
     * Get the formatted location string.
     */
    public function getFormattedLocationAttribute(): string
    {
        if ($this->latitude && $this->longitude) {
            $lat = round((float) $this->latitude, 4);
            $lng = round((float) $this->longitude, 4);

            return "{$this->location} ({$lat}, {$lng})";
        }

        return $this->location ?? 'Unknown Location';
    }

    /**
     * Get all image paths as an array.
     */
    public function getImagesAttribute(): array
    {
        return array_filter([
            $this->close_shot1,
            $this->close_shot_2,
            $this->long_shot_1,
            $this->long_shot_2,
        ]);
    }

    /**
     * Get the area calculated from width and height.
     */
    public function getAreaAttribute(): ?float
    {
        if ($this->width && $this->height) {
            return round((float) $this->width * (float) $this->height, 2);
        }

        return null;
    }

    /**
     * Mark activity as completed.
     */
    public function markCompleted(): bool
    {
        $this->status = 'completed';

        return $this->save();
    }

    /**
     * Mark activity as approved.
     */
    public function markApproved(): bool
    {
        $this->status = 'approved';

        return $this->save();
    }

    /**
     * Mark activity as rejected.
     */
    public function markRejected(): bool
    {
        $this->status = 'rejected';

        return $this->save();
    }

    /**
     * Mark activity as in progress.
     */
    public function markInProgress(): bool
    {
        $this->status = 'in_progress';

        return $this->save();
    }
}
