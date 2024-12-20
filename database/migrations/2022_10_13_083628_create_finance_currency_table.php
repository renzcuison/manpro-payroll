<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateFinanceCurrencyTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('finance_currency', function (Blueprint $table) {
            $table->integer('currency_id', true);
            $table->dateTime('currency_date')->nullable();
            $table->string('currency_name', 50)->nullable();
            $table->string('currency_code', 10)->nullable();
            $table->string('currency_val_usd', 20)->nullable();
            $table->string('currency_val_php', 20)->nullable();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('finance_currency');
    }
}
