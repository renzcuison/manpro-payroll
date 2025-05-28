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
        Schema::create('branch_settings', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('client_id');
            $table->boolean('with_manager')->default(false);
            $table->boolean('with_supervisor')->default(false);
            $table->boolean('with_approver')->default(false);
            $table->decimal('manager_limit', 12, 2)->default(0.00);
            $table->decimal('supervisor_limit', 12, 2)->default(0.00);
            $table->decimal('approver_limit', 12, 2)->default(0.00);
            $table->timestamps();

            // Optional: foreign key constraint
            // $table->foreign('client_id')->references('id')->on('clients')->onDelete('cascade');
        });
    }


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('branch_settings');
    }
};
   