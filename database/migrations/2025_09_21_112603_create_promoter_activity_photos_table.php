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
        Schema::create('promoter_activity_photos', function (Blueprint $table) {
            $table->id();

            // Activity reference
            $table->unsignedBigInteger('promoter_activity_id');
            $table->foreign('promoter_activity_id')->references('id')->on('promoter_activities')->onDelete('cascade');

            // Photo details
            $table->enum('photo_type', ['login', 'activity', 'logout'])->default('activity');
            $table->string('file_path');
            $table->string('file_name');
            $table->string('mime_type')->nullable();
            $table->integer('file_size')->nullable(); // in bytes

            // Photo metadata
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->timestamp('captured_at');
            $table->text('description')->nullable();

            // Sync tracking
            $table->boolean('is_synced')->default(false);
            $table->timestamp('synced_at')->nullable();

            $table->timestamps();

            // Indexes
            $table->index(['promoter_activity_id', 'photo_type']);
            $table->index('captured_at');
            $table->index('is_synced');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('promoter_activity_photos');
    }
};
