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
        Schema::table('announcements', function (Blueprint $table) {
            $table->timestamp('scheduled_send_datetime')->nullable()->after('status');
            $table->unsignedBigInteger('announcement_types_id')->nullable()->after('scheduled_send_datetime');
            $table->foreign('announcement_types_id')
                  ->references('id')
                  ->on('announcement_types')
                  ->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('announcements', function (Blueprint $table) {
            $table->dropForeign(['announcement_types_id']);
            $table->dropColumn(['scheduled_send_datetime', 'announcement_types_id']);
        });
    }
};