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
        Schema::create('workshifts', function (Blueprint $table) {
            $table->id();
            $table->string('name', 128);
            $table->enum('shift_type', ['Regular', 'Split'])->nullable();

            $table->time('regular_time_in')->nullable();
            $table->time('regular_time_out')->nullable();

            $table->string('split_first_label', 128)->nullable();
            $table->time('split_first_time_in')->nullable();
            $table->time('split_first_time_out')->nullable();

            $table->string('split_second_label', 128)->nullable();
            $table->time('split_second_time_in')->nullable();
            $table->time('split_second_time_out')->nullable();

            $table->time('over_time_in')->nullable();
            $table->time('over_time_out')->nullable();

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
        Schema::table('workshifts', function (Blueprint $table) {
            $table->dropForeign(['client_id']);
        });
    
        Schema::dropIfExists('workshifts');
    }
}
