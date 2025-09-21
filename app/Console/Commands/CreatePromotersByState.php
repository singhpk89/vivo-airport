<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class CreatePromotersByState extends Command
{
    protected $signature = 'promoters:create-by-state';
    protected $description = 'Create 2 promoters for each state found in route_plans';

    public function handle()
    {
        $this->info('Starting promoter creation script...');
        $this->newLine();

        // Get unique states from route_plans
        $states = DB::table('route_plans')
            ->select('state')
            ->distinct()
            ->whereNotNull('state')
            ->get()
            ->pluck('state')
            ->toArray();

        if (empty($states)) {
            $this->error('No states found in route_plans table.');
            return 1;
        }

        $this->info('Found ' . count($states) . ' states:');
        foreach ($states as $state) {
            $this->line("- $state");
        }
        $this->newLine();

        $createdCount = 0;
        $skippedCount = 0;

        // Create 2 promoters for each state
        foreach ($states as $state) {
            $this->info("Creating promoters for state: $state");

            for ($i = 1; $i <= 2; $i++) {
                $username = $this->generatePromoterUsername($state, $i);
                $name = "Promoter " . $username;

                // Check if promoter already exists
                $existingPromoter = DB::table('promoters')->where('username', $username)->first();
                if ($existingPromoter) {
                    $this->line("  - Skipped $username (already exists)");
                    $skippedCount++;
                    continue;
                }

                // Create promoter
                $promoterId = DB::table('promoters')->insertGetId([
                    'name' => $name,
                    'username' => $username,
                    'password' => Hash::make('12345678'),
                    'state' => $state,
                    'district' => null,
                    'is_active' => true,
                    'is_logged_in' => false,
                    'status' => 'active',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                $this->line("  ✓ Created $username (ID: $promoterId, Name: $name)");
                $createdCount++;
            }
            $this->newLine();
        }

        $this->info('Script completed successfully!');
        $this->info("Created: $createdCount promoters");
        $this->info("Skipped: $skippedCount promoters (already existed)");
        $this->newLine();
        $this->info('Promoter Details:');
        $this->line('- Password: 12345678');
        $this->line('- Default active: true');
        $this->line('- Is logged in: false');
        $this->line('- District: null');
        $this->line('- Status: active');

        return 0;
    }

    private function generatePromoterUsername($stateName, $number)
    {
        // Clean up state name
        $stateName = trim($stateName);

        // Handle special cases and generate 2-character code
        $stateCode = '';

        switch (strtoupper($stateName)) {
            case 'ASSAM':
                $stateCode = 'AS';
                break;
            case 'HARYANA':
                $stateCode = 'HR';
                break;
            case 'JHARKHAND':
                $stateCode = 'JH';
                break;
            case 'MADHYA PRADESH':
                $stateCode = 'MP'; // First letter from each word
                break;
            case 'MAHARASHTRA':
                $stateCode = 'MH';
                break;
            case 'ODISHA':
                $stateCode = 'OD';
                break;
            case 'PUNJAB':
                $stateCode = 'PB';
                break;
            case 'RAJASTHAN':
                $stateCode = 'RJ';
                break;
            case 'SIKKIM':
                $stateCode = 'SK';
                break;
            case 'U.P':
            case 'UTTAR PRADESH':
                $stateCode = 'UP';
                break;
            case 'UTTRAKHAND':
            case 'UTTARAKHAND':
                $stateCode = 'UK';
                break;
            default:
                // For any other state, try to extract 2 characters
                $words = explode(' ', strtoupper($stateName));
                if (count($words) >= 2) {
                    // First letter from each word
                    $stateCode = substr($words[0], 0, 1) . substr($words[1], 0, 1);
                } else {
                    // Take first 2 characters
                    $stateCode = substr(strtoupper($stateName), 0, 2);
                }
                break;
        }

        return 'GIC' . $stateCode . sprintf('%02d', $number);
    }
}
