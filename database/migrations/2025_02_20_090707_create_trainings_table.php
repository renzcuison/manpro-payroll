<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTrainingsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('trainings', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('training_course_id');
            $table->string('title', 128);
            $table->string('description', 512);
            $table->string('cover_photo', 256)->nullable();
            $table->unsignedBigInteger('client_id');
            $table->unsignedBigInteger('created_by');
            $table->enum('status', ['Pending', 'Active', 'Inactive', 'Hidden'])->default('Pending');
            $table->dateTime('start_date');
            $table->dateTime('end_date');
            $table->timestamps();

            $table->foreign('training_course_id')->references('id')->on('training_courses');
            $table->foreign('client_id')->references('id')->on('clients');
            $table->foreign('created_by')->references('id')->on('users');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('trainings');
    }
}
