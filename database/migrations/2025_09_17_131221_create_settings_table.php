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
        // Check if table exists, if so just add missing columns
        if (Schema::hasTable('settings')) {
            Schema::table('settings', function (Blueprint $table) {
                if (!Schema::hasColumn('settings', 'key')) {
                    $table->string('key')->unique();
                }
                if (!Schema::hasColumn('settings', 'value')) {
                    $table->text('value')->nullable();
                }
                if (!Schema::hasColumn('settings', 'type')) {
                    $table->string('type')->default('string'); // string, boolean, integer, file
                }
                if (!Schema::hasColumn('settings', 'description')) {
                    $table->text('description')->nullable();
                }
                if (!Schema::hasColumn('settings', 'is_public')) {
                    $table->boolean('is_public')->default(false);
                }
            });
        } else {
            Schema::create('settings', function (Blueprint $table) {
                $table->id();
                $table->string('key')->unique();
                $table->text('value')->nullable();
                $table->string('type')->default('string'); // string, boolean, integer, file
                $table->text('description')->nullable();
                $table->boolean('is_public')->default(false);
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('settings');
    }
};
