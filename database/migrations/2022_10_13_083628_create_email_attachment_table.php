<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateEmailAttachmentTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('email_attachment', function (Blueprint $table) {
            $table->integer('email_attachment_id', true);
            $table->integer('email_id');
            $table->integer('email_history_id')->default(0);
            $table->string('filename');
            $table->dateTime('date_attached');
            $table->integer('personalized')->default(0);
            $table->integer('deleted')->default(0);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('email_attachment');
    }
}
