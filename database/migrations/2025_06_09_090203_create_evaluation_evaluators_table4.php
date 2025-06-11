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
        Schema::create('evaluation_evaluators', function (Blueprint $table) {
            $table->unsignedBigInteger('response_id');
            $table->unsignedBigInteger('evaluator_id');
            $table->string('comment')->nullable();
            $table->unsignedBigInteger('order');
            $table->string('signature_filepath')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('response_id')->references('id')->on('evaluation_responses');
            $table->foreign('evaluator_id')->references('id')->on('users');
            $table->unique(['response_id','order']);
            $table->unique(['response_id','evaluator_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('evaluation_evaluators');
    }
};
