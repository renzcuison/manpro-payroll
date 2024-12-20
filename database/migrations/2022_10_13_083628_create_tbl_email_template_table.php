<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTblEmailTemplateTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('tbl_email_template', function (Blueprint $table) {
            $table->integer('email_template_id', true);
            $table->string('email_name', 150);
            $table->string('subject');
            $table->text('body');
            $table->dateTime('date_created')->useCurrent();
            $table->integer('user_id');
            $table->integer('is_deleted')->default(0);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('tbl_email_template');
    }
}
