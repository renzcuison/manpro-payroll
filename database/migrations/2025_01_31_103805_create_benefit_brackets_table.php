<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateBenefitBracketsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('benefit_brackets', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('benefit_id');
            $table->decimal('range_start', 10, 2);
            $table->decimal('range_end', 10, 2);
            $table->decimal('employee_percentage', 10, 2)->nullable();
            $table->decimal('employee_amount', 10, 2)->nullable();
            $table->decimal('employer_percentage', 10, 2)->nullable();
            $table->decimal('employer_amount', 10, 2)->nullable();
            $table->softDeletes();
            $table->timestamps();

            $table->foreign('benefit_id')->references('id')->on('benefits');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('benefit_brackets');
    }
}
