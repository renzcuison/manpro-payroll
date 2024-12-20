<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddForeignKeysToTblAccountingPaidTransactionsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('tbl_accounting_paid_transactions', function (Blueprint $table) {
            $table->foreign(['method_id'], 'method_id')->references(['method_id'])->on('tbl_accounting_method')->onUpdate('CASCADE');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('tbl_accounting_paid_transactions', function (Blueprint $table) {
            $table->dropForeign('method_id');
        });
    }
}
