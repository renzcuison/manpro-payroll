<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTblAccountingAccountsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('tbl_accounting_accounts', function (Blueprint $table) {
            $table->integer('account_id', true);
            $table->integer('account_type')->nullable();
            $table->integer('detail_type')->nullable();
            $table->string('name', 55);
            $table->text('description');
            $table->double('balance');
            $table->dateTime('date_created');
            $table->integer('status');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('tbl_accounting_accounts');
    }
}
