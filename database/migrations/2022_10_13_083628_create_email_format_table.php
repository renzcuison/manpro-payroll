<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateEmailFormatTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('email_format', function (Blueprint $table) {
            $table->integer('email_id', true);
            $table->string('email_created_by', 11)->nullable();
            $table->string('email_template', 100)->nullable();
            $table->string('email_name', 100)->nullable();
            $table->string('email_subject', 100)->nullable();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('email_format');
    }
}
