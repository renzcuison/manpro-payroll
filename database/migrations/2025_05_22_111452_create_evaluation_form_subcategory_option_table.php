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
        Schema::create('evaluation_form_subcategory_options', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('subcategory_id');
            $table->string('label');
            $table->string('order', length: 512);
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('subcategory_id')->references('id')->on('evaluation_form_subcategories');
            $table->unique(['subcategory_id','label']);
            $table->unique(['subcategory_id','order']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('evaluation_form_subcategory_options');
    }
};
