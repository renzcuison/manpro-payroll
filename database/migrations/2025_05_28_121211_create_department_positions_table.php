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
        //create department positions table
        Schema::create('department_positions', function (Blueprint $table) {
            $table->id();
            $table->string('position_name');
            $table->boolean('can_review_request')->default(false);
            $table->boolean('can_approve_request')->default(false);
            $table->boolean('can_note_request')->default(false);
            $table->boolean('can_accept_request')->default(false);
            $table->timestamps();
            $table->softDeletes();
        });

        //create department positions assignment table
        Schema::create('department_position_assignments', function (Blueprint $table){
            $table->id();
            $table->unsignedBigInteger('department_id');
            $table->unsignedBigInteger('department_position_id');
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('department_id')->references('id')->on('departments');
            $table->foreign('department_position_id')->references('id')->on('department_positions');
        });

        //create employee department positions table
        Schema::create('employee_department_positions', function (Blueprint $table){
            $table->id();
            $table->unsignedBigInteger('employee_id');
            $table->unsignedBigInteger('assignment_position_id');
            $table->timestamps();
            $table->softDeletes();
            
            $table->foreign('employee_id')->references('id')->on('users');
            $table->foreign('assignment_position_id')->references('id')->on('department_position_assignments');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('employee_department_positions');
        Schema::dropIfExists('department_position_assignments');
        Schema::dropIfExists('department_positions');
    }
};
