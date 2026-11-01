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
        Schema::create('leads', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('phone');
            $table->string('email')->nullable();
            $table->string('company')->nullable();

            // Service & Budget linkage with snapshot for persistence
            $table->foreignId('service_id')->nullable()->constrained('services')->nullOnDelete();
            $table->foreignId('service_budget_id')->nullable()->constrained('service_budgets')->nullOnDelete();
            $table->string('service_name_snapshot')->nullable();
            $table->string('budget_range_snapshot')->nullable();

            // CRM Pipeline State
            $table->string('status')->default('new'); // new, contacted, qualified, proposal_sent, negotiation, won, lost
            $table->string('priority')->default('medium'); // low, medium, high, urgent
            $table->foreignId('assigned_to')->nullable()->constrained('users')->nullOnDelete();
            $table->text('internal_notes')->nullable();
            $table->string('lost_reason')->nullable();
            $table->timestamp('contacted_at')->nullable();
            $table->timestamp('next_follow_up_at')->nullable();

            // Source tracking & metadata
            $table->string('source')->default('website_contact');
            $table->string('ip_address', 45)->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('leads');
    }
};
