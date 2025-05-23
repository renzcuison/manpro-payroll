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
        Schema::create('hmo', function (Blueprint $table) {
            $table->id();
            $table->timestamps();
            $table->softDeletes();
            $table->unsignedBigInteger('user_id');
            $table->integer('dependencies_limit');
            $table->date('coverage_start');
            $table->date('coverage_end');
            $table->unsignedBigInteger('hmo_types_id');

            $table->foreign('user_id')->references('id')->on('users');
            $table->foreign('hmo_types_id')->references('id')->on('hmo_types');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hmo');
    }
};
