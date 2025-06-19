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
        DB::statement(
            "ALTER TABLE `evaluation_form_subcategories` CHANGE `subcategory_type` `subcategory_type` ENUM('checkbox','linear_scale','long_answer','multiple_choice','short_answer') NOT NULL;"
        );
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement(
            "ALTER TABLE `evaluation_form_subcategories` CHANGE `subcategory_type` `subcategory_type` ENUM('checkbox','linear_scale','long_answer','dropdown','multiple_choice','short_answer') NOT NULL;"
        );
    }
};
