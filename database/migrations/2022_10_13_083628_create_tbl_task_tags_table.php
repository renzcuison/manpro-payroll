<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTblTaskTagsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('tbl_task_tags', function (Blueprint $table) {
            $table->integer('task_tags_id', true);
            $table->integer('task_id');
            $table->integer('tag_id');
            $table->dateTime('date_added')->useCurrent();
            $table->integer('assigned_by_user_id');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('tbl_task_tags');
    }
}
