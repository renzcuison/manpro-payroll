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
        Schema::table('employee_educations', function (Blueprint $table) {
            // Rename degree_type to education_level
            $table->renameColumn('degree_type', 'education_level');

            // Rename degree_name to program_name
            $table->renameColumn('degree_name', 'program_name');
        });
        // Modify enum values for education_level
        DB::statement("ALTER TABLE employee_educations MODIFY COLUMN education_level ENUM('Elementary', 'High School', 'Senior High School', 'College/Bachelors', 'Masters', 'Doctoral') NULL");
    }

    /**
     * Reverse the migrations.
     */
    public function down()
    {
        Schema::table('employee_educations', function (Blueprint $table) {
            // Rename education_level back to degree_type
            $table->renameColumn('education_level', 'degree_type');

            // Rename program_name back to degree_name
            $table->renameColumn('program_name', 'degree_name');
        });

        // Revert enum to old values and make NOT NULL (adjust to your original state)
        DB::statement("ALTER TABLE employee_educations MODIFY COLUMN degree_type ENUM('College/Bachelors', 'Master', 'Doctoral') NULL");
    }
};
