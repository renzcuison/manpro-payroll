<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class DropApplicationFilesTable extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::dropIfExists('application_files');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::create('application_files', function (Blueprint $table) {
            $table->id();
            $table->foreignId('application_id')->constrained('applications')->onDelete('cascade');
            $table->string('type');
            $table->string('path');
            $table->timestamps();
            $table->softDeletes();
        });
    }
}
