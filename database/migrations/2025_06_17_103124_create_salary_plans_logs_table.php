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
        Schema::create('salary_plans_logs', function (Blueprint $table) {
            $table->id();

            $table->unsignedBigInteger('client_id'); // Client to which the salary plan belongs
            $table->unsignedBigInteger('admin_id'); // Admin who made the change
            $table->unsignedBigInteger('employee_id'); // Employee whose salary plan is being logged
            $table->integer('old_salary_grade');
            $table->decimal('old_amount', 10, 2);
            $table->integer('new_salary_grade');
            $table->decimal('new_amount', 10, 2);

            $table->foreign('client_id')->references('id')->on('clients');
            $table->foreign('admin_id')->references('id')->on('users');
            $table->foreign('employee_id')->references('id')->on('users');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('salary_plans_logs');
    }
};
