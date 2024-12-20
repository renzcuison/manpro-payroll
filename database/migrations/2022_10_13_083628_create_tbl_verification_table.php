<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTblVerificationTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('tbl_verification', function (Blueprint $table) {
            $table->integer('verification_id', true);
            $table->string('verification_code')->nullable();
            $table->integer('verification_status')->nullable()->default(0);
            $table->integer('user_id')->nullable();
            $table->dateTime('date_created')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('tbl_verification');
    }
}
