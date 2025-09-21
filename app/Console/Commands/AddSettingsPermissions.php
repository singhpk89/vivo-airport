<?php

namespace App\Console\Commands;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Console\Command;

class AddSettingsPermissions extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'settings:add-permissions';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Add settings permissions and assign to super admin role';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $permissions = [
            [
                'name' => 'settings.view',
                'display_name' => 'View Settings',
                'description' => 'Can view application settings',
                'module' => 'settings',
                'is_active' => true,
            ],
            [
                'name' => 'settings.update',
                'display_name' => 'Update Settings',
                'description' => 'Can update application settings',
                'module' => 'settings',
                'is_active' => true,
            ],
        ];

        foreach ($permissions as $permissionData) {
            $permission = Permission::updateOrCreate(
                ['name' => $permissionData['name']],
                $permissionData
            );

            $this->info("Created/Updated permission: {$permission->name}");
        }

        // Assign permissions to super_admin role
        $superAdminRole = Role::where('name', 'super_admin')->first();
        if ($superAdminRole) {
            $settingsPermissions = Permission::where('module', 'settings')->get();
            foreach ($settingsPermissions as $permission) {
                if (! $superAdminRole->permissions()->where('permission_id', $permission->id)->exists()) {
                    $superAdminRole->permissions()->attach($permission->id);
                    $this->info("Assigned {$permission->name} to super_admin role");
                }
            }
        }

        $this->info('Settings permissions added successfully!');
    }
}
