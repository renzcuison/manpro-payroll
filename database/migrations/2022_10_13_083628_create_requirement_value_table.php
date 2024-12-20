<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateRequirementValueTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('requirement_value', function (Blueprint $table) {
            $table->integer('value_id', true);
            $table->string('value_by', 11)->nullable();
            $table->string('value_to', 11)->nullable();
            $table->string('value_field_id', 11)->nullable();
            $table->string('value_value', 100)->nullable();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('requirement_value');
    }
}
