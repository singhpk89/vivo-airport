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
        Schema::create('user_states', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('state');
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            // Ensure a user can only be assigned to each state once
            $table->unique(['user_id', 'state']);

            // Add indexes for performance
            $table->index(['user_id', 'is_active']);
            $table->index(['state', 'is_active']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_states');
    }
};
