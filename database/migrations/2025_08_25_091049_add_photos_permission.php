<?php

use App\Models\Permission;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Create photos.view permission only if it doesn't exist
        if (! Permission::where('name', 'photos.view')->exists()) {
            Permission::create([
                'name' => 'photos.view',
                'description' => 'View photo gallery and manage images',
                'module' => 'photos',
            ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Remove photos.view permission
        Permission::where('name', 'photos.view')->delete();
    }
};
