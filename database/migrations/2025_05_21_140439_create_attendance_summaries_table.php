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
            $table->unsignedBigInteger('employee_id');
            $table->unsignedBigInteger('work_hour_id');

            $table->date('date');
            $table->enum('day_type', ['Regular Day','Rest Day','Regular Holiday','Special Non-Working Holiday','Special Working Holiday',])->default('Regular Day');

            $table->decimal('minutes_rendered', 10, 2)->default(0);
            $table->decimal('minutes_late', 10, 2)->default(0);
            $table->decimal('minutes_overtime', 10, 2)->default(0);

            $table->foreign('employee_id')->references('id')->on('users');
            $table->foreign('work_hour_id')->references('id')->on('work_hours');
            $table->timestamps();
            $table->softDeletes();
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
