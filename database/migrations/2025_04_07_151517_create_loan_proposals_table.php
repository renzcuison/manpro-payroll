<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateLoanProposalsTable extends Migration
{
    public function up()
    {
        Schema::create('loan_proposals', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('loan_application_id');
            $table->decimal('proposed_loan_amount', 10, 2);
            $table->integer('proposed_payment_term');
            $table->decimal('monthly_interest_rate', 5, 2); // Stored as percentage (e.g., 2.00)
            $table->decimal('proposed_monthly_payment', 10, 2);
            $table->enum('status', ['Pending', 'Accepted', 'Rejected'])->default('Pending');
            $table->unsignedBigInteger('created_by');
            $table->timestamps();
            $table->softDeletes();

            // Foreign keys
            $table->foreign('loan_application_id')->references('id')->on('loan_applications');
            $table->foreign('created_by')->references('id')->on('users');
        });
    }

    public function down()
    {
        Schema::dropIfExists('loan_proposals');
    }
}