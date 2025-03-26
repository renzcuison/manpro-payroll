<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTrainingContentTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('training_content', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('training_id');
            $table->unsignedInteger('order')->default(0)->nullable();
            $table->string('title', 128)->nullable();
            $table->string('description', 1024)->nullable();
            $table->unsignedInteger('duration')->default(0);
            $table->unsignedBigInteger('training_media_id')->nullable(0);
            $table->unsignedBigInteger('training_form_id')->nullable(0);
            $table->softDeletes();
            $table->timestamps();

            $table->foreign('training_id')->references('id')->on('trainings')->onDelete('cascade');
            $table->foreign('training_media_id')->references('id')->on('training_media');
            $table->foreign('training_form_id')->references('id')->on('training_forms');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('training_content');
    }
}
