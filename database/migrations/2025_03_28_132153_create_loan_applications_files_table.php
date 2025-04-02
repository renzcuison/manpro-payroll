<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateLoanApplicationsFilesTable extends Migration
{
    public function up()
    {
        Schema::create('loan_applications_files', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('loan_application_id');
            $table->enum('type', ['Image', 'Document']);
            $table->string('path', 256);
            $table->timestamps();
            $table->softDeletes();

            // Foreign key constraint
            $table->foreign('loan_application_id')->references('id')->on('loan_applications');
        });
    }

    public function down()
    {
        Schema::dropIfExists('loan_applications_files');
    }
}