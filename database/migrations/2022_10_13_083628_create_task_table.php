<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTaskTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('task', function (Blueprint $table) {
            $table->integer('task_id', true);
            $table->string('task_name', 100)->nullable();
            $table->string('task_order_no', 20)->nullable();
            $table->string('task_status_id', 20)->nullable();
            $table->string('task_list_id', 20)->nullable();
            $table->string('task_created_by', 11)->nullable();
            $table->date('task_date_created')->nullable();
            $table->date('task_due_date')->nullable();
            $table->string('task_priority', 20)->nullable();
            $table->string('task_tag', 300)->nullable();
            $table->string('task_assign_to', 300)->nullable();
            $table->string('task_contact', 20)->nullable();
            $table->integer('admin_notification')->default(0);
            $table->integer('admin_notification_assigned_task')->default(0);
            $table->integer('user_notification')->default(0);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('task');
    }
}
