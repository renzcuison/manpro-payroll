<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTblInformationNotiTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('tbl_information_noti', function (Blueprint $table) {
            $table->integer('info_noti_id', true);
            $table->integer('info_id')->nullable();
            $table->integer('contact_id')->nullable();
            $table->integer('info_noti')->default(0);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('tbl_information_noti');
    }
}
