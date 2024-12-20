<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTblClientFormFieldsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('tbl_client_form_fields', function (Blueprint $table) {
            $table->integer('form_field_id', true);
            $table->string('field');
            $table->integer('type');
            $table->enum('is_bold', ['yes', 'no'])->nullable()->default('no');
            $table->integer('form_id');
            $table->dateTime('date_created')->useCurrent();
            $table->integer('created_by');
            $table->integer('order_no')->default(0);
            $table->integer('is_deleted')->default(0);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('tbl_client_form_fields');
    }
}
