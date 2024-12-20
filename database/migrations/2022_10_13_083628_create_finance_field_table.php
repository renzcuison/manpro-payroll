<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateFinanceFieldTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('finance_field', function (Blueprint $table) {
            $table->integer('finance_id', true);
            $table->string('finance_space_id', 11)->nullable();
            $table->string('finance_phase_id', 20)->nullable();
            $table->integer('finance_order')->nullable();
            $table->string('finance_name', 100)->nullable();
            $table->string('finance_currency', 20)->nullable();
            $table->string('finance_value', 20)->nullable();
            $table->string('finance_type', 20)->nullable();
            $table->string('finance_privacy', 20)->nullable();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('finance_field');
    }
}
