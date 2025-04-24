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
        Schema::dropIfExists('training_form_files');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::create('training_form_files', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('form_item_id');
            $table->enum('type', ['Image', 'Video']);
            $table->string('source', 256);
            $table->softDeletes();
            $table->timestamps();

            $table->foreign('form_item_id')->references('id')->on('training_form_items');
        });
    }
};
