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
        Schema::create('promoters', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('username')->unique();
            $table->string('password')->nullable();
            $table->string('state')->nullable();
            $table->string('district')->nullable();
            $table->boolean('is_active')->default(true);
            $table->string('device_id')->nullable();
            $table->boolean('is_logged_in')->default(false);
            $table->timestamp('last_active')->nullable();
            $table->string('app_version')->nullable();
            $table->string('device_token')->nullable();
            $table->string('status')->default('active');
            $table->string('profile_image')->nullable();
            $table->rememberToken();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('promoters');
    }
};
