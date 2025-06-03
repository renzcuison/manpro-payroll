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
        Schema::create('evaluation_responses', function (Blueprint $table) {
            $table->id();
            $table->timestamp('period_start_at');
            $table->timestamp('period_end_at');
            $table->string('signature_filepath');
            $table->unsignedBigInteger('evaluatee_id');
            $table->unsignedBigInteger('evaluator_id');
            $table->unsignedBigInteger('primary_commentor_id');
            $table->unsignedBigInteger('secondary_commentor_id');
            $table->unsignedBigInteger('form_id');
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('evaluatee_id')->references('id')->on('users');
            $table->foreign('evaluator_id')->references('id')->on('users');
            $table->foreign('primary_commentor_id')->references('id')->on('users');
            $table->foreign('secondary_commentor_id')->references('id')->on('users');
            $table->foreign('form_id')->references('id')->on('evaluation_forms');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('evaluation_responses');
    }
};
