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
        Schema::create('evaluation_indicators', function (Blueprint $table) {
            $table->id(); 
            $table->unsignedBigInteger('category_id');
            $table->string('indicator', 256);
            $table->string('type', 32); 
            $table->string('description', 512); 
            $table->timestamps(); 

            // Foreign key reference to evaluation_categories table
            $table->foreign('category_id')->references('id')->on('evaluation_categories')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('evaluation_indicators');
    }
};
