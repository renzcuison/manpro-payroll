<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddPaidLeaveToApplicationTypesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('application_types', function (Blueprint $table) {
            $table->boolean('is_paid_leave')->after('name')->default(false);
            $table->integer('amount')->after('percentage')->nullable()->default(0);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('application_types', function (Blueprint $table) {
            $table->dropColumn('is_paid_leave');
            $table->dropColumn('amount');
        });
    }
}
