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
        Schema::table('evaluation_responses', function (Blueprint $table) {
            $table->dropForeign(['primary_commentor_id']);
            $table->dropForeign(['secondary_commentor_id']);
            $table->dropColumn('primary_commentor_id');
            $table->dropColumn('secondary_commentor_id');
            $table->dropColumn('primary_comment');
            $table->dropColumn('secondary_comment');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('evaluation_responses', function (Blueprint $table) {
            $table->unsignedBigInteger('primary_commentor_id');
            $table->unsignedBigInteger('secondary_commentor_id');
            $table->foreign('primary_commentor_id')->references('id')->on('users');
            $table->foreign('secondary_commentor_id')->references('id')->on('users');
            $table->string('primary_comment')->nullable();
            $table->string('secondary_comment')->nullable();
        });
    }
};
