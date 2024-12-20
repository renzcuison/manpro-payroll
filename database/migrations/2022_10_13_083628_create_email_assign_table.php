<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateEmailAssignTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('email_assign', function (Blueprint $table) {
            $table->integer('assign_id', true);
            $table->string('assign_by', 11)->nullable();
            $table->string('assign_email_id', 11)->nullable();
            $table->string('assign_list_id', 11)->nullable();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('email_assign');
    }
}
