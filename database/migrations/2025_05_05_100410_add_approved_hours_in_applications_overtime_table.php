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
        Schema::table('applications_overtime', function (Blueprint $table) {
            $table->integer('approved_hours')->after('status')->nullable();
            $table->date('date')->after('approved_hours')->nullable(); 
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('applications_overtime', function (Blueprint $table) {
            $table->dropColumn('approved_hours');
            $table->dropColumn('date');
        });
    }
};
