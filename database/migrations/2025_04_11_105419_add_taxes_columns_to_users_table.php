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
        Schema::table('users', function (Blueprint $table) {
            $table->boolean('is_fixed_salary', 128)->default(0)->after('salary');
            $table->string('tin_number', 128)->nullable()->after('is_fixed_salary');
            $table->boolean('deduct_tax')->default(0)->after('tin_number');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('is_fixed_salary');
            $table->dropColumn('tin_number');
            $table->dropColumn('deduct_tax');
        });
    }
};
