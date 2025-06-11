<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddisDraftToPemeResponseTable extends Migration
{
    public function up(): void
    {
        Schema::table('peme_response', function (Blueprint $table) {
            $table->boolean('isDraft')->default(1);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('peme_response', function (Blueprint $table) {
            $table->dropColumn('isDraft');
        });
    }
}

