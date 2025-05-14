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
            $table->integer('approved_minutes')->after('status')->nullable();
            $table->date('date')->after('approved_minutes')->nullable(); 
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('applications_overtime', function (Blueprint $table) {
            $table->dropColumn('approved_minutes');
            $table->dropColumn('date');
        });
    }
};
