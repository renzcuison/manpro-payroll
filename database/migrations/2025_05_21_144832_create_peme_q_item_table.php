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
        Schema::create('peme_q_item', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('peme_id');
            $table->string('question', 256);
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('peme_id')->references('id')->on('peme')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('peme_q_item');
    }
};
