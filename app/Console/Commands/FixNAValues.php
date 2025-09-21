<?php

namespace App\Console\Commands;

use App\Models\ActivityRecce;
use App\Models\RoutePlan;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class FixNAValues extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'fix:na-values {--dry-run : Show what would be updated without making changes}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Fix #N/A values in village_code and wall_code columns in activity_recces table';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $dryRun = $this->option('dry-run');

        if ($dryRun) {
            $this->info('🔍 DRY RUN MODE - No changes will be made');
            $this->newLine();
        } else {
            $this->info('🚀 EXECUTING UPDATES - Changes will be made to the database');
            $this->newLine();
        }

        // Get affected activities with their corresponding route plans
        $affectedActivities = DB::table('activity_recces as ar')
            ->join('route_plans as rp', 'ar.plan_id', '=', 'rp.id')
            ->where('ar.village_code', '#N/A')
            ->whereNotNull('rp.village_code')
            ->where('rp.village_code', '!=', '#N/A')
            ->select(
                'ar.id as activity_id',
                'ar.plan_id',
                'ar.village',
                'ar.village_code as current_village_code',
                'ar.wall_code as current_wall_code',
                'rp.village_code as correct_village_code'
            )
            ->get();

        if ($affectedActivities->isEmpty()) {
            $this->info('✅ No activities found with #N/A values that need fixing.');
            return 0;
        }

        $this->info("Found {$affectedActivities->count()} activities that need fixing:");
        $this->newLine();

        // Group by route plan for better display
        $groupedByPlan = $affectedActivities->groupBy('plan_id');

        foreach ($groupedByPlan as $planId => $activities) {
            $firstActivity = $activities->first();
            $this->info("📍 Plan {$planId} - {$firstActivity->village}:");
            $this->info("   Village Code: {$firstActivity->current_village_code} → {$firstActivity->correct_village_code}");
            $this->info("   Activities affected: {$activities->count()}");

            // Show first few wall code examples
            $wallCodeExamples = $activities->take(3)->pluck('current_wall_code')->toArray();
            $newWallCodeExamples = array_map(function($wallCode) use ($firstActivity) {
                return str_replace('#N/A', $firstActivity->correct_village_code, $wallCode);
            }, $wallCodeExamples);

            $this->info("   Wall Code examples:");
            foreach ($wallCodeExamples as $index => $wallCode) {
                $this->info("     {$wallCode} → {$newWallCodeExamples[$index]}");
            }
            $this->newLine();
        }

        if ($dryRun) {
            $this->warn('This was a dry run. No changes were made.');
            $this->info('Run without --dry-run flag to execute the updates.');
            return 0;
        }

        // Ask for confirmation
        if (!$this->confirm('Do you want to proceed with these updates?')) {
            $this->info('Operation cancelled.');
            return 0;
        }

        // Start transaction
        DB::beginTransaction();

        try {
            $villageCodeUpdated = 0;
            $wallCodeUpdated = 0;

            $this->info('🔄 Updating village codes...');

            // Update village codes
            $villageCodeUpdated = DB::table('activity_recces as ar')
                ->join('route_plans as rp', 'ar.plan_id', '=', 'rp.id')
                ->where('ar.village_code', '#N/A')
                ->whereNotNull('rp.village_code')
                ->where('rp.village_code', '!=', '#N/A')
                ->update(['ar.village_code' => DB::raw('rp.village_code')]);

            $this->info("✅ Updated {$villageCodeUpdated} village codes");

            $this->info('🔄 Updating wall codes...');

            // Update wall codes - we need to do this per route plan since REPLACE function needs specific values
            foreach ($groupedByPlan as $planId => $activities) {
                $correctVillageCode = $activities->first()->correct_village_code;

                $updated = DB::table('activity_recces as ar')
                    ->join('route_plans as rp', 'ar.plan_id', '=', 'rp.id')
                    ->where('ar.plan_id', $planId)
                    ->where('ar.wall_code', 'LIKE', '%#N/A%')
                    ->whereNotNull('rp.village_code')
                    ->where('rp.village_code', '!=', '#N/A')
                    ->update(['ar.wall_code' => DB::raw("REPLACE(ar.wall_code, '#N/A', '{$correctVillageCode}')")]);

                $wallCodeUpdated += $updated;
            }

            $this->info("✅ Updated {$wallCodeUpdated} wall codes");

            // Commit transaction
            DB::commit();

            $this->newLine();
            $this->info('🎉 SUCCESS! All updates completed successfully.');
            $this->info("📊 Summary:");
            $this->info("   - Village codes updated: {$villageCodeUpdated}");
            $this->info("   - Wall codes updated: {$wallCodeUpdated}");
            $this->info("   - Total records affected: " . max($villageCodeUpdated, $wallCodeUpdated));

        } catch (\Exception $e) {
            DB::rollBack();
            $this->error('❌ Error occurred during update: ' . $e->getMessage());
            return 1;
        }

        return 0;
    }
}
