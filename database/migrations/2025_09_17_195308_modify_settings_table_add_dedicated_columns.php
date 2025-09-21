<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('settings', function (Blueprint $table) {
            // Add dedicated columns for app name and logo
            $table->string('app_name')->nullable()->after('id');
            $table->string('admin_logo')->nullable()->after('app_name');

            // Keep existing key-value structure for other settings
            // but make key column nullable since we'll use dedicated columns for name/logo
            $table->string('key')->nullable()->change();
        });

        // Migrate existing data from key-value to dedicated columns
        $appNameSetting = \App\Models\Setting::where('key', 'app_name')->first();
        if ($appNameSetting) {
            \App\Models\Setting::where('id', 1)->update(['app_name' => $appNameSetting->value]);
            $appNameSetting->delete();
        }

        $logoSetting = \App\Models\Setting::where('key', 'admin_logo')->first();
        if ($logoSetting) {
            \App\Models\Setting::where('id', 1)->update(['admin_logo' => $logoSetting->value]);
            $logoSetting->delete();
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('settings', function (Blueprint $table) {
            // Restore data to key-value format before dropping columns
            $mainSetting = \App\Models\Setting::find(1);
            if ($mainSetting && $mainSetting->app_name) {
                \App\Models\Setting::create([
                    'key' => 'app_name',
                    'value' => $mainSetting->app_name,
                    'type' => 'string'
                ]);
            }
            if ($mainSetting && $mainSetting->admin_logo) {
                \App\Models\Setting::create([
                    'key' => 'admin_logo',
                    'value' => $mainSetting->admin_logo,
                    'type' => 'file'
                ]);
            }

            // Drop the dedicated columns
            $table->dropColumn(['app_name', 'admin_logo']);

            // Make key column required again
            $table->string('key')->nullable(false)->change();
        });
    }
};
