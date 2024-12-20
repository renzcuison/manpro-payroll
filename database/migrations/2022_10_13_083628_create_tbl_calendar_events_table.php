<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTblCalendarEventsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('tbl_calendar_events', function (Blueprint $table) {
            $table->integer('calendar_event_id', true);
            $table->string('event_name');
            $table->string('location')->nullable();
            $table->string('color', 50);
            $table->dateTime('date_created')->useCurrent();
            $table->integer('user_id')->nullable();
            $table->dateTime('start_date')->nullable();
            $table->dateTime('end_date')->nullable();
            $table->integer('is_deleted')->default(0);
            $table->string('remarks', 100)->nullable();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('tbl_calendar_events');
    }
}
