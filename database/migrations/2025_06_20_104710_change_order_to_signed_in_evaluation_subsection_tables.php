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
        Schema::table('evaluation_form_sections', function (Blueprint $table) {
            $table->bigInteger('order')->change();
        });
        Schema::table('evaluation_form_subcategories', function (Blueprint $table) {
            $table->bigInteger('order')->change();
        });
        Schema::table('evaluation_form_subcategory_options', function (Blueprint $table) {
            $table->bigInteger('order')->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('evaluation_form_sections', function (Blueprint $table) {
            $table->unsignedBigInteger('order')->change();
        });
        Schema::table('evaluation_form_subcategories', function (Blueprint $table) {
            $table->unsignedBigInteger('order')->change();
        });
        Schema::table('evaluation_form_subcategory_options', function (Blueprint $table) {
            $table->unsignedBigInteger('order')->change();
        });
    }
};
