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
        Schema::create('hmo_plans', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('hmo_company_id');
            $table->string('plan_name', 50);
            $table->string('type', 50);
            $table->unsignedBigInteger('employer_share');
            $table->unsignedBigInteger('employee_share');
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('hmo_company_id')->references('id')->on('hmo_companies');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hmo_plans');
    }
};
