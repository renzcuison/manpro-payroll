<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTblAccountingTransRateTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('tbl_accounting_trans_rate', function (Blueprint $table) {
            $table->integer('rate_id', true);
            $table->float('system_rate', 10, 0);
            $table->float('client_rate', 10, 0);
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
        Schema::dropIfExists('tbl_accounting_trans_rate');
    }
}
