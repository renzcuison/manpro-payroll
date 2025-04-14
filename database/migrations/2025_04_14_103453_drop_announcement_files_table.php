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
        Schema::dropIfExists('announcement_files');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::create('announcement_files', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('announcement_id');
            $table->enum('type', ['Image', 'Document', 'Thumbnail']);
            $table->string('path', 256);
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('announcement_id')->references('id')->on('announcements');
        });
    }
};
