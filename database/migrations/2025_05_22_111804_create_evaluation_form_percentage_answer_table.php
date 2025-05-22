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
        Schema::create('evaluation_response_percentage_answers', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('response_id');
            $table->unsignedBigInteger('subcategory_id');
            $table->decimal('percentage');
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('response_id')->references('id')->on('evaluation_responses');
            $table->foreign('subcategory_id')->references('id')->on('evaluation_form_subcategories');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('evaluation_form_percentage_answers');
    }
};
