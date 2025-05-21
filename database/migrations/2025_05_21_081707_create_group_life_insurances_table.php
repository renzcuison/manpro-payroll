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
        Schema::create('gli', function (Blueprint $table) {
            $table->id();
            $table->timestamps();
            $table->softDeletes();

            
            $table->string('provider', 128);
            $table->unsignedBigInteger('user_id');
            $table->integer('dependencies_limit');
            $table->date('date_start');
            $table->date('date_end');
            $table->unsignedBigInteger('gli_type_id');

            $table->foreign('user_id')->references('id')->on('users');
            $table->foreign('gli_type_id')->references('id')->on('gli_types');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('gli');
    }
};