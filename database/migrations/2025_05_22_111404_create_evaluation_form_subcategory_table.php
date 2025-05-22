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
        Schema::create('evaluation_form_subcategories', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('category_id');
            $table->string('name');
            $table->string('rank');
            $table->enum('subcategory_type', ['checkbox','dropdown','linear_scale','long_answer','multiple_choice','short_answer']);
            $table->string('description');
            $table->boolean('required');
            $table->boolean('allow_other_option');
            $table->unsignedInteger('linear_scale_start')->nullable();
            $table->unsignedInteger('linear_scale_end')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->unique('category_id','rank');
            $table->foreign('category_id')->references('id')->on('evaluation_form_categories');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('evaluation_form_subcategories');
    }
};
