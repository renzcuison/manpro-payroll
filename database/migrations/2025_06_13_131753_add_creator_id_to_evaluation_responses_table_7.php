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
        Schema::disableForeignKeyConstraints();
        Schema::table('evaluation_responses', function (Blueprint $table) {
            $table->dropColumn('current_step');
            $table->dropColumn('status');
            $table->dropColumn('evaluator_completed_at');
            $table->dropColumn('first_commentor_completed_at');
            $table->dropColumn('second_commentor_completed_at');
            $table->dropColumn('evaluatee_acknowledged_at');
            
            $table->unsignedBigInteger('creator_id')->after('id');

            $table->foreign('creator_id')->references('id')->on('users');
        });
        Schema::enableForeignKeyConstraints();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('evaluation_responses', function (Blueprint $table) {
            $table->string('current_step')->nullable();
            $table->string('status')->default('pending');
            $table->timestamp('evaluator_completed_at')->nullable();
            $table->timestamp('first_commentor_completed_at')->nullable();
            $table->timestamp('second_commentor_completed_at')->nullable();
            $table->timestamp('evaluatee_acknowledged_at')->nullable();
            $table->dropForeign(['creator_id']);
            $table->dropColumn('creator_id');
        });
    }
};
