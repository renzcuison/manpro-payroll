<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTblAccountingPaidTransactionsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('tbl_accounting_paid_transactions', function (Blueprint $table) {
            $table->integer('paid_id', true);
            $table->integer('transaction_id');
            $table->double('amount_paid');
            $table->integer('method_id')->nullable()->index('method_id');
            $table->text('description')->nullable();
            $table->date('date_paid');
            $table->dateTime('date_updated')->nullable();
            $table->integer('paid_by');
            $table->integer('updated_by')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('tbl_accounting_paid_transactions');
    }
}
