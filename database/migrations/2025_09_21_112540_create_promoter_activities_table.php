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
        Schema::create('promoter_activities', function (Blueprint $table) {
            $table->id();

            // Promoter reference
            $table->unsignedBigInteger('promoter_id');
            $table->foreign('promoter_id')->references('id')->on('promoters')->onDelete('cascade');

            // Activity session details
            $table->date('activity_date');
            $table->timestamp('login_time')->nullable();
            $table->timestamp('logout_time')->nullable();
            $table->enum('status', ['logged_in', 'logged_out', 'active'])->default('logged_in');

            // Geo coordinates for login/logout
            $table->decimal('login_latitude', 10, 8)->nullable();
            $table->decimal('login_longitude', 11, 8)->nullable();
            $table->decimal('logout_latitude', 10, 8)->nullable();
            $table->decimal('logout_longitude', 11, 8)->nullable();

            // Activity summary
            $table->integer('total_photos_captured')->default(0);
            $table->integer('total_feedback_captured')->default(0);
            $table->text('activity_notes')->nullable();

            // Sync tracking
            $table->timestamp('last_sync_time')->nullable();
            $table->boolean('is_synced')->default(false);

            $table->timestamps();

            // Indexes for performance
            $table->index(['promoter_id', 'activity_date']);
            $table->index('activity_date');
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('promoter_activities');
    }
};
