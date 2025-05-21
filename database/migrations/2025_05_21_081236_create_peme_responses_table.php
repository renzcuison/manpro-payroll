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
        Schema::create('peme_responses', function (Blueprint $table) {
            $table->id();
            $table->timestamps();
            $table->softDeletes();
            $table->unsignedBigInteger('peme_id');
            $table->text('remarks');
            $table->enum('status', ['Pending', 'Clear', 'Rejected'])->default('Pending');
            $table->unsignedBigInteger('user_id');
            $table->string('attachment_path', 500);

            $table->foreign('peme_id')->references('id')->on('peme');
            $table->foreign('user_id')->references('id')->on('users');

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('peme_responses');
    }
};