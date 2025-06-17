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
        Schema::create('group_life_employee_plan', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('employee_id');
            $table->unsignedBigInteger('group_life_plan_id');
            $table->date('enroll_date');
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('employee_id')->references('id')->on('users');
            $table->foreign('group_life_plan_id')->references('id')->on('group_life_plans');
        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('group_life_employee_plan');
    }
};
