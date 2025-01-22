<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddWorkHourIdInWorkShifts extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('work_shifts', function (Blueprint $table) {
            $table->unsignedBigInteger('work_hour_id')->nullable()->after('second_label');

            $table->foreign('work_hour_id')->references('id')->on('work_hours');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('work_shifts', function (Blueprint $table) {
            $table->dropForeign(['work_hour_id']);

            $table->dropColumn('work_hour_id');
        });
    }
}
