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
            // Add new fields for updated Vivo feedback questions
            $table->json('key_drivers')->nullable()->after('overall_experience')->comment('Q2: Key drivers of experience (multi-select)');
            $table->string('brand_perception')->nullable()->after('key_drivers')->comment('Q3: Brand perception shift');
            $table->json('brand_image')->nullable()->after('brand_perception')->comment('Q4: Brand image attributes (multi-select)');

            // Add indexes for better performance
            $table->index('brand_perception');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('feedback', function (Blueprint $table) {
            // Drop the new fields
            $table->dropIndex(['brand_perception']);
            $table->dropColumn(['key_drivers', 'brand_perception', 'brand_image']);
        });
    }
};
