<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{

    public function up(): void
    {
        Schema::table('employee_roles', function (Blueprint $table) {
            $table->boolean('can_review_request')->default(false);
            $table->boolean('can_approve_request')->default(false);
            $table->boolean('can_note_request')->default(false);
            $table->boolean('can_accept_request')->default(false);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('employee_roles', function (Blueprint $table) {
             $table->dropColumn([
                'can_review_request',
                'can_approve_request',
                'can_note_request',
                'can_accept_request'
            ]);

        });
    }
};
