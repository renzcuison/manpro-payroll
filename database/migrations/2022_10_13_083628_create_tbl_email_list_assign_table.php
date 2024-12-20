<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTblEmailListAssignTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('tbl_email_list_assign', function (Blueprint $table) {
            $table->integer('email_list_assign_id', true);
            $table->integer('email_id');
            $table->integer('list_id');
            $table->integer('user_id');
            $table->dateTime('date_created')->useCurrent();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('tbl_email_list_assign');
    }
}
