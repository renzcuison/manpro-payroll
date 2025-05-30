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
            $table->unsignedBigInteger('order');
            $table->string('name');
            $table->enum('subcategory_type', ['checkbox','dropdown','linear_scale','long_answer','multiple_choice','short_answer']);
            $table->string('description');
            $table->boolean('required');
            $table->boolean('allow_other_option');
            $table->string('linear_scale_start_label')->nullable();
            $table->string('linear_scale_end_label')->nullable();
            $table->unsignedInteger('linear_scale_start')->nullable();
            $table->unsignedInteger('linear_scale_end')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('category_id')->references('id')->on('evaluation_form_categories');
            $table->unique(['category_id','order']);
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
