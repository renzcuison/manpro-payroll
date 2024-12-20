<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateCommentTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('comment', function (Blueprint $table) {
            $table->integer('comment_id', true);
            $table->string('comment_task_id', 11)->nullable();
            $table->string('comment_user_id', 11)->nullable();
            $table->string('comment_message', 1000)->nullable();
            $table->dateTime('comment_date')->nullable();
            $table->string('comment_attactment', 500)->nullable();
            $table->string('comment_type', 20)->nullable();
            $table->integer('admin_notification')->default(0);
            $table->integer('user_notification')->default(0);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('comment');
    }
}
