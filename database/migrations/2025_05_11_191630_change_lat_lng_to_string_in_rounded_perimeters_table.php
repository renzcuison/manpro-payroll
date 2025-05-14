<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('rounded_perimeters', function (Blueprint $table) {
            $table->string('latitude', 50)->change();
            $table->string('longitude', 50)->change();
        });
    }

    public function down(): void
    {
        Schema::table('rounded_perimeters', function (Blueprint $table) {
            $table->decimal('latitude', 10, 6)->change();
            $table->decimal('longitude', 10, 6)->change();
        });
    }
};
