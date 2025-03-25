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
        Schema::create('payslips', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('employee_id');
            $table->dateTime('period_start');
            $table->dateTime('period_end');
            $table->integer('working_days');

            $table->decimal('total_earnings', 10, 2);
            $table->decimal('total_deductions', 10, 2);

            $table->decimal('rate_monthly', 10, 2);
            $table->decimal('rate_daily', 10, 2);
            $table->decimal('rate_hourly', 10, 2);

            $table->boolean('is_received')->default(false);
            $table->string('signature', 256)->nullable();

            $table->unsignedBigInteger('client_id');
            $table->unsignedBigInteger('user_id');
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('employee_id')->references('id')->on('users');
            $table->foreign('client_id')->references('id')->on('clients');
            $table->foreign('user_id')->references('id')->on('users');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payslips');
    }
};
