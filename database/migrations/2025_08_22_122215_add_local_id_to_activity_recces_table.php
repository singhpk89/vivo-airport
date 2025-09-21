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
        Schema::table('activity_recces', function (Blueprint $table) {
            $table->string('local_id')->nullable()->after('device_id')->comment('Local device ID for mapping to server ID');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('activity_recces', function (Blueprint $table) {
            $table->dropColumn('local_id');
        });
    }
};
