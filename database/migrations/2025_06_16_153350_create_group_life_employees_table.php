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
        Schema::create('group_life_employees', function (Blueprint $table) {
            $table->id();

            $table->unsignedBigInteger('users_id');
            $table->unsignedBigInteger('dependents_count')->default(0);
            $table->date('enroll_date');
            // $table->unsignedBigInteger('branch_id');
            // $table->unsignedBigInteger('department_id');
            // $table->unsignedBigInteger('role_id');

            $table->timestamps();
            $table->softDeletes();

            $table->foreign('users_id')->references('id')->on('users');
            // $table->foreign('branch_id')->references('id')->on('branches');
            // $table->foreign('department_id')->references('id')->on('departments');
            // $table->foreign('role_id')->references('id')->on('employee_roles');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('group_life_employees');
    }
};
