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
        Schema::create('department_positions', function (Blueprint $table) {
            $table->id(); 
            $table->unsignedBigInteger('client_id');
            $table->string('name');
            $table->boolean('can_review_request')->default(false);
            $table->boolean('can_approve_request')->default(false);
            $table->boolean('can_note_request')->default(false);
            $table->boolean('can_accept_request')->default(false);
            $table->timestamps();
            $table->foreign('client_id')->references('id')->on('clients')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('department_positions');
    }
};
