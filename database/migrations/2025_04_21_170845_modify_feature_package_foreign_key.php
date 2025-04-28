<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {

        Schema::table('feature_package', function (Blueprint $table) {
            
            $table->dropForeign(['package_id']);
            $table->dropForeign(['feature_id']);

            // Recreate the foreign keys with onDelete('cascade')
            $table->foreign('package_id')
                  ->references('id')->on('packages')
                  ->onDelete('cascade');

            $table->foreign('feature_id')
                  ->references('id')->on('features')
                  ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('feature_package', function (Blueprint $table) {
            // Drop the updated foreign keys
            $table->dropForeign(['package_id']);
            $table->dropForeign(['feature_id']);

            // Recreate the original foreign keys WITHOUT onDelete('cascade')
            $table->foreign('package_id')
                  ->references('id')->on('packages');

            $table->foreign('feature_id')
                  ->references('id')->on('features');
        });
    }
};