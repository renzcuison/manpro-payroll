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
        Schema::table('salary_plans_logs', function (Blueprint $table) {
            // Drop version columns first
            $table->dropColumn('old_salary_grade_version');
            $table->dropColumn('new_salary_grade_version');
            // Drop old integer grade columns
            $table->dropColumn('old_salary_grade');
            $table->dropColumn('new_salary_grade');
        });

        Schema::table('salary_plans_logs', function (Blueprint $table) {
            // Add new string grade columns
            $table->string('old_salary_grade', 15)->nullable();
            $table->string('new_salary_grade', 15)->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('salary_plans_logs', function (Blueprint $table) {
            // Drop the string columns first
            $table->dropColumn('old_salary_grade');
            $table->dropColumn('new_salary_grade');
        });

        Schema::table('salary_plans_logs', function (Blueprint $table) {
            // Re-add integer columns
            $table->integer('old_salary_grade')->nullable();
            $table->integer('new_salary_grade')->nullable();
            $table->integer('old_salary_grade_version')->nullable()->after('old_salary_grade');
            $table->integer('new_salary_grade_version')->nullable()->after('new_salary_grade');
        });
    }
};
