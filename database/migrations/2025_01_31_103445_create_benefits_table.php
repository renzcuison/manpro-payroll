<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateBenefitsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('benefits', function (Blueprint $table) {
            $table->id();
            $table->string('name', 128);
            $table->enum('type',['Amount', 'Percentage', 'Bracket Amount', 'Bracket Percentage']);
            $table->decimal('employee_percentage', 10, 2)->nullable();
            $table->decimal('employer_percentage', 10, 2)->nullable();
            $table->decimal('employee_amount', 10, 2)->nullable();
            $table->decimal('employer_amount', 10, 2)->nullable();
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
        Schema::dropIfExists('benefits');
    }
}
