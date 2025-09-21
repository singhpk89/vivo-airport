<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // For SQLite, we'll just add a check constraint to validate the new enum values
        // The status column already exists as TEXT, which can handle the new values
        $connection = Schema::getConnection();
        $driver = $connection->getDriverName();

        if ($driver === 'sqlite') {
            // SQLite: Add check constraint for enum validation
            try {
                DB::statement("CREATE TRIGGER check_activity_recces_status_update
                    BEFORE UPDATE ON activity_recces
                    FOR EACH ROW
                    WHEN NEW.status NOT IN ('pending', 'approved', 'rejected', 'in_progress', 'completed')
                    BEGIN
                        SELECT RAISE(ABORT, 'Invalid status value');
                    END");

                DB::statement("CREATE TRIGGER check_activity_recces_status_insert
                    BEFORE INSERT ON activity_recces
                    FOR EACH ROW
                    WHEN NEW.status NOT IN ('pending', 'approved', 'rejected', 'in_progress', 'completed')
                    BEGIN
                        SELECT RAISE(ABORT, 'Invalid status value');
                    END");
            } catch (\Exception $e) {
                // If triggers can't be created, continue without them
            }
        } else {
            // MySQL/PostgreSQL approach
            DB::statement("ALTER TABLE activity_recces MODIFY COLUMN status ENUM('pending', 'approved', 'rejected', 'in_progress', 'completed') DEFAULT 'pending'");
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $connection = Schema::getConnection();
        $driver = $connection->getDriverName();

        if ($driver === 'sqlite') {
            // SQLite: Drop the triggers
            try {
                DB::statement("DROP TRIGGER IF EXISTS check_activity_recces_status_update");
                DB::statement("DROP TRIGGER IF EXISTS check_activity_recces_status_insert");
            } catch (\Exception $e) {
                // If triggers don't exist, continue
            }
        } else {
            // MySQL/PostgreSQL approach
            DB::statement("ALTER TABLE activity_recces MODIFY COLUMN status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending'");
        }
    }
};
