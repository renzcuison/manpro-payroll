<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateEmailPersonalizedTempImageTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('email_personalized_temp_image', function (Blueprint $table) {
            $table->integer('email_img_temp_id', true);
            $table->string('filename');
            $table->integer('email_id');
            $table->dateTime('date_uploaded');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('email_personalized_temp_image');
    }
}
