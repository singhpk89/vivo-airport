<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class TestLogin extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'test:login';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Show test login credentials and create admin user if needed';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        // Check existing users
        $users = User::select('email', 'name')->get();

        if ($users->count() > 0) {
            $this->info('Existing users:');
            foreach ($users as $user) {
                $this->line("- {$user->name} ({$user->email})");
            }
        } else {
            $this->warn('No users found in database.');
        }

        // Create admin user if none exists
        $adminUser = User::where('email', 'admin@example.com')->first();
        if (!$adminUser) {
            $adminUser = User::create([
                'name' => 'Admin User',
                'email' => 'admin@example.com',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]);
            $this->info('Created admin user: admin@example.com / password');
        }

        $this->info('Test credentials:');
        $this->line('Email: admin@example.com');
        $this->line('Password: password');

        return 0;
    }
}
