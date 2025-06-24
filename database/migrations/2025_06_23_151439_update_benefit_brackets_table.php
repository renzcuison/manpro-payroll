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
        Schema::table('benefit_brackets', function (Blueprint $table) {
            // Drop old columns
            $table->dropColumn([
                'employee_percentage',
                'employee_amount',
                'employer_percentage',
                'employer_amount',
            ]);

            // Modify existing columns
            $table->decimal('range_start', 10, 2)->nullable()->change();
            $table->decimal('range_end', 10, 2)->nullable()->change();

            // Add new columns
            $table->decimal('employee_share', 10, 2)->nullable()->after('range_end');
            $table->decimal('employer_share', 10, 2)->nullable()->after('employee_share');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('benefit_brackets', function (Blueprint $table) {
            // Drop new columns
            $table->dropColumn([
                'employee_share',
                'employer_share',
            ]);

            // Revert existing columns to not nullable
            $table->decimal('range_start', 10, 2)->nullable(false)->change();
            $table->decimal('range_end', 10, 2)->nullable(false)->change();

            // Add old columns back
            $table->decimal('employee_percentage', 10, 2)->nullable();
            $table->decimal('employee_amount', 10, 2)->nullable();
            $table->decimal('employer_percentage', 10, 2)->nullable();
            $table->decimal('employer_amount', 10, 2)->nullable();
        });
    }
};
