<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Carbon\Carbon;

class PromoterActivity extends Model
{
    use HasFactory;

    protected $fillable = [
        'promoter_id',
        'activity_date',
        'login_time',
        'logout_time',
        'status',
        'login_latitude',
        'login_longitude',
        'logout_latitude',
        'logout_longitude',
        'total_photos_captured',
        'total_feedback_captured',
        'activity_notes',
        'last_sync_time',
        'is_synced',
    ];

    protected $casts = [
        'activity_date' => 'date',
        'login_time' => 'datetime',
        'logout_time' => 'datetime',
        'last_sync_time' => 'datetime',
        'login_latitude' => 'decimal:8',
        'login_longitude' => 'decimal:8',
        'logout_latitude' => 'decimal:8',
        'logout_longitude' => 'decimal:8',
        'is_synced' => 'boolean',
    ];

    /**
     * Get the promoter that owns this activity.
     */
    public function promoter(): BelongsTo
    {
        return $this->belongsTo(Promoter::class);
    }

    /**
     * Get all photos for this activity.
     */
    public function photos(): HasMany
    {
        return $this->hasMany(PromoterActivityPhoto::class);
    }

    /**
     * Calculate total duration of activity session.
     */
    public function getDurationAttribute(): ?int
    {
        if (!$this->login_time || !$this->logout_time) {
            return null;
        }

        return $this->logout_time->diffInMinutes($this->login_time);
    }

    /**
     * Check if promoter is currently active.
     */
    public function isActive(): bool
    {
        return $this->status === 'logged_in' || $this->status === 'active';
    }

    /**
     * Scope for today's activities.
     */
    public function scopeToday($query)
    {
        return $query->where('activity_date', Carbon::today());
    }

    /**
     * Scope for active sessions.
     */
    public function scopeActive($query)
    {
        return $query->whereIn('status', ['logged_in', 'active']);
    }
}
