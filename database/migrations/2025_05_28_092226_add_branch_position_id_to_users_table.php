<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
{
    Schema::table('users', function (Blueprint $table) {
        $table->unsignedBigInteger('branch_position_id')->after('branch_id')->nullable();

        $table->foreign('branch_position_id')->references('id')->on('branch_positions');
    });
}

    public function down()
    {
    Schema::table('users', function (Blueprint $table) {
        $table->dropForeign(['branch_position_id']);
        $table->dropColumn('branch_position_id');
    });
    }
};