<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE peme_q_item MODIFY COLUMN max_files TINYINT UNSIGNED NOT NULL DEFAULT 10");
        DB::table('peme_q_item')->update(['max_files' => 10]);
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE peme_q_item MODIFY COLUMN max_files TINYINT UNSIGNED NOT NULL DEFAULT 1");
    }
};
