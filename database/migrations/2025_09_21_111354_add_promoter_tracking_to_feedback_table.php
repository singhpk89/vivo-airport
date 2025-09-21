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
        Schema::table('feedback', function (Blueprint $table) {
            // Promoter tracking field
            $table->unsignedBigInteger('assisted_by_promoter_id')->nullable()->after('responded_by');

            // Foreign key constraint to promoters table
            $table->foreign('assisted_by_promoter_id')->references('id')->on('promoters')->onDelete('set null');

            // Index for better performance
            $table->index('assisted_by_promoter_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('feedback', function (Blueprint $table) {
            // Drop foreign key first
            $table->dropForeign(['assisted_by_promoter_id']);

            // Drop index
            $table->dropIndex(['assisted_by_promoter_id']);

            // Drop column
            $table->dropColumn('assisted_by_promoter_id');
        });
    }
};
