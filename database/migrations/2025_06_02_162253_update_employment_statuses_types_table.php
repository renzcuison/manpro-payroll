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
        // For employment_type
        DB::statement("ALTER TABLE announcement_employee_types MODIFY COLUMN employment_type ENUM('Probationary', 'Regular', 'Full-Time', 'Part-Time', 'Resigned')");

        // For employment_status
        DB::statement("ALTER TABLE announcement_employee_statuses MODIFY COLUMN employment_status ENUM('Active', 'Suspended', 'Inactive')");
        }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
