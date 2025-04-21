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
            // Drop existing foreign keys
            $table->dropColumn(['package_id', 'feature_id']);
        });
        
        Schema::table('feature_package', function (Blueprint $table) {
            // Add new foreign keys with cascade
            $table->foreignId('package_id')->constrained('packages')->onDelete('cascade')->onUpdate('cascade');
            $table->foreignId('feature_id')->constrained('features')->onDelete('cascade')->onUpdate('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('feature_package', function (Blueprint $table) {
            // Add new foreign keys with cascade
            $table->foreignId('package_id')->constrained('packages')->onDelete('cascade')->onUpdate('cascade');
            $table->foreignId('feature_id')->constrained('features')->onDelete('cascade')->onUpdate('cascade');
        });
    }
};