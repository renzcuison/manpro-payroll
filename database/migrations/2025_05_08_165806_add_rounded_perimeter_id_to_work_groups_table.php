<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddRoundedPerimeterIdToWorkGroupsTable extends Migration
{
    public function up()
    {
        Schema::table('work_groups', function (Blueprint $table) {
            $table->unsignedBigInteger('rounded_perimeter_id')->nullable()->after('work_shift_id');

            $table->foreign('rounded_perimeter_id')
                  ->references('id')
                  ->on('rounded_perimeters')
                  ->onDelete('set null');
        });
    }

    public function down()
    {
        Schema::table('work_groups', function (Blueprint $table) {
            $table->dropForeign(['rounded_perimeter_id']);
            $table->dropColumn('rounded_perimeter_id');
        });
    }
};