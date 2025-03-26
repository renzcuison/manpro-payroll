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
            $table->string('unique_code', 16)->unique();
            $table->string('title', 128);
            $table->string('description', 1024);
            $table->string('cover_photo', 256)->nullable();
            $table->enum('status', ['Pending', 'Active', 'Hidden', 'Cancelled'])->default('Pending');
            $table->dateTime('start_date');
            $table->dateTime('end_date');
            $table->unsignedInteger('duration');
            $table->unsignedBigInteger('client_id');
            $table->unsignedBigInteger('created_by');
            $table->boolean('sequential')->default(true);
            $table->timestamps();

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
