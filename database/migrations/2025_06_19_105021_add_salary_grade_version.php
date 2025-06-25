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
        Schema::table('salary_plans', function (Blueprint $table) {
            $table->integer('salary_grade_version')->nullable()->after('salary_grade');
        });

        Schema::table('salary_plans_logs', function (Blueprint $table) {
            $table->integer('old_salary_grade_version')->nullable()->after('old_salary_grade');
            $table->integer('new_salary_grade_version')->nullable()->after('new_salary_grade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('salary_plans', function (Blueprint $table) {
            $table->dropColumn('salary_grade_version');
        });

        Schema::table('salary_plans', function (Blueprint $table) {
            $table->dropColumn('old_salary_grade_version');
            $table->dropColumn('new_salary_grade_version');
        });
    }
};
