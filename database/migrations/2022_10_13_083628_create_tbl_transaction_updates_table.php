<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTblTransactionUpdatesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('tbl_transaction_updates', function (Blueprint $table) {
            $table->integer('trans_update_id', true);
            $table->integer('trans_id');
            $table->integer('task_id');
            $table->integer('updated_by');
            $table->text('update');
            $table->integer('comment_id');
            $table->float('prev_value', 10, 0)->nullable();
            $table->float('new_value', 10, 0)->nullable();
            $table->dateTime('date');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('tbl_transaction_updates');
    }
}
