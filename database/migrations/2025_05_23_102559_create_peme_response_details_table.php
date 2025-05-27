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
        Schema::create('peme_response_details', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('peme_response_id');
            $table->unsignedBigInteger('peme_q_item_id');
            $table->unsignedBigInteger('peme_q_type_id')->nullable();
            $table->string('value_text', 256)->nullable();
            $table->string('value_remark', 512)->nullable();
            $table->enum('value_pass_fail', ['Pass', 'Fail'])->nullable();
            $table->enum('value_pos_neg', ['Positive', 'Negative'])->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('peme_response_id')->references('id')->on('peme_response')->onDelete('cascade');
            $table->foreign('peme_q_item_id')->references('id')->on('peme_q_item')->onDelete('cascade');
            $table->foreign('peme_q_type_id',)->references('id')->on('peme_q_type')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('peme_response_details');
    }
};
