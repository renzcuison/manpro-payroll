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
        Schema::create('deductions', function (Blueprint $table) {
            $table->id();
            $table->string('name', 128);
            $table->enum('type',['Amount', 'Percentage']);
            $table->decimal('amount', 10, 2)->nullable();
            $table->decimal('percentage', 10, 2)->nullable();
            $table->unsignedBigInteger('client_id');
            $table->softDeletes();

            $table->timestamps();

            $table->foreign('client_id')->references('id')->on('clients');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('deductions');
    }
};
