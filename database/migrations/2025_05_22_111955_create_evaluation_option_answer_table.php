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
        Schema::create('evaluation_option_answers', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('response_id');
            $table->unsignedBigInteger('option_id');
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('response_id')->references('id')->on('evaluation_responses');
            $table->foreign('option_id')->references('id')->on('evaluation_form_subcategory_options');
            $table->unique(['response_id','option_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('evaluation_form_option_answers');
    }
};
