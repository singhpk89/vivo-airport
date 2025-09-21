<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Traits\HasPermissions;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, HasPermissions, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'status',
        'last_login_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
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
            'last_login_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class);
    }

    public function permissions(): BelongsToMany
    {
        return $this->belongsToMany(Permission::class);
    }

    public function userStates(): HasMany
    {
        return $this->hasMany(UserState::class);
    }

    public function assignedStates(): HasMany
    {
        return $this->hasMany(UserState::class)->where('is_active', true);
    }

    public function hasRole(string $role): bool
    {
        return $this->roles()->where('name', $role)->exists();
    }

    public function hasPermission(string $permission): bool
    {
        // Check direct permissions
        if ($this->permissions()->where('name', $permission)->exists()) {
            return true;
        }

        // Check permissions through roles
        return $this->roles()->whereHas('permissions', function ($query) use ($permission) {
            $query->where('name', $permission);
        })->exists();
    }

    public function assignRole(string|Role $role): void
    {
        if (is_string($role)) {
            $role = Role::where('name', $role)->firstOrFail();
        }

        $this->roles()->syncWithoutDetaching([$role->id]);
    }

    public function removeRole(string|Role $role): void
    {
        if (is_string($role)) {
            $role = Role::where('name', $role)->firstOrFail();
        }

        $this->roles()->detach($role->id);
    }

    public function givePermissionTo(string|Permission $permission): void
    {
        if (is_string($permission)) {
            $permission = Permission::where('name', $permission)->firstOrFail();
        }

        $this->permissions()->syncWithoutDetaching([$permission->id]);
    }

    public function revokePermissionTo(string|Permission $permission): void
    {
        if (is_string($permission)) {
            $permission = Permission::where('name', $permission)->firstOrFail();
        }

        $this->permissions()->detach($permission->id);
    }

    public function getAllPermissions(): \Illuminate\Support\Collection
    {
        // Get direct permissions
        $directPermissions = $this->permissions;

        // Get permissions through roles
        $rolePermissions = $this->roles->flatMap->permissions;

        // Merge and remove duplicates
        return $directPermissions->merge($rolePermissions)->unique('id');
    }

    /**
     * Assign a state to the user
     */
    public function assignState(string $state): void
    {
        $this->userStates()->updateOrCreate(
            ['state' => $state],
            ['is_active' => true]
        );
    }

    /**
     * Remove a state assignment from the user
     */
    public function removeState(string $state): void
    {
        $this->userStates()->where('state', $state)->delete();
    }

    /**
     * Check if user has access to a specific state
     */
    public function hasStateAccess(string $state): bool
    {
        return $this->assignedStates()->where('state', $state)->exists();
    }

    /**
     * Get all states assigned to the user
     */
    public function getAssignedStates(): array
    {
        return $this->assignedStates()->pluck('state')->toArray();
    }

    /**
     * Check if user has access to view all states (super admin, admin)
     */
    public function hasAllStateAccess(): bool
    {
        return $this->hasRole('super_admin') || $this->hasRole('admin');
    }
}
