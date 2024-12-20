<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTblAccountingEmailHistoryTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('tbl_accounting_email_history', function (Blueprint $table) {
            $table->integer('email_hist_id', true);
            $table->integer('invoice_id');
            $table->string('email_from');
            $table->string('email_to');
            $table->string('subject');
            $table->text('body');
            $table->float('balance', 10, 0);
            $table->dateTime('date_sent');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('tbl_accounting_email_history');
    }
}
