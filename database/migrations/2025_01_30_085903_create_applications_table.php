<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateApplicationsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('applications', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('type_id');
            $table->dateTime('duration_start');
            $table->dateTime('duration_end');
            $table->string('attachment', 256);
            $table->string('description', 512);
            $table->enum('status',['Pending', 'Approved', 'Declined']);
            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('client_id');
            $table->timestamps();

            $table->foreign('type_id')->references('id')->on('application_types');
            $table->foreign('user_id')->references('id')->on('users');
            $table->foreign('client_id')->references('id')->on('clients');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('applications');
    }
}
