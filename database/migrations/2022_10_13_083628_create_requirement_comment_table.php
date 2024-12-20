<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateRequirementCommentTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('requirement_comment', function (Blueprint $table) {
            $table->integer('comment_id', true);
            $table->string('comment_task_id', 11)->nullable();
            $table->string('comment_user_id', 11)->nullable();
            $table->string('comment_message', 500)->nullable();
            $table->dateTime('comment_date')->nullable();
            $table->string('comment_attactment', 500)->nullable();
            $table->string('comment_type', 20)->nullable();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('requirement_comment');
    }
}
