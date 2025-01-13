<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateWorkGroupsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('work_groups', function (Blueprint $table) {
            $table->id();
            $table->string('name', 128);
            $table->unsignedBigInteger('work_shift_id');
            $table->unsignedBigInteger('client_id');

            $table->softDeletes();
            $table->timestamps();

            $table->foreign('work_shift_id')->references('id')->on('work_shifts');
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
        //
    }
}
