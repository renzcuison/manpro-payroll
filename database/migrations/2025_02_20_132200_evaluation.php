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
        Schema::create('evaluations', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('client_id');
            $table->string('name', 128);
            $table->bigInteger('creator_id');
            $table->softDeletes();
            $table->bigInteger('deleted_by');
            $table->timestamp('created_at');
            $table->timestamp('updated_at');

            // $table->foreign('client_id')->references('id')->on('evaluation_form');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('evaluations');
    }
};
