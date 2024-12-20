<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTblContactDueDateTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('tbl_contact_due_date', function (Blueprint $table) {
            $table->integer('contact_due_date_id', true);
            $table->integer('contact_id');
            $table->dateTime('due_date');
            $table->dateTime('date_added')->useCurrent();
            $table->integer('user_id');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('tbl_contact_due_date');
    }
}
