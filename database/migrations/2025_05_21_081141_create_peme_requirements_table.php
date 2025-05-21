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
        Schema::create('peme_requirements', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('type_id');
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('type_id')->references('id')->on('peme_types');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('peme_requirements');  
    }
};