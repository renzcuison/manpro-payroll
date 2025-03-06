<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateAttendanceLogsMobileTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('attendance_logs_mobile', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('attendance_id');
            $table->string('path', 256);

            $table->foreign('attendance_id')->references('id')->on('attendance_logs');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('attendance_logs_mobile');
    }
}
