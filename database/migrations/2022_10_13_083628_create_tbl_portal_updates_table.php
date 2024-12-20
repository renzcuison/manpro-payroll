<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTblPortalUpdatesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('tbl_portal_updates', function (Blueprint $table) {
            $table->integer('portal_update_id', true);
            $table->string('title');
            $table->text('description');
            $table->string('file')->nullable();
            $table->integer('type');
            $table->integer('order_no');
            $table->integer('is_deleted');
            $table->integer('status')->default(1);
            $table->dateTime('date_created')->useCurrent();
            $table->dateTime('date_updated')->useCurrent();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('tbl_portal_updates');
    }
}
