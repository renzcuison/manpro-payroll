<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreatePtBankTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('pt_bank', function (Blueprint $table) {
            $table->integer('pt_bank_id', true);
            $table->string('title', 200);
            $table->tinyInteger('points');
            $table->dateTime('date_created')->useCurrent();
            $table->integer('created_by');
            $table->integer('is_deleted')->default(0);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('pt_bank');
    }
}
