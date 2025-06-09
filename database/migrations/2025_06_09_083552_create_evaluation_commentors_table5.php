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
        Schema::create('evaluation_commentors', function (Blueprint $table) {
            $table->unsignedBigInteger('response_id');
            $table->unsignedBigInteger('commentor_id');
            $table->string('comment')->nullable();
            $table->string('signature_filepath')->nullable();
            $table->unsignedBigInteger('order');
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('response_id')->references('id')->on('evaluation_responses');
            $table->foreign('commentor_id')->references('id')->on('users');
            $table->unique(['response_id','order']);
            $table->unique(['response_id','commentor_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('evaluation_commentors');
    }
};
