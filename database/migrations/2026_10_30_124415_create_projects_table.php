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
        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('category')->default('web');
            $table->json('category_label')->nullable();
            $table->json('title');
            $table->json('tagline')->nullable();
            $table->json('description')->nullable();
            $table->json('problem')->nullable();
            $table->json('solution')->nullable();
            $table->string('image')->nullable();
            $table->json('gallery')->nullable();
            $table->json('technologies')->nullable();
            $table->json('metrics')->nullable();
            $table->json('features')->nullable();
            $table->string('client')->nullable();
            $table->string('live_url')->nullable();
            $table->boolean('is_featured')->default(false);
            $table->integer('order')->default(0);
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('projects');
    }
};
