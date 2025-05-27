<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateAnnouncementRecipientsTable extends Migration
{
    public function up()
    {
        Schema::create('announcement_recipients', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('announcement_id');
            $table->unsignedBigInteger('branch_id')->nullable();
            $table->unsignedBigInteger('department_id')->nullable();
            $table->unsignedBigInteger('role_id')->nullable();
            $table->string('employment_type')->nullable();
            $table->string('employment_status')->nullable();
            $table->unsignedBigInteger('user_id')->nullable(); // Optional: if you want to store actual resolved users
            $table->timestamps();

            $table->foreign('announcement_id')->references('id')->on('announcements')->onDelete('cascade');
            // Optionally add foreign keys for branch, department, role, and user
        });
    }

    public function down()
    {
        Schema::dropIfExists('announcement_recipients');
    }
};