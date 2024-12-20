<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTblPortalUpdatesTypeTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('tbl_portal_updates_type', function (Blueprint $table) {
            $table->integer('portal_update_type_id', true);
            $table->string('title', 50);
            $table->string('icon', 50);
            $table->string('color', 50);
            $table->date('date_created')->useCurrent();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('tbl_portal_updates_type');
    }
}
