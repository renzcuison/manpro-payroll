<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreatePtQuestionOptTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('pt_question_opt', function (Blueprint $table) {
            $table->integer('ques_opt_id', true);
            $table->text('option_txt');
            $table->integer('question_id');
            $table->tinyInteger('is_right');
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
        Schema::dropIfExists('pt_question_opt');
    }
}
