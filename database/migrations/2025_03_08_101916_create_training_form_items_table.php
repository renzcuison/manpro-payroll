<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTrainingFormItemsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('training_form_items', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('form_id');
            $table->enum('type', ['Choice', 'MultiSelect', 'FillInTheBlank']);
            $table->string('description', 256);
            $table->unsignedInteger('value')->default(1);
            $table->timestamps();

            $table->foreign('form_id')->references('id')->on('training_forms')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('training_form_items');
    }
}
