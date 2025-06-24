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
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('salary_grade');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->string('salary_grade', 15)->after('salary_type')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('salary_grade');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->string('salary_grade')->after('salary_type')->nullable();
        });
    }
};
