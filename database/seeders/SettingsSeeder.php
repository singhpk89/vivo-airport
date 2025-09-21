<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $settings = [
            [
                'key' => 'app_name',
                'value' => 'GIC Admin Panel',
                'type' => 'string',
                'description' => 'Application name displayed in the admin panel',
                'is_public' => true,
            ],
            [
                'key' => 'app_description',
                'value' => 'Government Information Center Administration Portal',
                'type' => 'string',
                'description' => 'Application description',
                'is_public' => true,
            ],
            [
                'key' => 'contact_email',
                'value' => 'admin@gic.com',
                'type' => 'string',
                'description' => 'Primary contact email address',
                'is_public' => true,
            ],
            [
                'key' => 'contact_phone',
                'value' => '+1 (555) 123-4567',
                'type' => 'string',
                'description' => 'Primary contact phone number',
                'is_public' => true,
            ],
            [
                'key' => 'timezone',
                'value' => 'UTC',
                'type' => 'string',
                'description' => 'Default application timezone',
                'is_public' => false,
            ],
            [
                'key' => 'date_format',
                'value' => 'Y-m-d',
                'type' => 'string',
                'description' => 'Default date format for the application',
                'is_public' => false,
            ],
            [
                'key' => 'time_format',
                'value' => '24h',
                'type' => 'string',
                'description' => 'Default time format (12h or 24h)',
                'is_public' => false,
            ],
            [
                'key' => 'admin_logo',
                'value' => '',
                'type' => 'file',
                'description' => 'Admin panel logo file path',
                'is_public' => true,
            ],
        ];

        foreach ($settings as $setting) {
            Setting::updateOrCreate(
                ['key' => $setting['key']],
                $setting
            );
        }

        $this->command->info('Settings seeded successfully!');
    }
}
