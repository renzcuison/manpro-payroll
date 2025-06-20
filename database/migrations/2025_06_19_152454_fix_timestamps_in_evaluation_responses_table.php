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
        Schema::table('evaluation_responses', function (Blueprint $table) {
            $table->renameColumn('period_end_at', 'a');
            $table->renameColumn('period_start_at', 'b');
        });
        Schema::table('evaluation_responses', function (Blueprint $table) {
            $table->renameColumn('created_at', 'period_end_at');
            $table->renameColumn('updated_at', 'period_start_at');
        });
        Schema::table('evaluation_responses', function (Blueprint $table) {
            $table->renameColumn('a', 'created_at');
            $table->renameColumn('b', 'updated_at');
        });
        DB::unprepared('ALTER TABLE evaluation_responses MODIFY updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('evaluation_responses', function (Blueprint $table) {
            $table->renameColumn('created_at', 'a');
            $table->renameColumn('updated_at', 'b');
        });
        Schema::table('evaluation_responses', function (Blueprint $table) {
            $table->renameColumn('period_end_at', 'created_at');
            $table->renameColumn('period_start_at', 'updated_at');
        });
        Schema::table('evaluation_responses', function (Blueprint $table) {
            $table->renameColumn('a', 'period_end_at');
            $table->renameColumn('b', 'period_start_at');
        });
        DB::unprepared('ALTER TABLE evaluation_responses MODIFY period_start_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');
    }
};
