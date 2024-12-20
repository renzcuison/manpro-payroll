<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTblClientFormFieldsInputsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('tbl_client_form_fields_inputs', function (Blueprint $table) {
            $table->integer('form_fields_input', true);
            $table->integer('form_field_id');
            $table->integer('client_id');
            $table->dateTime('date_created')->useCurrent();
            $table->string('value', 200)->nullable();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('tbl_client_form_fields_inputs');
    }
}
