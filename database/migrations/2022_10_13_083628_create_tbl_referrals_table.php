<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTblReferralsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('tbl_referrals', function (Blueprint $table) {
            $table->integer('id', true);
            $table->integer('contact_id');
            $table->integer('referred_by');
            $table->string('status', 100)->default('inquiry');
            $table->string('amount');
            $table->dateTime('date_created')->useCurrent();
            $table->dateTime('date_updated')->useCurrent();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('tbl_referrals');
    }
}
