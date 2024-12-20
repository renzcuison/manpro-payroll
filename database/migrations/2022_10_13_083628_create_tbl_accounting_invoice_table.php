<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTblAccountingInvoiceTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('tbl_accounting_invoice', function (Blueprint $table) {
            $table->integer('invoice_id', true);
            $table->integer('phase_id');
            $table->integer('task_id');
            $table->integer('contact_id');
            $table->integer('user_id');
            $table->integer('net_terms');
            $table->date('date_created');
            $table->date('due_date');
            $table->date('date_sent_email')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('tbl_accounting_invoice');
    }
}
