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
            $table->string('product_type')->nullable()->after('status')->comment('Type of product being promoted');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('activity_recces', function (Blueprint $table) {
            $table->dropColumn('product_type');
        });
    }
};
