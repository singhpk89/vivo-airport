<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Models\Role;

class AssignAdminRole extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'admin:assign-role';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Assign Super Admin role to admin user';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $adminUser = User::where('email', 'admin@example.com')->first();

        if (!$adminUser) {
            $this->error('Admin user not found!');
            return 1;
        }

        $superAdminRole = Role::where('name', 'super_admin')->first();

        if (!$superAdminRole) {
            $this->error('super_admin role not found!');
            return 1;
        }

        // Assign role if not already assigned
        if (!$adminUser->hasRole('super_admin')) {
            $adminUser->roles()->attach($superAdminRole->id);
            $this->info('super_admin role assigned to admin@example.com');
        } else {
            $this->info('Admin user already has super_admin role');
        }

        // Show user's current permissions
        $this->info('Current permissions count: ' . $adminUser->getAllPermissions()->count());

        return 0;
    }
}
