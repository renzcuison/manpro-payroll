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
        Schema::create('payslip_deductions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('payslip_id');
            $table->integer('deduction_id');
            $table->decimal('amount', 10, 2);
            $table->timestamps();

            $table->foreign('payslip_id')->references('id')->on('payslips');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payslip_deductions');
    }

    // Reference for 'earning_id':
    // 1 - Absents
    // 2 - Tardiness
    // 3 - Cash Advance
    // 4 - Loans
    // 5 - Tax
};
