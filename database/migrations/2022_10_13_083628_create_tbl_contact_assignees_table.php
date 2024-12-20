<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTblContactAssigneesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('tbl_contact_assignees', function (Blueprint $table) {
            $table->integer('contact_assignee_id', true);
            $table->integer('contact_id');
            $table->integer('assigned_user_id');
            $table->dateTime('date_added')->useCurrent();
            $table->integer('added_by-user_id');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('tbl_contact_assignees');
    }
}
