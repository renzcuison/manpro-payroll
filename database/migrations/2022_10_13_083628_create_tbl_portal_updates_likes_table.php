<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTblPortalUpdatesLikesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('tbl_portal_updates_likes', function (Blueprint $table) {
            $table->bigIncrements('portal_update_like_id');
            $table->integer('portal_update_id');
            $table->integer('sender_contact_id');
            $table->string('sender_fullname');
            $table->text('sender_profile')->nullable();
            $table->dateTime('created_at')->useCurrent();
            $table->dateTime('updated_at')->useCurrent();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('tbl_portal_updates_likes');
    }
}
