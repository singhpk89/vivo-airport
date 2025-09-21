<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Permission;
use App\Models\Role;

class PromoterSystemPermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Define Promoter System permissions
        $promoterPermissions = [
            // Promoter Management
            ['name' => 'promoters.view', 'module' => 'promoters', 'description' => 'View promoters'],
            ['name' => 'promoters.create', 'module' => 'promoters', 'description' => 'Create promoters'],
            ['name' => 'promoters.edit', 'module' => 'promoters', 'description' => 'Edit promoters'],
            ['name' => 'promoters.delete', 'module' => 'promoters', 'description' => 'Delete promoters'],
            ['name' => 'promoters.assign', 'module' => 'promoters', 'description' => 'Assign promoters to routes'],

            // Route Plan Management
            ['name' => 'route_plans.view', 'module' => 'route_plans', 'description' => 'View route plans'],
            ['name' => 'route_plans.create', 'module' => 'route_plans', 'description' => 'Create route plans'],
            ['name' => 'route_plans.edit', 'module' => 'route_plans', 'description' => 'Edit route plans'],
            ['name' => 'route_plans.delete', 'module' => 'route_plans', 'description' => 'Delete route plans'],
            ['name' => 'route_plans.statistics', 'module' => 'route_plans', 'description' => 'View route plan statistics'],

            // Activity Recce Management
            ['name' => 'activity_recces.view', 'module' => 'activity_recces', 'description' => 'View activity recces'],
            ['name' => 'activity_recces.create', 'module' => 'activity_recces', 'description' => 'Create activity recces'],
            ['name' => 'activity_recces.edit', 'module' => 'activity_recces', 'description' => 'Edit activity recces'],
            ['name' => 'activity_recces.delete', 'module' => 'activity_recces', 'description' => 'Delete activity recces'],
            ['name' => 'activity_recces.status', 'module' => 'activity_recces', 'description' => 'Update activity status'],
            ['name' => 'activity_recces.dashboard', 'module' => 'activity_recces', 'description' => 'View activity dashboard'],
        ];

        // Create permissions
        foreach ($promoterPermissions as $permissionData) {
            Permission::firstOrCreate(
                ['name' => $permissionData['name']],
                $permissionData
            );
        }

        // Assign permissions to Super Admin role
        $superAdminRole = Role::where('name', 'Super Admin')->first();
        if ($superAdminRole) {
            $permissionIds = Permission::whereIn('name', array_column($promoterPermissions, 'name'))
                ->pluck('id')
                ->toArray();

            $superAdminRole->permissions()->syncWithoutDetaching($permissionIds);
        }

        // Create Field Manager role for promoter system management
        $fieldManagerRole = Role::firstOrCreate([
            'name' => 'Field Manager'
        ], [
            'description' => 'Manages field promoters and activities'
        ]);

        // Assign relevant permissions to Field Manager
        $fieldManagerPermissions = [
            'promoters.view',
            'promoters.create',
            'promoters.edit',
            'promoters.assign',
            'route_plans.view',
            'route_plans.create',
            'route_plans.edit',
            'route_plans.statistics',
            'activity_recces.view',
            'activity_recces.edit',
            'activity_recces.status',
            'activity_recces.dashboard',
        ];

        $fieldManagerPermissionIds = Permission::whereIn('name', $fieldManagerPermissions)
            ->pluck('id')
            ->toArray();

        $fieldManagerRole->permissions()->sync($fieldManagerPermissionIds);

        // Create Promoter Supervisor role for monitoring
        $promoterSupervisorRole = Role::firstOrCreate([
            'name' => 'Promoter Supervisor'
        ], [
            'description' => 'Supervises and monitors promoter activities'
        ]);

        // Assign view-only permissions to Promoter Supervisor
        $supervisorPermissions = [
            'promoters.view',
            'route_plans.view',
            'route_plans.statistics',
            'activity_recces.view',
            'activity_recces.dashboard',
        ];

        $supervisorPermissionIds = Permission::whereIn('name', $supervisorPermissions)
            ->pluck('id')
            ->toArray();

        $promoterSupervisorRole->permissions()->sync($supervisorPermissionIds);

        $this->command->info('Promoter system permissions created successfully!');
        $this->command->info('Created roles: Field Manager, Promoter Supervisor');
    }
}
