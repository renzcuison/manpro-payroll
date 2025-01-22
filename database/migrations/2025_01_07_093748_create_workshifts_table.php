<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateWorkshiftsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('work_shifts', function (Blueprint $table) {
            $table->id();
            $table->string('name', 128);
            $table->enum('shift_type', ['Regular', 'Split'])->nullable();

            $table->string('first_label', 128)->nullable();
            $table->string('second_label', 128)->nullable();

            $table->unsignedBigInteger('client_id');

            $table->softDeletes();
            $table->timestamps();

            $table->foreign('client_id')->references('id')->on('clients');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('work_shifts', function (Blueprint $table) {
            $table->dropForeign(['client_id']);
        });
    
        Schema::dropIfExists('workshifts');
    }
}
