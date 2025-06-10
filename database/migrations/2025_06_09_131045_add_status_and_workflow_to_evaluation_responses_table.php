<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('evaluation_responses', function (Blueprint $table) {
            $table->string('status')->default('pending');
            $table->string('current_step')->nullable();
            $table->timestamp('evaluator_completed_at')->nullable();
            $table->timestamp('first_commentor_completed_at')->nullable();
            $table->timestamp('second_commentor_completed_at')->nullable();
            $table->timestamp('evaluatee_acknowledged_at')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('evaluation_responses', function (Blueprint $table) {
            $table->dropColumn([
                'status',
                'current_step',
                'evaluator_completed_at',
                'first_commentor_completed_at',
                'second_commentor_completed_at',
                'evaluatee_acknowledged_at',
            ]);
        });
    }
};