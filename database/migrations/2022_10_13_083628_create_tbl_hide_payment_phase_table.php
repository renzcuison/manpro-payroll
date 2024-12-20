<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTblHidePaymentPhaseTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('tbl_hide_payment_phase', function (Blueprint $table) {
            $table->integer('hide_phase_id', true);
            $table->integer('phase_id');
            $table->integer('contact_id');
            $table->integer('task_id');
            $table->dateTime('date_created')->useCurrent();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('tbl_hide_payment_phase');
    }
}
