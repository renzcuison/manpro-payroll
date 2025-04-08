<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddTimeDataToTrainingFormResponsesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('training_form_responses', function (Blueprint $table) {
            $table->dateTime('start_time')->after('score');
            $table->unsignedInteger('duration')->after('start_time');
            $table->softDeletes()->after('duration');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('training_form_responses', function (Blueprint $table) {
            $table->dropColumn('start_time');
            $table->dropColumn('duration');
            $table->dropSoftDeletes();
        });
    }
}
