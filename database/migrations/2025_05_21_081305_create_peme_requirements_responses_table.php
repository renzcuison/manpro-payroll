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
        Schema::create('peme_requirements_responses', function (Blueprint $table) {
            $table->id();
            $table->timestamps();
            $table->softDeletes();
            $table->unsignedBigInteger('peme_requirement_id');
            $table->unsignedBigInteger('peme_response_id');

            $table->foreign('peme_requirement_id')->references('id')->on('peme_requirements');
            $table->foreign('peme_response_id')->references('id')->on('peme_responses');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('peme_requirements_responses');
    }
};