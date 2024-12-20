<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateFinanceFieldCaTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('finance_field_ca', function (Blueprint $table) {
            $table->integer('custom_amount_id', true);
            $table->string('custom_amount_user_id', 11)->nullable();
            $table->string('custom_amount_task_id', 11)->nullable();
            $table->string('custom_amount_field_id', 11)->nullable();
            $table->string('custom_amount_value', 30)->nullable();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('finance_field_ca');
    }
}
