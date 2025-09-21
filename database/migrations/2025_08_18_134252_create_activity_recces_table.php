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
        Schema::create('activity_recces', function (Blueprint $table) {
            $table->id();
            $table->dateTime('visit_date');
            $table->unsignedBigInteger('plan_id')->nullable();
            $table->unsignedBigInteger('promoter_id')->nullable();
            $table->string('device_id')->nullable();

            $table->string('state');
            $table->string('district');
            $table->string('sub_district');
            $table->string('village');
            $table->string('village_code');
            $table->string('location');
            $table->string('landmark')->nullable();
            // Image paths
            $table->string('close_shot1')->nullable();
            $table->string('close_shot_2')->nullable();
            $table->string('long_shot_1')->nullable();
            $table->string('long_shot_2')->nullable();

            $table->decimal('latitude', 10, 7);
            $table->decimal('longitude', 10, 7);
            $table->decimal('width', 8, 2)->nullable();
            $table->decimal('height', 8, 2)->nullable();
            $table->text('promoter_remarks')->nullable();
            $table->text('remarks')->nullable();
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->enum('client_status', ['pending', 'approved', 'rejected'])->default('pending');

            $table->timestamps();

            // Composite Unique Constraint
            $table->unique(
                ['visit_date', 'promoter_id', 'device_id', 'plan_id'],
                'activity_recces_unique_visit'
            );
            $table->index(['visit_date', 'promoter_id', 'device_id']);
            $table->index(['state', 'district']);
            $table->index(['village_code']);
            $table->index(['status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('activity_recces');
    }
};
