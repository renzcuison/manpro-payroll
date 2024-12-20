<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTblClientSeenNotifTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('tbl_client_seen_notif', function (Blueprint $table) {
            $table->integer('id', true);
            $table->integer('contact_id')->index('contact_id');
            $table->integer('portal_update_id')->index('portal_update_id');
            $table->dateTime('date_added')->useCurrent();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('tbl_client_seen_notif');
    }
}
