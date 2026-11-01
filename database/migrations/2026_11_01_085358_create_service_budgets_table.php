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
        Schema::create('service_budgets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_id')->constrained('services')->cascadeOnDelete();
            $table->string('tier_key'); // e.g. startup, growth, enterprise
            $table->json('type'); // {"en": "MVP / Startup", "ar": "منتج أولي / ناشئ"}
            $table->string('range'); // e.g. "$3,000 - $8,000"
            $table->json('description')->nullable();
            $table->integer('order')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('service_budgets');
    }
};
