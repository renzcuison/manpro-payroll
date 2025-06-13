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
        Schema::table('peme_q_item', function (Blueprint $table) {
            $table->unsignedTinyInteger('max_files')->default(1)->after('question');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('peme_q_item', function (Blueprint $table) {
            $table->dropColumn('max_files');
        });
    }
};
