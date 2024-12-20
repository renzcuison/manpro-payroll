<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTblServicesStepsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('tbl_services_steps', function (Blueprint $table) {
            $table->integer('service_step_id', true);
            $table->string('step_name', 50);
            $table->string('color', 10);
            $table->dateTime('date_created')->nullable()->useCurrent();
            $table->integer('user_id_created');
            $table->integer('order_no');
            $table->integer('list_id');
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
        Schema::dropIfExists('tbl_services_steps');
    }
}
