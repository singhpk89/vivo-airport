<?php

namespace App\Models;

use App\Traits\HasStateFiltering;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class Promoter extends Authenticatable
{
    use HasApiTokens, HasFactory, HasStateFiltering, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'username',
        'password',
        'state',
        'district',
        'is_active',
        'device_id',
        'is_logged_in',
        'last_active',
        'app_version',
        'device_token',
        'status',
        'profile_image',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
        'device_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
            'is_logged_in' => 'boolean',
            'last_active' => 'datetime',
        ];
    }

    /**
     * Get the activity recces for the promoter.
     */
    public function activityRecces()
    {
        return $this->hasMany(ActivityRecce::class);
    }

    /**
     * Get the route plans accessible to this promoter based on assigned state and district.
     */
    public function accessibleRoutePlans()
    {
        $query = RoutePlan::query()->where('is_active', true);

        // If promoter has a state assigned, filter by that state
        if (!empty($this->state)) {
            $query->where('state', $this->state);

            // If promoter also has a district assigned, filter by that district too
            if (!empty($this->district)) {
                $query->where('district', $this->district);
            }
        }
        // If state is null/empty, return all route plans (no filtering)

        return $query;
    }

    /**
     * Check if promoter is assigned to a specific state/district.
     */
    public function isAssignedTo(string $state, ?string $district = null): bool
    {
        // If promoter has no state assigned, they can access all areas
        if (empty($this->state)) {
            return true;
        }

        // Check if the state matches
        if ($this->state !== $state) {
            return false;
        }

        // If district is provided and promoter has district assigned, check district match
        if ($district && !empty($this->district)) {
            return $this->district === $district;
        }

        // If no district specified or promoter has no district assigned, allow access
        return true;
    }

    /**
     * Get assigned states for the promoter (for state filtering trait compatibility).
     */
    public function getAssignedStates(): array
    {
        // If promoter has no state assigned, they can access all states
        if (empty($this->state)) {
            return []; // Empty array means no filtering (all states)
        }

        // Return the single assigned state as an array
        return [$this->state];
    }

    /**
     * Check if promoter has access to all states (for state filtering trait compatibility).
     */
    public function hasAllStateAccess(): bool
    {
        // If state is null/empty, promoter can access all states
        return empty($this->state);
    }

    /**
     * Check if promoter has access to a specific state.
     */
    public function hasStateAccess(string $state): bool
    {
        // If promoter has no state assigned, they can access all states
        if (empty($this->state)) {
            return true;
        }

        // Check if the state matches
        return $this->state === $state;
    }
}
