<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateFinanceTransactionTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('finance_transaction', function (Blueprint $table) {
            $table->integer('val_id', true);
            $table->integer('val_add_by')->nullable();
            $table->string('val_phase_id', 11)->nullable();
            $table->string('val_assign_to', 11)->nullable();
            $table->date('val_date')->nullable();
            $table->string('val_method', 50)->nullable();
            $table->string('val_transaction_no', 50)->nullable();
            $table->string('val_currency', 30)->nullable();
            $table->string('val_amount', 20)->nullable();
            $table->string('val_charge', 20)->nullable();
            $table->string('val_initial_amount', 20)->nullable();
            $table->string('val_usd_rate', 20)->nullable();
            $table->string('val_usd_total', 20)->nullable();
            $table->string('val_php_rate', 20)->nullable();
            $table->string('val_php_total', 20)->nullable();
            $table->string('val_client_rate', 20)->nullable();
            $table->string('val_client_total', 20)->nullable();
            $table->string('val_note', 500)->nullable();
            $table->string('val_attachment', 300)->nullable();
            $table->string('val_remarks')->nullable();
            $table->integer('admin_notification')->default(0);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('finance_transaction');
    }
}
