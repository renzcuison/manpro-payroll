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
        Schema::create('evaluation_rating_choices', function (Blueprint $table) {
            $table->id(); 
            $table->unsignedBigInteger('evaluation_id'); 
            $table->string('choice', 64);
            $table->integer('score_min'); 
            $table->integer('score_max'); 
            $table->string('description', 128);
            $table->timestamps();

            // Foreign key reference to evaluations table
            $table->foreign('evaluation_id')->references('id')->on('evaluations')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('evaluation_rating_choices');
    }
};
