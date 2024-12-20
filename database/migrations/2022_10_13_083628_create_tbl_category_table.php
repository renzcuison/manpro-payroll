<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTblCategoryTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('tbl_category', function (Blueprint $table) {
            $table->integer('cat_id', true);
            $table->string('cat_name')->nullable();
            $table->integer('department_id')->default(0);
            $table->integer('deleted')->nullable()->default(0);
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
        Schema::dropIfExists('tbl_category');
    }
}
