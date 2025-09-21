<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Permission;
use App\Models\Role;

class PromoterPermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        echo "Setting up Promoter Permissions...\n";

        // Ensure promoter permissions exist
        $permissions = [
            'promoters.view' => 'View promoters list and details',
            'promoters.create' => 'Create new promoters',
            'promoters.update' => 'Update existing promoters',
            'promoters.delete' => 'Delete promoters',
            'promoter_activities.view' => 'View promoter daily activities',
            'promoter_activities.create' => 'Create promoter activity records'
        ];

        foreach ($permissions as $name => $description) {
            $permission = Permission::firstOrCreate([
                'name' => $name
            ], [
                'description' => $description,
                'module' => 'promoters',
                'is_active' => true
            ]);

            echo "✅ Permission: {$name}\n";
        }

        // Get permission models for role assignment
        $permissionModels = Permission::whereIn('name', array_keys($permissions))->get();

        // Assign permissions to Super Admin role
        $superAdmin = Role::where('name', 'Super Admin')->first();
        if ($superAdmin) {
            foreach ($permissionModels as $permission) {
                if (!$superAdmin->hasPermissionTo($permission)) {
                    $superAdmin->givePermissionTo($permission);
                    echo "✅ Assigned {$permission->name} to Super Admin\n";
                }
            }
        }

        // Assign basic permissions to Admin role
        $admin = Role::where('name', 'Admin')->first();
        if ($admin) {
            $adminPermissions = ['promoters.view', 'promoters.create', 'promoters.update', 'promoter_activities.view'];
            foreach ($adminPermissions as $permissionName) {
                $permission = Permission::where('name', $permissionName)->first();
                if ($permission && !$admin->hasPermissionTo($permission)) {
                    $admin->givePermissionTo($permission);
                    echo "✅ Assigned {$permissionName} to Admin\n";
                }
            }
        }

        // Assign view permissions to Viewer role
        $viewer = Role::where('name', 'Viewer')->first();
        if ($viewer) {
            $viewerPermissions = ['promoters.view', 'promoter_activities.view'];
            foreach ($viewerPermissions as $permissionName) {
                $permission = Permission::where('name', $permissionName)->first();
                if ($permission && !$viewer->hasPermissionTo($permission)) {
                    $viewer->givePermissionTo($permission);
                    echo "✅ Assigned {$permissionName} to Viewer\n";
                }
            }
        }

        echo "\n🎉 Promoter permissions setup completed!\n";
    }
}
