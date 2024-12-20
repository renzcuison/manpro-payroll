<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTblAccountingAccountsRelTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('tbl_accounting_accounts_rel', function (Blueprint $table) {
            $table->integer('account_rel_id', true);
            $table->integer('account_id');
            $table->integer('transaction_id');
            $table->integer('paid_id')->default(0);
            $table->dateTime('date_created');
            $table->dateTime('date_updated')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('tbl_accounting_accounts_rel');
    }
}
