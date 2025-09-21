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
            $table->string('wall_code')->nullable()->after('village_code');
            $table->index('wall_code');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('activity_recces', function (Blueprint $table) {
            $table->dropIndex(['wall_code']);
            $table->dropColumn('wall_code');
        });
    }
};
