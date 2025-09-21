<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Run the role and permission seeders first
        $this->call([
            RolePermissionSeeder::class,
            AdminUserSeeder::class,
        ]);

        // Check if we're in testing environment - if so, create test user
        if (app()->environment('testing') || config('app.env') === 'local') {
            // Create test user only in local/testing environment
            $testUser = User::firstOrCreate([
                'email' => 'test@example.com'
            ], [
                'name' => 'Test User',
                'email_verified_at' => now(),
            ]);

            // Assign admin role to test user if admin role exists
            $adminRole = \App\Models\Role::where('name', 'admin')->first();
            if ($adminRole && !$testUser->roles()->where('role_id', $adminRole->id)->exists()) {
                $testUser->roles()->attach($adminRole->id);
            }
        }
    }
}
