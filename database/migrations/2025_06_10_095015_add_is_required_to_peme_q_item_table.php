<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddisRequiredToPemeQItemTable extends Migration
{
    public function up(): void
    {
        Schema::table('peme_q_item', function (Blueprint $table) {
            $table->boolean('isRequired')->default(1);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('peme_q_item', function (Blueprint $table) {
            $table->dropColumn('isRequired');
        });
    }
}

