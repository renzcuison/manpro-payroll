<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTblInformationTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('tbl_information', function (Blueprint $table) {
            $table->integer('info_id', true);
            $table->string('info_title')->nullable();
            $table->text('info_text')->nullable();
            $table->string('info_image')->nullable();
            $table->integer('info_status')->nullable();
            $table->integer('info_noti')->nullable()->default(0);
            $table->integer('sort')->nullable()->default(0);
            $table->integer('deleted')->nullable()->default(0);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('tbl_information');
    }
}
