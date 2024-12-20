<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateEmailSendHistoryTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('email_send_history', function (Blueprint $table) {
            $table->integer('email_send_id', true);
            $table->dateTime('email_send_date')->nullable();
            $table->integer('email_send_by')->nullable();
            $table->integer('email_format_id')->nullable();
            $table->string('email_send_to')->nullable();
            $table->integer('email_task_id')->nullable();
            $table->text('email_content')->nullable();
            $table->integer('email_blast')->nullable()->default(0);
            $table->integer('email_status_id')->nullable();
            $table->integer('email_list_id')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('email_send_history');
    }
}
