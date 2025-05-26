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
        Schema::create('peme_q_type', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('peme_q_item_id');
            $table->enum('input_type', ['attachment', 'radio', 'remarks', 'text']);
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('peme_q_item_id')->references('id')->on('peme_q_item')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('peme_q_type');
    }
};
