<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateWorkHoursTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('work_hours', function (Blueprint $table) {
            $table->id();
            $table->enum('shift_type', ['Regular', 'Split'])->nullable();

            $table->time('first_time_in')->nullable();
            $table->time('first_time_out')->nullable();

            $table->time('second_time_in')->nullable();
            $table->time('second_time_out')->nullable();

            $table->time('over_time_in')->nullable();
            $table->time('over_time_out')->nullable();

            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('work_hours');
    }
}
