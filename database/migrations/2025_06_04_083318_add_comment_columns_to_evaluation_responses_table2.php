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
            $table->string('evaluator_comment')->nullable()->after('form_id');
            $table->string('primary_comment')->nullable()->after('evaluator_comment');
            $table->string('secondary_comment')->nullable()->after('primary_comment');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('evaluation_responses', function (Blueprint $table) {
            //
        });
    }
};
