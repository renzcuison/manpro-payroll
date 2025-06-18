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
        Schema::table('evaluation_text_answers', function (Blueprint $table) {
            $table->id()->before('response_id');
        });
        Schema::table('evaluation_option_answers', function (Blueprint $table) {
            $table->id()->before('response_id');
        });
        Schema::table('evaluation_percentage_answers', function (Blueprint $table) {
            $table->id()->before('response_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('evaluation_text_answers', function (Blueprint $table) {
            $table->integer('id')->unsigned()->change();
            $table->dropColumn('id');
        });
        Schema::table('evaluation_option_answers', function (Blueprint $table) {
            $table->integer('id')->unsigned()->change();
            $table->dropColumn('id');
        });
        Schema::table('evaluation_percentage_answers', function (Blueprint $table) {
            $table->integer('id')->unsigned()->change();
            $table->dropColumn('id');
        });
    }
};
