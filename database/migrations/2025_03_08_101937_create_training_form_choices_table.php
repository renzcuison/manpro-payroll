<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTrainingFormChoicesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('training_form_choices', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('form_item_id');
            $table->string('description', 256);
            $table->boolean('is_correct')->default(false);

            $table->foreign('form_item_id')->references('id')->on('training_form_items')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('training_form_choices');
    }
}
