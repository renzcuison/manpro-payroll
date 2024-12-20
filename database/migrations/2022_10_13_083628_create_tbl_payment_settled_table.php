<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTblPaymentSettledTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('tbl_payment_settled', function (Blueprint $table) {
            $table->integer('settle_id', true);
            $table->string('remittance', 55);
            $table->integer('phase_id')->nullable()->index('phase_id');
            $table->integer('finance_id')->nullable()->index('finance_id');
            $table->integer('task_id')->nullable()->index('tbl_payment_settled_ibfk_1');
            $table->integer('user_id')->nullable();
            $table->double('settle_amount')->nullable();
            $table->double('rate_id')->nullable();
            $table->dateTime('date_created')->nullable();
            $table->date('date_paid')->nullable();
            $table->integer('status')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('tbl_payment_settled');
    }
}
