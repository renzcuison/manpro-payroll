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
        Schema::table('training_content', function (Blueprint $table) {
            $table->dropForeign(['training_media_id']);
            $table->dropColumn('training_media_id');
            $table->string('source', 512)->after('duration')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('training_content', function (Blueprint $table) {
            $table->dropColumn('source');
            $table->unsignedBigInteger('training_media_id')->nullable();
            $table->foreign('training_media_id')->references('id')->on('training_media');
        });
    }
};
