<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class PromoterActivityPhoto extends Model
{
    use HasFactory;

    protected $fillable = [
        'promoter_activity_id',
        'photo_type',
        'file_path',
        'file_name',
        'mime_type',
        'file_size',
        'latitude',
        'longitude',
        'captured_at',
        'description',
        'is_synced',
        'synced_at',
    ];

    protected $casts = [
        'captured_at' => 'datetime',
        'synced_at' => 'datetime',
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
        'is_synced' => 'boolean',
    ];

    /**
     * The attributes that should be appended to the model's array form.
     */
    protected $appends = ['url'];

    /**
     * Get the activity that owns this photo.
     */
    public function activity(): BelongsTo
    {
        return $this->belongsTo(PromoterActivity::class, 'promoter_activity_id');
    }

    /**
     * Get the full URL of the photo.
     * Returns S3 URL if it's a full URL, otherwise uses Storage::url()
     */
    public function getUrlAttribute(): string
    {
        // Check if file_path is already a full URL (S3 URL)
        if (filter_var($this->file_path, FILTER_VALIDATE_URL)) {
            return $this->file_path;
        }

        // Otherwise, use Laravel Storage for local/relative paths
        return Storage::url($this->file_path);
    }

    /**
     * Mark photo as synced.
     */
    public function markAsSynced(): void
    {
        $this->update([
            'is_synced' => true,
            'synced_at' => now(),
        ]);
    }

    /**
     * Scope for specific photo type.
     */
    public function scopeOfType($query, $type)
    {
        return $query->where('photo_type', $type);
    }

    /**
     * Scope for unsynced photos.
     */
    public function scopeUnsynced($query)
    {
        return $query->where('is_synced', false);
    }
}
