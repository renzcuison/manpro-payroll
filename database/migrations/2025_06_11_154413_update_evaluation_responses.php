<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('evaluation_responses', function (Blueprint $table) {
            // Remove the old signature field
            $table->dropColumn('signature_filepath');
            // Add the new signature fields (put after form_id or just let them be at the end)
            $table->string('creator_signature_filepath')->nullable()->after('form_id');
            $table->string('evaluatee_signature_filepath')->nullable()->after('creator_signature_filepath');
        });
    }

    public function down(): void
    {
        Schema::table('evaluation_responses', function (Blueprint $table) {
            $table->dropColumn('creator_signature_filepath');
            $table->dropColumn('evaluatee_signature_filepath');
            $table->string('signature_filepath')->nullable();
        });
    }
};