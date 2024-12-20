<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTblInquiryCommentsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('tbl_inquiry_comments', function (Blueprint $table) {
            $table->integer('inq_comment_id', true);
            $table->text('comment');
            $table->dateTime('date_created')->useCurrent();
            $table->integer('user_id');
            $table->integer('contact_id');
            $table->string('type', 100);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('tbl_inquiry_comments');
    }
}
