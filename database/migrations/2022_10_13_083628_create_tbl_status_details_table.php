<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTblStatusDetailsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('tbl_status_details', function (Blueprint $table) {
            $table->integer('status_details_id', true);
            $table->integer('status_id')->nullable();
            $table->integer('contact_id')->nullable();
            $table->integer('status_list_id')->nullable();
            $table->integer('task_id')->nullable();
            $table->integer('status')->default(0);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('tbl_status_details');
    }
}
