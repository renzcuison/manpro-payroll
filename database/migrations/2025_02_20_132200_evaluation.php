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
            $table->string('identifier_code', 8)->unique(); // Fixed incorrect integer definition
            $table->softDeletes();
            $table->bigInteger('deleted_by')->nullable(); // Allow null for soft delete behavior
            $table->timestamps(); // Proper timestamp handling

            // Fixing foreign key reference
            $table->foreign('client_id')->references('id')->on('clients')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('evaluations'); // Fixed incorrect table name
    }
};
