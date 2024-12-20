<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateContactTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('contact', function (Blueprint $table) {
            $table->integer('contact_id', true);
            $table->string('contact_fname', 30)->nullable();
            $table->string('contact_mname', 30)->nullable();
            $table->string('contact_lname', 30)->nullable();
            $table->dateTime('contact_bdate')->nullable()->useCurrent();
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
            $table->dateTime('contact_date_created')->nullable();
            $table->string('contact_created_by', 100)->nullable();
            $table->string('contact_assign_to', 300)->nullable();
            $table->string('contact_password', 100)->nullable();
            $table->string('contact_profile', 200)->nullable();
            $table->string('contact_status', 30)->nullable();
            $table->string('contact_nationality', 30)->nullable();
            $table->integer('admin_notification')->default(0);
            $table->integer('user_notification')->default(0);
            $table->string('username', 50)->nullable();
            $table->integer('is_removed')->default(0);
            $table->integer('change_pass_code')->nullable();
            $table->text('push_token')->nullable();
            $table->integer('referred_by')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('contact');
    }
}