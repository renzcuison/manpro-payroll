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
        // 1. Add new enum column
        Schema::table('employee_educations', function (Blueprint $table) {
            $table->enum('education_level_temp', [
                'Elementary',
                'High School',
                'Senior High School',
                'Associate',
                'Bachelor',
                'Masters',
                'Doctoral'
            ])->nullable()->after('education_level');
        });

        // 2. Migrate data to temp
        DB::table('employee_educations')->update([
            'education_level_temp' => DB::raw("
                CASE
                    WHEN education_level = 'College/Bachelors' THEN 'Bachelor'
                    ELSE education_level
                END
            ")
        ]);

        // 3. Drop old column
        Schema::table('employee_educations', function (Blueprint $table) {
            $table->dropColumn('education_level');
        });

        // 4. Re-add 'education_level' with enum values
        Schema::table('employee_educations', function (Blueprint $table) {
            $table->enum('education_level', [
                'Elementary',
                'High School',
                'Senior High School',
                'Associate',
                'Bachelor',
                'Masters',
                'Doctoral'
            ])->nullable()->after('program_name');
        });

        // 5. Move values
        DB::table('employee_educations')->update([
            'education_level' => DB::raw('education_level_temp')
        ]);

        // 6. Drop temp
        Schema::table('employee_educations', function (Blueprint $table) {
            $table->dropColumn('education_level_temp');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('employee_educations', function (Blueprint $table) {
            $table->enum('education_level_temp', [
                'Elementary',
                'High School',
                'Senior High School',
                'College/Bachelors',
                'Masters',
                'Doctoral'
            ])->nullable()->after('education_level');
        });

        DB::table('employee_educations')->update([
            'education_level_temp' => DB::raw("
                CASE
                    WHEN education_level = 'Bachelor' THEN 'College/Bachelors'
                    ELSE education_level
                END
            ")
        ]);
        Schema::table('employee_educations', function (Blueprint $table) {
            $table->dropColumn('education_level');
        });

        Schema::table('employee_educations', function (Blueprint $table) {
            $table->enum('education_level', [
                'Elementary',
                'High School',
                'Senior High School',
                'College/Bachelors',
                'Masters',
                'Doctoral'
            ])->nullable()->after('program_name');
        });

        DB::table('employee_educations')->update([
            'education_level' => DB::raw('education_level_temp')
        ]);

        Schema::table('employee_educations', function (Blueprint $table) {
            $table->dropColumn('education_level_temp');
        });
    }
};
