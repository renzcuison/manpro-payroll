<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class MakeExpiryDateAndNextScheduleNullableInPemeResponse extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('peme_response', function (Blueprint $table) {
            $table->dateTime('expiry_date')->nullable()->change();
            $table->dateTime('next_schedule')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('peme_response', function (Blueprint $table) {
            $table->dateTime('expiry_date')->nullable(false)->change();
            $table->dateTime('next_schedule')->nullable(false)->change();
        });
    }
}
