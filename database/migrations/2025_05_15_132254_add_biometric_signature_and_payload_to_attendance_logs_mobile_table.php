<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddBiometricSignatureAndPayloadToAttendanceLogsMobileTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('attendance_logs_mobile', function (Blueprint $table) {
            // Add new columns
            $table->string('biometric_signature')->nullable()->after('attendance_id');
            $table->string('payload')->nullable()->after('biometric_signature');
            
            // Modify existing path column to be nullable
            $table->string('path', 256)->nullable()->change();
            
            // Update foreign key to include onDelete('cascade')
            $table->dropForeign(['attendance_id']);
            $table->foreign('attendance_id')
                  ->references('id')
                  ->on('attendance_logs')
                  ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('attendance_logs_mobile', function (Blueprint $table) {
            // Drop new columns
            $table->dropColumn('biometric_signature');
            $table->dropColumn('payload');
            
            // Revert path to non-nullable
            $table->string('path', 256)->nullable(false)->change();
            
            // Revert foreign key to remove onDelete('cascade')
            $table->dropForeign(['attendance_id']);
            $table->foreign('attendance_id')
                  ->references('id')
                  ->on('attendance_logs');
        });
    }
}