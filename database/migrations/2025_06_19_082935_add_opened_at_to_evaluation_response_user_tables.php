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
            $table->timestamp('evaluatee_opened_at')->nullable()->after('form_id');
        });
        Schema::table('evaluation_evaluators', function (Blueprint $table) {
            $table->timestamp('opened_at')->nullable()->after('order');
        });
        Schema::table('evaluation_commentors', function (Blueprint $table) {
            $table->timestamp('opened_at')->nullable()->after('order');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('evaluation_responses', function (Blueprint $table) {
            $table->dropColumn('evaluatee_opened_at');
        });
        Schema::table('evaluation_evaluators', function (Blueprint $table) {
            $table->dropColumn('opened_at');
        });
        Schema::table('evaluation_commentors', function (Blueprint $table) {
            $table->dropColumn('opened_at');
        });
    }
};
