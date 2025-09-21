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
        Schema::create('feedback', function (Blueprint $table) {
            $table->id();

            // Basic feedback information
            $table->string('subject')->nullable();
            $table->text('message')->nullable();
            $table->string('category')->nullable();
            $table->string('priority')->default('medium');
            $table->string('status')->default('open');
            $table->string('form_type')->nullable(); // 'general', 'vivo_experience'

            // Contact information (all optional)
            $table->string('visitor_name')->nullable();
            $table->string('visitor_email')->nullable();
            $table->string('visitor_phone')->nullable();
            $table->date('visit_date')->nullable();
            $table->boolean('is_anonymous')->default(false);
            $table->boolean('allow_marketing_contact')->default(false);

            // Vivo Experience specific fields
            $table->string('overall_experience')->nullable();
            $table->string('favorite_section')->nullable();
            $table->string('preferred_model')->nullable();
            $table->string('souvenir_experience')->nullable();
            $table->text('suggestions')->nullable();

            // Legacy fields for general feedback compatibility
            $table->string('name')->nullable();
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->integer('experience_rating')->nullable();
            $table->integer('recommendation_likelihood')->nullable();
            $table->text('favorite_feature')->nullable();
            $table->text('improvement_suggestions')->nullable();
            $table->string('visit_frequency')->nullable();
            $table->string('feedback_type')->nullable();

            // Admin response
            $table->text('admin_response')->nullable();
            $table->timestamp('responded_at')->nullable();
            $table->unsignedBigInteger('responded_by')->nullable();

            $table->timestamps();

            // Foreign key constraints
            $table->foreign('responded_by')->references('id')->on('users')->onDelete('set null');

            // Indexes for better performance
            $table->index(['form_type', 'status']);
            $table->index(['category', 'priority']);
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('feedback');
    }
};
