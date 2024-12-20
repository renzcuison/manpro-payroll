<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateFinanceFieldHideTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('finance_field_hide', function (Blueprint $table) {
            $table->integer('hideshow_id', true);
            $table->string('hideshow_user_id', 11)->nullable();
            $table->string('hideshow_task_id', 11)->nullable();
            $table->string('hideshow_field_id', 11)->nullable();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('finance_field_hide');
    }
}
