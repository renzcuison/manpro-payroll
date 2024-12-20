<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateFinanceRemarksTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('finance_remarks', function (Blueprint $table) {
            $table->integer('remarks_id', true);
            $table->string('remarks_by', 20)->nullable();
            $table->string('remarks_to', 20)->nullable();
            $table->string('remarks_phase_id', 20)->nullable();
            $table->string('remarks_value', 50)->nullable();
            $table->integer('admin_notification')->default(0);
            $table->integer('user_notification')->default(0);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('finance_remarks');
    }
}
