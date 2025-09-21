<?php

namespace App\Traits;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Auth;

trait HasStateFiltering
{
    /**
     * Scope a query to only include records for user's assigned states
     */
    public function scopeForUserStates(Builder $query): Builder
    {
        $user = Auth::user();

        // Super admins and admins can see all states
        if (!$user || $user->hasAllStateAccess()) {
            return $query;
        }

        // Get user's assigned states
        $assignedStates = $user->getAssignedStates();

        // If no states assigned, return empty result
        if (empty($assignedStates)) {
            return $query->whereRaw('1 = 0'); // No results
        }

        // Filter by assigned states
        return $query->whereIn('state', $assignedStates);
    }

    /**
     * Scope a query to only include records for a specific state
     */
    public function scopeForState(Builder $query, string $state): Builder
    {
        return $query->where('state', $state);
    }

    /**
     * Check if the current user can access this model's state
     */
    public function canUserAccessState(): bool
    {
        $user = Auth::user();

        if (!$user) {
            return false;
        }

        // Super admins and admins can access all
        if ($user->hasAllStateAccess()) {
            return true;
        }

        // Check if user has access to this record's state
        return $user->hasStateAccess($this->state);
    }

    /**
     * Apply state filtering to a query for a specific user
     */
    public static function applyStateFiltering($user)
    {
        $query = static::query();

        // Super admins and admins can see all states
        if (!$user || $user->hasAllStateAccess()) {
            return $query;
        }

        // Get user's assigned states
        $assignedStates = $user->getAssignedStates();

        // If no states assigned, return empty result
        if (empty($assignedStates)) {
            return $query->whereRaw('1 = 0'); // No results
        }

        // Filter by assigned states
        return $query->whereIn('state', $assignedStates);
    }
}
