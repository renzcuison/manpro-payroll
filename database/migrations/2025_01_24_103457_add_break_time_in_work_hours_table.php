<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddBreakTimeInWorkHoursTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('work_hours', function (Blueprint $table) {
            $table->enum('shift_type', ['Regular', 'Split'])->after('id');

            $table->time('break_start')->after('first_time_out');
            $table->time('break_end')->after('break_start');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('work_hours', function (Blueprint $table) {
            $table->dropColumn('shift_type');

            $table->dropColumn('break_start');
            $table->dropColumn('break_end');
        });
    }
}
