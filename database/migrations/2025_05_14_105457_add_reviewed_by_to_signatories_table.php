<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('signatories', function (Blueprint $table) {
            $table->string('reviewed_by')->nullable()->after('approved_by_three');
        });
    }

    public function down(): void
    {
        Schema::table('signatories', function (Blueprint $table) {
            $table->dropColumn('reviewed_by');
        });
    }
};
