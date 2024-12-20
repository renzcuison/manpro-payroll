<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTblClientFormsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('tbl_client_forms', function (Blueprint $table) {
            $table->integer('form_id', true);
            $table->string('title', 200);
            $table->dateTime('date_created')->useCurrent();
            $table->integer('created_by');
            $table->integer('is_removed')->default(0);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('tbl_client_forms');
    }
}
