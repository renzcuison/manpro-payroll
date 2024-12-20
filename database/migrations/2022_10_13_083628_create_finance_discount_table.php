<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateFinanceDiscountTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('finance_discount', function (Blueprint $table) {
            $table->integer('discount_id', true);
            $table->string('discount_by', 20)->nullable();
            $table->string('discount_phase_id', 20)->nullable();
            $table->string('discount_assign_to', 20)->nullable();
            $table->string('discount_percentage', 20)->nullable();
            $table->string('discount_amount', 20)->nullable();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('finance_discount');
    }
}
