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
        Schema::create('payslip_allowances', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('payslip_id');
            $table->unsignedBigInteger('employee_allowance_id');
            $table->decimal('amount', 10, 2)->nullable();
            $table->timestamps();

            $table->foreign('payslip_id')->references('id')->on('payslips');
            $table->foreign('employee_allowance_id')->references('id')->on('employee_allowances');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payslip_allowances');
    }
};
