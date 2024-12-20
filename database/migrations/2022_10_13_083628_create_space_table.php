<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateSpaceTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('space', function (Blueprint $table) {
            $table->integer('space_id', true);
            $table->string('space_name', 100)->nullable();
            $table->string('space_type', 50)->nullable();
            $table->dateTime('space_date_created')->nullable();
            $table->string('space_db_table', 50)->nullable();
            $table->integer('position_order')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('space');
    }
}
