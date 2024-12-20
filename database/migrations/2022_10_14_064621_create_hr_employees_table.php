<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateHrEmployeesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('hr_employees', function (Blueprint $table) {
            $table->integer("emp_id", true);
            $table->string("photo", 300)->nullable();
            $table->string("firstname", 255)->nullable();
            $table->string("lastname", 255)->nullable();
            $table->string("position", 255)->nullable();
            $table->integer("rate")->nullable();
            $table->string("birth_date", 255)->nullable();
            $table->string("email", 255)->nullable();
            $table->string("contact_number", 255)->nullable();
            $table->string("address", 255)->nullable();
            $table->integer('is_deleted')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('hr_employees');
    }
}