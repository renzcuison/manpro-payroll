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
        Schema::create('hmo_dependents', function (Blueprint $table) {
            $table->id();
            $table->string('dependent_name', 64);
            $table->string('relationship', 64);
            $table->unsignedBigInteger('hmo_employee_id');
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('hmo_employee_id')->references('id')->on('hmo_employee_plan');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hmo_dependents');
    }
};
