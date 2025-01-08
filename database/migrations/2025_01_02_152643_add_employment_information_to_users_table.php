<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddEmploymentInformationToUsersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->enum('salary_type', ['Hourly', 'Daily', 'Weekly', 'Bi-Monthly', 'Monthly'])->default('Monthly')->nullable()->after('user_type');
            $table->decimal('salary', 10, 2)->default(0.00)->after('salary_type');

            $table->enum('gender', ['Male', 'Female'])->nullable()->after('birth_date');

            $table->enum('employment_type', ['Probationary', 'Regular', 'Full-Time', 'Part-Time'])->nullable()->after('is_verified');
            $table->enum('employment_status', ['Active', 'Resigned', 'Terminated'])->nullable()->after('employment_type');

            $table->date('date_start')->nullable()->after('is_verified');
            $table->date('date_end')->nullable()->after('date_start');

            $table->unsignedBigInteger('branch_id')->nullable()->after('client_id');
            $table->unsignedBigInteger('department_id')->nullable()->after('branch_id');
            $table->unsignedBigInteger('role_id')->nullable()->after('department_id');
            $table->unsignedBigInteger('job_title_id')->nullable()->after('role_id');

            $table->foreign('branch_id')->references('id')->on('branches');
            $table->foreign('department_id')->references('id')->on('departments');
            $table->foreign('role_id')->references('id')->on('employee_roles');
            $table->foreign('job_title_id')->references('id')->on('job_titles');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['branch_id']);
            $table->dropForeign(['department_id']);
            $table->dropForeign(['role_id']);
            $table->dropForeign(['job_title_id']);

            $table->dropColumn('salary_type');
            $table->dropColumn('salary');

            $table->dropColumn('gender');

            $table->dropColumn('employment_type');
            $table->dropColumn('employment_status');

            $table->dropColumn('date_start');
            $table->dropColumn('date_end');

            $table->dropColumn('branch_id');
            $table->dropColumn('department_id');
            $table->dropColumn('role_id');
            $table->dropColumn('job_title_id');
        });
    }
}
