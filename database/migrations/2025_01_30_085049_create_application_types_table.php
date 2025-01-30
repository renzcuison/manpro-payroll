<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateApplicationTypesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('application_types', function (Blueprint $table) {
            $table->id();
            $table->string('name', 128);
            $table->unsignedBigInteger('client_id');
            $table->softDeletes();
            $table->unsignedBigInteger('deleted_by');

            $table->timestamps();

            $table->foreign('client_id')->references('id')->on('clients');
            $table->foreign('deleted_by')->references('id')->on('users');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('application_types');
    }
}
