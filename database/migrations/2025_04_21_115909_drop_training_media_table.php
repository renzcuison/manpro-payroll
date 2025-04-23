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
        Schema::dropIfExists('training_media');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::create('training_media', function (Blueprint $table) {
            $table->id();
            $table->enum('type', ['Video', 'Image', 'Document', 'PowerPoint']);
            $table->string('source', 512);
            $table->timestamps();
        });
    }
};
