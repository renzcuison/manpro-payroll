<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('branches', function (Blueprint $table) {
            if (!Schema::hasColumn('branches', 'supervisor_id')) {
                $table->unsignedBigInteger('supervisor_id')
                      ->nullable()
                      ->after('manager_id'); // Position after supervisor_id
                
                $table->foreign('supervisor_id')
                      ->references('id')
                      ->on('users');
            }
        });
    }

    public function down()
    {
        Schema::table('branches', function (Blueprint $table) {
            if (Schema::hasColumn('branches', 'supervisor_id')) {
                $table->dropForeign(['supervisor_id']);
                $table->dropColumn('supervisor_id');
            }
        });
    }
};