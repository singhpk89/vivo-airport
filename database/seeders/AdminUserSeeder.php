<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create Super Admin User
        $superAdmin = User::firstOrCreate([
            'email' => 'super.admin@li-council.com'
        ], [
            'name' => 'Super Administrator',
            'email_verified_at' => now(),
            'password' => Hash::make('Super@Admin123'),
        ]);

        // Create Admin User
        $admin = User::firstOrCreate([
            'email' => 'admin@li-council.com'
        ], [
            'name' => 'Administrator',
            'email_verified_at' => now(),
            'password' => Hash::make('Admin@123'),
        ]);

        // Create System Admin User
        $systemAdmin = User::firstOrCreate([
            'email' => 'system@li-council.com'
        ], [
            'name' => 'System Administrator',
            'email_verified_at' => now(),
            'password' => Hash::make('System@123'),
        ]);

        // Create Agency User
        $agency = User::firstOrCreate([
            'email' => 'agency@li-council.com'
        ], [
            'name' => 'Agency User',
            'email_verified_at' => now(),
            'password' => Hash::make('Agency@123'),
        ]);

        // Create Agency View User
        $agencyView = User::firstOrCreate([
            'email' => 'agency.view@li-council.com'
        ], [
            'name' => 'Agency View User',
            'email_verified_at' => now(),
            'password' => Hash::make('AgencyView@123'),
        ]);

        // Assign roles to users
        $superAdminRole = Role::where('name', 'super_admin')->first();
        $adminRole = Role::where('name', 'admin')->first();
        $agencyRole = Role::where('name', 'agency')->first();
        $agencyViewRole = Role::where('name', 'agency_view')->first();

        if ($superAdminRole) {
            // Assign super_admin role to super admin user
            if (!$superAdmin->roles()->where('role_id', $superAdminRole->id)->exists()) {
                $superAdmin->roles()->attach($superAdminRole->id);
            }

            // Assign super_admin role to system admin user as well
            if (!$systemAdmin->roles()->where('role_id', $superAdminRole->id)->exists()) {
                $systemAdmin->roles()->attach($superAdminRole->id);
            }
        }

        if ($adminRole) {
            // Assign admin role to admin user
            if (!$admin->roles()->where('role_id', $adminRole->id)->exists()) {
                $admin->roles()->attach($adminRole->id);
            }
        }

        if ($agencyRole) {
            // Assign agency role to agency user
            if (!$agency->roles()->where('role_id', $agencyRole->id)->exists()) {
                $agency->roles()->attach($agencyRole->id);
            }
        }

        if ($agencyViewRole) {
            // Assign agency_view role to agency view user
            if (!$agencyView->roles()->where('role_id', $agencyViewRole->id)->exists()) {
                $agencyView->roles()->attach($agencyViewRole->id);
            }
        }

        $this->command->info('Admin users seeded successfully:');
        $this->command->info('Super Admin: super.admin@li-council.com (Password: Super@Admin123)');
        $this->command->info('Admin: admin@li-council.com (Password: Admin@123)');
        $this->command->info('System Admin: system@li-council.com (Password: System@123)');
        $this->command->info('Agency: agency@li-council.com (Password: Agency@123)');
        $this->command->info('Agency View: agency.view@li-council.com (Password: AgencyView@123)');
    }
}
