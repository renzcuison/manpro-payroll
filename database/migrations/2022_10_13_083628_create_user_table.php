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
        Schema::create('user', function (Blueprint $table) {
            $table->integer('user_id', true);
            $table->string('fname', 50)->nullable();
            $table->string('mname', 50)->nullable();
            $table->string('lname', 50)->nullable();
            $table->string('address', 200)->nullable();
            $table->string('contact_number', 15)->nullable();
            $table->string('email', 200)->nullable();
            $table->date('bdate')->nullable();
            $table->string('username', 100)->nullable();
            $table->string('password', 100)->nullable();
            $table->string('user_type', 20)->nullable();
            $table->string('status', 255)->nullable();
            $table->string('profile_pic', 200)->nullable();
            $table->string('user_color', 20)->nullable();
            $table->string('team', 50)->nullable();
            $table->integer('log')->nullable();
            $table->integer('hourly_rate')->nullable();
            $table->integer('daily_rate')->nullable();
            $table->integer('monthly_rate')->nullable();
            $table->integer('work_days')->nullable();
            $table->integer('department_id')->nullable();
            $table->string('department')->nullable();
            $table->integer('category_id')->nullable();
            $table->string('category')->nullable();
            $table->dateTime('date_created')->nullable();
            $table->date('date_hired')->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->integer('is_deleted')->default(0);
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