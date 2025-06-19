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
        Schema::table('evaluation_form_categories', function (Blueprint $table) {
            $table->dropForeign('evaluation_form_categories_section_id_foreign');
            $table->dropUnique(['section_id', 'order']);
            $table->dropColumn('section_id');
            $table->dropColumn('order');
        });
        Schema::table('evaluation_form_subcategories', function (Blueprint $table) {
            $table->dropForeign('evaluation_form_subcategories_category_id_foreign');
            $table->dropUnique(['category_id', 'order']);
            $table->dropColumn('category_id');

            $table->unsignedBigInteger('section_id');
            $table->foreign('section_id')->references('id')->on('evaluation_form_sections');
        });
        Schema::drop('evaluation_form_categories');
        Schema::table('evaluation_form_sections', function (Blueprint $table) {
            $table->string('category');
        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('evaluation_form_sections', function (Blueprint $table) {
            $table->dropColumn('category');
        });
        Schema::create('evaluation_form_categories', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('section_id');
            $table->unsignedBigInteger('order');
            $table->string('name');
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('section_id')->references('id')->on('evaluation_form_sections');
            $table->unique(['section_id','order']);
        });
        Schema::table('evaluation_form_subcategories', function (Blueprint $table) {
            $table->unsignedBigInteger('category_id');
            $table->unsignedBigInteger('order');
            $table->foreign('category_id')->references('id')->on('evaluation_form_categories');
            $table->dropForeign(['section_id']);
            $table->dropColumn('section_id');
        });

    }
};
