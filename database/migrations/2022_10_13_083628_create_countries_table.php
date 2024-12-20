<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateCountriesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('countries', function (Blueprint $table) {
            $table->integer('num_code')->default(0)->primary();
            $table->string('alpha_2_code', 2)->nullable()->unique('alpha_2_code');
            $table->string('alpha_3_code', 3)->nullable()->unique('alpha_3_code');
            $table->string('en_short_name', 52)->nullable();
            $table->string('nationality', 39)->nullable();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('countries');
    }
}
