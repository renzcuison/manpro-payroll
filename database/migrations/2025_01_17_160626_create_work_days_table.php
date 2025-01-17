<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateWorkDaysTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('work_days', function (Blueprint $table) {
            $table->id();
            $table->enum('title', ['Work Day', 'Non-Working Holiday', 'Working Holiday'])->default('Work Day');

            $table->datetime('start_date');
            $table->datetime('end_date');
            $table->string('color', 36);

            $table->unsignedBigInteger('client_id');
            $table->unsignedBigInteger('work_group_id');

            $table->softDeletes();
            $table->unsignedBigInteger('deleted_by')->nullable();
            $table->timestamps();

            $table->foreign('client_id')->references('id')->on('clients');
            $table->foreign('work_group_id')->references('id')->on('work_groups');
            $table->foreign('deleted_by')->references('id')->on('users');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('work_days');
    }
}
