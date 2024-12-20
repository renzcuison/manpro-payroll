<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreatePtAnswersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('pt_answers', function (Blueprint $table) {
            $table->integer('answer_id', true);
            $table->integer('client_id');
            $table->integer('question_id');
            $table->integer('option_id');
            $table->tinyInteger('is_correct')->comment('1=correct,0=wrong');
            $table->tinyInteger('is_old')->default(0);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('pt_answers');
    }
}
