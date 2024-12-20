<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateContactClientTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('contact_client', function (Blueprint $table) {
            $table->integer('contact_client_id', true);
            $table->integer('contact_id')->nullable();
            $table->string('contact_fname', 30)->nullable();
            $table->string('contact_mname', 30)->nullable();
            $table->string('contact_lname', 30)->nullable();
            $table->string('contact_bdate', 30)->nullable();
            $table->string('contact_gender', 20)->nullable();
            $table->string('contact_email', 100)->nullable();
            $table->string('contact_fbname', 100)->nullable();
            $table->string('contact_messenger', 200)->nullable();
            $table->string('contact_cpnum', 20)->nullable();
            $table->string('contact_country', 100)->nullable();
            $table->string('contact_city', 100)->nullable();
            $table->string('contact_zip', 20)->nullable();
            $table->string('contact_street', 200)->nullable();
            $table->string('contact_location', 100)->nullable();
            $table->string('contact_status', 30)->nullable();
            $table->string('contact_nationality', 30)->nullable();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('contact_client');
    }
}
