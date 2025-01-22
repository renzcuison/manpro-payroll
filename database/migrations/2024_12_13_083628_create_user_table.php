<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class CreateUserTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('user_name', 100)->unique();

            $table->string('first_name', 50);
            $table->string('middle_name', 50)->nullable();
            $table->string('last_name', 50);
            $table->string('suffix', 50)->nullable();

            $table->date('birth_date')->nullable();

            $table->string('address', 200)->nullable();
            $table->string('contact_number', 15)->nullable();
            $table->string('email', 200)->unique();
            $table->string('password', 100);

            $table->enum('user_type', ['SuperAdmin', 'Admin', 'Employee'])->default('Employee');
            $table->string('profile_pic', 200)->nullable();

            $table->string('verify_code', 8)->nullable();
            $table->dateTime('code_expiration')->nullable();
            $table->tinyInteger('is_verified')->nullable();

            // $table->foreign('client_id')->references('id')->on('clients');
            // $table->foreign('branch_id')->references('id')->on('branches');
            // $table->foreign('department_id')->references('id')->on('departments');

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
        Schema::dropIfExists('user');
    }
}