<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Feedback extends Model
{
    use HasFactory;

    protected $table = 'feedback';

    protected $fillable = [
        // Basic feedback information
        'subject',
        'message',
        'category',
        'priority',
        'status',
        'form_type',

        // Contact information (all optional)
        'visitor_name',
        'visitor_email',
        'visitor_phone',
        'visit_date',
        'is_anonymous',
        'allow_marketing_contact',

        // Vivo Experience specific fields
        'overall_experience',
        'favorite_section',
        'preferred_model',
        'souvenir_experience',
        'suggestions',

        // Legacy fields for general feedback compatibility
        'name',
        'email',
        'phone',
        'experience_rating',
        'recommendation_likelihood',
        'favorite_feature',
        'improvement_suggestions',
        'visit_frequency',
        'feedback_type',

        // Promoter tracking
        'assisted_by_promoter_id',

        // Admin response
        'admin_response',
        'responded_at',
        'responded_by',
    ];

    protected $casts = [
        'visit_date' => 'date',
        'is_anonymous' => 'boolean',
        'allow_marketing_contact' => 'boolean',
        'experience_rating' => 'integer',
        'recommendation_likelihood' => 'integer',
        'responded_at' => 'datetime',
    ];

    /**
     * Get the user who responded to this feedback
     */
    public function respondedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'responded_by');
    }

    /**
     * Get the promoter who assisted with this feedback
     */
    public function assistedByPromoter(): BelongsTo
    {
        return $this->belongsTo(Promoter::class, 'assisted_by_promoter_id');
    }

    /**
     * Scope for filtering by form type
     */
    public function scopeByFormType($query, $formType)
    {
        return $query->where('form_type', $formType);
    }

    /**
     * Scope for filtering by status
     */
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Get display name for the feedback submitter
     */
    public function getDisplayNameAttribute(): string
    {
        if ($this->is_anonymous) {
            return 'Anonymous';
        }

        return $this->visitor_name ?: $this->name ?: 'Guest User';
    }

    /**
     * Get display email for the feedback submitter
     */
    public function getDisplayEmailAttribute(): ?string
    {
        if ($this->is_anonymous) {
            return null;
        }

        return $this->visitor_email ?: $this->email;
    }
}
