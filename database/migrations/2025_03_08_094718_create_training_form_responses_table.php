<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTrainingFormResponsesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('training_form_responses', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('training_view_id');
            $table->unsignedInteger('score')->nullable()->comment('Total score for the form submission');
            $table->timestamps();

            $table->foreign('training_view_id')->references('id')->on('training_views')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('training_form_responses');
    }
}
