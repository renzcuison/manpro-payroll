<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateRequirementFieldTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('requirement_field', function (Blueprint $table) {
            $table->integer('requirement_id', true);
            $table->integer('requirement_order_no')->nullable();
            $table->string('requirement_space_id', 11)->nullable();
            $table->string('requirement_type', 30)->nullable();
            $table->string('requirement_privacy', 30)->nullable();
            $table->string('requirement_name', 100)->nullable();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('requirement_field');
    }
}
