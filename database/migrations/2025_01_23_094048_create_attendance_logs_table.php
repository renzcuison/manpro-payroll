<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateAttendanceLogsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('attendance_logs', function (Blueprint $table) {
            $table->id();

            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('work_hour_id');

            $table->enum('action', ['Duty In', 'Duy Out', 'Overtime In', 'Overtime Out']);

            $table->integer('method');
            $table->timestamp('timestamp');

            // For Biometric Device
            $table->integer('machine_number')->nullable();
            $table->integer('enroll_number')->nullable();
            $table->integer('enrolled_machine_number')->nullable();
            $table->integer('verify_mode')->nullable();
            
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users');
            $table->foreign('work_hour_id')->references('id')->on('work_hours');

            // method column
            // 1 - Web App
            // 2 - Mobile App
            // 3 - Biometric Device
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('attendance_logs');
    }
}
