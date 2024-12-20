<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateSpaceSortTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('space_sort', function (Blueprint $table) {
            $table->integer('sort_id', true);
            $table->string('sort_user_id', 11)->nullable();
            $table->string('sort_space_id', 11)->nullable();
            $table->integer('sort_space_order')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('space_sort');
    }
}
