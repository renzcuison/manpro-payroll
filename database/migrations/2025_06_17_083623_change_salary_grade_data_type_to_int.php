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
            $table->dropColumn('salary_grade');
        });

        Schema::table('salary_plans', function (Blueprint $table) {
            $table->integer('salary_grade')->after('id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('salary_plans', function (Blueprint $table) {
            $table->dropColumn('salary_grade');
        });

        Schema::table('salary_plans', function (Blueprint $table) {
            $table->string('salary_grade', 128)->after('id');
        });
    }
};