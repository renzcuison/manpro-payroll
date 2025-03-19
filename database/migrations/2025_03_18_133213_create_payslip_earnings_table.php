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
        Schema::create('payslip_earnings', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('payslip_id');
            $table->integer('earning_id');
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
        Schema::dropIfExists('payslip_earnings');
    }

    // Reference for 'earning_id':
    // 1 - Basic Pay
    // 2 - Overtime Pay
    // 3 - Holiday Pay
};
