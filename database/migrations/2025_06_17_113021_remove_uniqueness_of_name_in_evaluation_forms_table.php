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
        Schema::table('evaluation_form_subcategory_options', function (Blueprint $table) {
            $table->dropUnique(['subcategory_id', 'label']);
        });
        Schema::table('evaluation_forms', function (Blueprint $table) {
            $table->string('name')->unique(false)->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('evaluation_forms', function (Blueprint $table) {
            $table->string('name')->unique()->change();
        });
        Schema::table('evaluation_form_subcategory_options', function (Blueprint $table) {
            $table->unique(['subcategory_id','label']);
        });
    }
};
