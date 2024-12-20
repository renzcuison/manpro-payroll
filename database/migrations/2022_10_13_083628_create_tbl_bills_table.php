<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTblBillsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('tbl_bills', function (Blueprint $table) {
            $table->integer('payment_id', true);
            $table->string('payment_name');
            $table->text('description');
            $table->text('note')->nullable();
            $table->double('amount_paid');
            $table->integer('user_id');
            $table->date('date_created');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('tbl_bills');
    }
}
