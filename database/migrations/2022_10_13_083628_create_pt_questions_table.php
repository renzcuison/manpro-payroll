<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreatePtQuestionsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('pt_questions', function (Blueprint $table) {
            $table->integer('pt_ques_id', true);
            $table->longText('question');
            $table->integer('pt_bank_id');
            $table->integer('category');
            $table->enum('type', ['multiple', 'checkboxes']);
            $table->longText('explanation');
            $table->integer('order_by');
            $table->dateTime('date_updated')->useCurrent();
            $table->tinyInteger('is_removed')->default(0);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('pt_questions');
    }
}
