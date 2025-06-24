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
        Schema::table('evaluation_commentors', function (Blueprint $table) {
            $table->string('comment', 512)->nullable()->change();
        });
        Schema::table('evaluation_evaluators', function (Blueprint $table) {
            $table->string('comment', 512)->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('evaluation_commentors', function (Blueprint $table) {
            $table->string('comment', 191)->nullable()->change();
        });
        Schema::table('evaluation_evaluators', function (Blueprint $table) {
            $table->string('comment', 191)->nullable()->change();
        });
    }
};
