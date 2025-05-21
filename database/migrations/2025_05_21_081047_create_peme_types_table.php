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
        Schema::create('peme_types', function (Blueprint $table) {
            $table->id();
            $table->string('name', 128);
            $table->unsignedBigInteger('clients_id');
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('clients_id')->references('id')->on('clients');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('peme_types');
    }
};