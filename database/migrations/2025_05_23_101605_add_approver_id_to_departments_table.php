<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('departments', function (Blueprint $table) {
            if (!Schema::hasColumn('departments', 'approver_id')) {
                $table->unsignedBigInteger('approver_id')
                      ->nullable()
                      ->after('supervisor_id'); // Position after supervisor_id
                
                $table->foreign('approver_id')
                      ->references('id')
                      ->on('users');
            }
        });
    }

    public function down()
    {
        Schema::table('departments', function (Blueprint $table) {
            if (Schema::hasColumn('departments', 'approver_id')) {
                $table->dropForeign(['approver_id']);
                $table->dropColumn('approver_id');
            }
        });
    }
};