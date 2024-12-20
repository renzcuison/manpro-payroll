<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateFieldTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('field', function (Blueprint $table) {
            $table->integer('field_id', true);
            $table->integer('field_order')->nullable();
            $table->string('field_space_id', 11)->nullable();
            $table->string('field_type', 30)->nullable();
            $table->string('field_name', 50)->nullable();
            $table->dateTime('field_date_create')->nullable();
            $table->string('field_col_name')->nullable();
            $table->string('field_assign_to', 200)->nullable();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('field');
    }
}
