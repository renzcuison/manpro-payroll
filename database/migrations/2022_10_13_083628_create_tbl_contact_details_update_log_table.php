<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTblContactDetailsUpdateLogTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('tbl_contact_details_update_log', function (Blueprint $table) {
            $table->integer('contact_update_log_id', true);
            $table->integer('task_id');
            $table->integer('user_id');
            $table->integer('contact_id');
            $table->text('comment');
            $table->string('prev_data');
            $table->string('new_data');
            $table->dateTime('date_updated');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('tbl_contact_details_update_log');
    }
}
