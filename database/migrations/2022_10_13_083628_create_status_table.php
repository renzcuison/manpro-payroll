<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateStatusTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('status', function (Blueprint $table) {
            $table->integer('status_id', true);
            $table->integer('status_order_no')->nullable();
            $table->string('status_name', 100)->nullable();
            $table->string('status_color', 50)->nullable();
            $table->string('status_list_id', 20)->nullable();
            $table->dateTime('status__date_created')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('status');
    }
}
