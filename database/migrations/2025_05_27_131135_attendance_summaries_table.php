<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('attendance_summaries', function (Blueprint $table) {
            $table->id();

            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('client_id');
            $table->unsignedBigInteger('work_hour_id');
            $table->dateTime('work_day_start');
            $table->dateTime('work_day_end');

            $table->enum('day_type',[
                'Regular Day',
                'Rest Day',
                'Special Holiday',
                'Regular Holiday'
            ])->default('Regular Day');

            $table->decimal('minutes_rendered', 10, 2)->default(0);
            $table->decimal('minutes_late', 10, 2)->default(0);
            $table->decimal('minutes_overtime', 10, 2)->default(0);
            $table->decimal('minutes_night_differential', 10, 2)->default(0);

            $table->timestamps();
            $table->softDeletes();

            $table->foreign('user_id')->references('id')->on('users');
            $table->foreign('client_id')->references('id')->on('clients');
            $table->foreign('work_hour_id')->references('id')->on('work_hours');

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('attendance_summaries');
    }
};
