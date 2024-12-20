<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTblServicesStatusStepsAssignedTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('tbl_services_status_steps_assigned', function (Blueprint $table) {
            $table->integer('status_step_assign_id', true);
            $table->integer('status_id');
            $table->integer('step_id');
            $table->dateTime('date_assigned')->useCurrent();
            $table->integer('user_id');
            $table->integer('order_no')->default(0);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('tbl_services_status_steps_assigned');
    }
}
