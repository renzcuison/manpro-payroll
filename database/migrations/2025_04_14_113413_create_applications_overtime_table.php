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
        Schema::create('applications_overtime', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('time_in_id');
            $table->unsignedBigInteger('time_out_id');
            $table->enum('status', ['Pending', 'Approved', 'Paid', 'Declined'])->default('Pending');
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('time_in_id')->references('id')->on('attendance_logs')->onDelete('cascade');
            $table->foreign('time_out_id')->references('id')->on('attendance_logs')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('applications_overtime');
    }
};
