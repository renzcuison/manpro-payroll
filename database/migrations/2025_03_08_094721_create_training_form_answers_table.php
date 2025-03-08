<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTrainingFormAnswersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('training_form_answers', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('form_response_id');
            $table->unsignedBigInteger('form_choice_id');

            $table->foreign('form_response_id')->references('id')->on('training_form_responses')->onDelete('cascade');
            $table->foreign('form_choice_id')->references('id')->on('training_form_choices')->onDelete('cascade');
            $table->unique(['form_response_id', 'form_choice_id']);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('training_form_answers');
    }
}
