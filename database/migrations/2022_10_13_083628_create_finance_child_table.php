<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateFinanceChildTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('finance_child', function (Blueprint $table) {
            $table->integer('child_id', true);
            $table->string('child_name', 50)->nullable();
            $table->string('child_field_id', 11)->nullable();
            $table->string('child_color', 20)->nullable();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('finance_child');
    }
}
