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
        Schema::table('peme', function (Blueprint $table) {
            $table->boolean('isVisible')->default(0);
            $table->boolean('isEditable')->default(0);
            $table->boolean('isMultiple')->default(0);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('peme', function (Blueprint $table) {
            $table->dropColumn(['isVisible', 'isEditable', 'isMultiple']);
        });
    }
};
