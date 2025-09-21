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
        // Add indexes for better query performance
        Schema::table('activity_recces', function (Blueprint $table) {
            // Index on frequently queried columns
            $table->index(['status', 'visit_date'], 'idx_status_visit_date');
            $table->index(['state', 'district'], 'idx_state_district');
            $table->index(['promoter_id', 'created_at'], 'idx_promoter_created');
            $table->index(['plan_id', 'status'], 'idx_plan_status');
            $table->index('created_at', 'idx_created_at');
        });

        Schema::table('route_plans', function (Blueprint $table) {
            // Index on filter columns
            $table->index(['state', 'is_active'], 'idx_state_active');
            $table->index(['district', 'is_active'], 'idx_district_active');
            $table->index(['sub_district', 'is_active'], 'idx_sub_district_active');
            $table->index(['village', 'is_active'], 'idx_village_active');
        });

        Schema::table('promoters', function (Blueprint $table) {
            // Index on frequently searched columns
            $table->index(['state', 'is_active'], 'idx_promoter_state_active');
            $table->index(['status', 'is_active'], 'idx_promoter_status_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('activity_recces', function (Blueprint $table) {
            $table->dropIndex('idx_status_visit_date');
            $table->dropIndex('idx_state_district');
            $table->dropIndex('idx_promoter_created');
            $table->dropIndex('idx_plan_status');
            $table->dropIndex('idx_created_at');
        });

        Schema::table('route_plans', function (Blueprint $table) {
            $table->dropIndex('idx_state_active');
            $table->dropIndex('idx_district_active');
            $table->dropIndex('idx_sub_district_active');
            $table->dropIndex('idx_village_active');
        });

        Schema::table('promoters', function (Blueprint $table) {
            $table->dropIndex('idx_promoter_state_active');
            $table->dropIndex('idx_promoter_status_active');
        });
    }
};
