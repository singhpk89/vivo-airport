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
        Schema::table('route_plans', function (Blueprint $table) {
            // Get database driver
            $connection = Schema::getConnection();
            $driver = $connection->getDriverName();

            // Only add indexes if they don't already exist
            $indexes = [
                'route_plans_state_index' => 'state',
                'route_plans_district_index' => 'district',
                'route_plans_sub_district_index' => 'sub_district',
                'route_plans_created_at_index' => 'created_at',
                'route_plans_updated_at_index' => 'updated_at',
            ];

            $compositeIndexes = [
                'route_plans_location_index' => ['state', 'district', 'sub_district'],
                'route_plans_status_created_index' => ['status', 'created_at'],
            ];

            // Get existing indexes based on database driver
            $existingIndexes = [];
            try {
                $tableName = $connection->getTablePrefix().'route_plans';

                if ($driver === 'sqlite') {
                    $indexes_result = $connection->select("PRAGMA index_list(route_plans)");
                    foreach ($indexes_result as $index) {
                        $existingIndexes[] = $index->name;
                    }
                } else {
                    $indexes_result = $connection->select("SHOW INDEX FROM `{$tableName}`");
                    foreach ($indexes_result as $index) {
                        $existingIndexes[] = $index->Key_name;
                    }
                }
            } catch (\Exception $e) {
                // If we can't get indexes, continue anyway
            }

            // Add single column indexes (skip village_code as it already exists from table creation)
            foreach ($indexes as $indexName => $column) {
                if (! in_array($indexName, $existingIndexes)) {
                    $table->index($column, $indexName);
                }
            }

            // Add composite indexes (skip state_district as it already exists from table creation)
            foreach ($compositeIndexes as $indexName => $columns) {
                if (! in_array($indexName, $existingIndexes)) {
                    $table->index($columns, $indexName);
                }
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('route_plans', function (Blueprint $table) {
            // Drop indexes in reverse order (only drop the ones we added)
            $table->dropIndex('route_plans_status_created_index');
            $table->dropIndex('route_plans_location_index');
            $table->dropIndex('route_plans_updated_at_index');
            $table->dropIndex('route_plans_created_at_index');
            $table->dropIndex('route_plans_sub_district_index');
            $table->dropIndex('route_plans_district_index');
            $table->dropIndex('route_plans_state_index');
        });
    }
};
