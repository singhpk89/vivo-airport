<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Models\Permission;
use App\Models\Role;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Add promoter permissions
        $permissions = [
            [
                'name' => 'promoters.view',
                'guard_name' => 'web',
                'description' => 'View promoters'
            ],
            [
                'name' => 'promoters.create',
                'guard_name' => 'web',
                'description' => 'Create promoters'
            ],
            [
                'name' => 'promoters.update',
                'guard_name' => 'web',
                'description' => 'Update promoters'
            ],
            [
                'name' => 'promoters.delete',
                'guard_name' => 'web',
                'description' => 'Delete promoters'
            ],
            [
                'name' => 'promoter_activities.view',
                'guard_name' => 'web',
                'description' => 'View promoter activities'
            ],
            [
                'name' => 'promoter_activities.create',
                'guard_name' => 'web',
                'description' => 'Create promoter activities'
            ]
        ];

        foreach ($permissions as $permissionData) {
            try {
                Permission::firstOrCreate(
                    [
                        'name' => $permissionData['name'],
                        'guard_name' => $permissionData['guard_name']
                    ],
                    $permissionData
                );
            } catch (\Exception $e) {
                // Permission already exists, continue
                continue;
            }
        }

        // Assign permissions to roles
        try {
            $superAdminRole = Role::where('name', 'Super Admin')->first();
            if ($superAdminRole) {
                foreach ($permissions as $permissionData) {
                    $permission = Permission::where('name', $permissionData['name'])->first();
                    if ($permission && !$superAdminRole->hasPermissionTo($permission)) {
                        $superAdminRole->givePermissionTo($permission);
                    }
                }
            }

            $adminRole = Role::where('name', 'Admin')->first();
            if ($adminRole) {
                $adminPermissions = ['promoters.view', 'promoters.create', 'promoters.update', 'promoter_activities.view'];
                foreach ($adminPermissions as $permissionName) {
                    $permission = Permission::where('name', $permissionName)->first();
                    if ($permission && !$adminRole->hasPermissionTo($permission)) {
                        $adminRole->givePermissionTo($permission);
                    }
                }
            }

            $viewerRole = Role::where('name', 'Viewer')->first();
            if ($viewerRole) {
                $viewerPermissions = ['promoters.view', 'promoter_activities.view'];
                foreach ($viewerPermissions as $permissionName) {
                    $permission = Permission::where('name', $permissionName)->first();
                    if ($permission && !$viewerRole->hasPermissionTo($permission)) {
                        $viewerRole->givePermissionTo($permission);
                    }
                }
            }
        } catch (\Exception $e) {
            // Role assignment failed, but continue - permissions were created
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Remove permissions
        $permissions = [
            'promoters.view',
            'promoters.create',
            'promoters.update',
            'promoters.delete',
            'promoter_activities.view',
            'promoter_activities.create'
        ];

        foreach ($permissions as $permissionName) {
            Permission::where('name', $permissionName)->delete();
        }
    }
};
