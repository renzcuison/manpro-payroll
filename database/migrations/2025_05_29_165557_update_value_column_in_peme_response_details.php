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
        Schema::table('peme_response_details', function (Blueprint $table) {
            $table->dropColumn([
                'value_text',
                'value_remark',
                'value_pass_fail',
                'value_pos_neg',
            ]);

            $table->text('value')->nullable()->after('peme_q_type_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('peme_response_details', function (Blueprint $table) {
            // Restore old value_* columns
            $table->string('value_text', 256)->nullable()->after('peme_q_type_id');
            $table->string('value_remark', 512)->nullable()->after('value_text');
            $table->enum('value_pass_fail', ['Pass', 'Fail'])->nullable()->after('value_remark');
            $table->enum('value_pos_neg', ['Positive', 'Negative'])->nullable()->after('value_pass_fail');

            // Drop the unified value column
            $table->dropColumn('value');
        });
    }
};
