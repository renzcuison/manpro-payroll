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
        Schema::create('payslip_benefits', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('payslip_id');
            $table->unsignedBigInteger('benefit_id');
            $table->decimal('employee_amount', 10, 2)->nullable();
            $table->decimal('employer_amount', 10, 2)->nullable();
            $table->timestamps();

            $table->foreign('payslip_id')->references('id')->on('payslips');
            $table->foreign('benefit_id')->references('id')->on('benefits');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payslip_benefits');
    }
};
