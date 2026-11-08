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
        Schema::create('whatsapp_accounts', function (Blueprint $table) {
            $table->id();
            $table->string('name')->default('Default Business Account');
            $table->string('phone_number_id')->nullable()->index();
            $table->string('business_account_id')->nullable();
            $table->string('display_phone_number')->nullable();
            $table->text('access_token')->nullable();
            $table->text('app_secret')->nullable();
            $table->string('webhook_verify_token')->nullable();
            $table->string('graph_version')->default('v22.0');
            $table->boolean('is_active')->default(true);
            $table->boolean('is_default')->default(true);
            $table->timestamps();
        });

        Schema::create('whatsapp_contacts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lead_id')->nullable()->constrained('leads')->nullOnDelete();
            $table->string('wa_id')->unique()->index();
            $table->string('profile_name')->nullable();
            $table->string('phone_number')->nullable();
            $table->string('avatar_url')->nullable();
            $table->timestamps();
        });

        Schema::create('whatsapp_conversations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('account_id')->nullable()->constrained('whatsapp_accounts')->nullOnDelete();
            $table->foreignId('contact_id')->constrained('whatsapp_contacts')->cascadeOnDelete();
            $table->foreignId('lead_id')->nullable()->constrained('leads')->nullOnDelete();
            $table->foreignId('assigned_to')->nullable()->constrained('users')->nullOnDelete();
            $table->string('status', 30)->default('open')->index();
            $table->unsignedInteger('unread_count')->default(0);
            $table->timestamp('last_message_at')->nullable()->index();
            $table->text('last_message_preview')->nullable();
            $table->string('last_message_direction', 20)->nullable();
            $table->boolean('is_pinned')->default(false);
            $table->timestamps();

            $table->index(['status', 'last_message_at']);
            $table->index(['assigned_to', 'status']);
        });

        Schema::create('whatsapp_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('conversation_id')->constrained('whatsapp_conversations')->cascadeOnDelete();
            $table->foreignId('contact_id')->constrained('whatsapp_contacts')->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('whatsapp_message_id')->nullable()->unique();
            $table->string('direction', 20)->index();
            $table->string('type', 30)->default('text');
            $table->text('body')->nullable();
            $table->string('status', 30)->default('pending')->index();
            $table->string('error_code')->nullable();
            $table->text('error_message')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamp('sent_at')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->timestamp('read_at')->nullable();
            $table->timestamps();

            $table->index(['conversation_id', 'created_at']);
            $table->index(['direction', 'status']);
        });

        Schema::create('whatsapp_media', function (Blueprint $table) {
            $table->id();
            $table->foreignId('message_id')->constrained('whatsapp_messages')->cascadeOnDelete();
            $table->string('meta_media_id')->nullable()->index();
            $table->string('disk')->default('public');
            $table->string('file_path');
            $table->string('file_name');
            $table->string('mime_type');
            $table->unsignedBigInteger('file_size')->nullable();
            $table->string('sha256', 64)->nullable();
            $table->text('caption')->nullable();
            $table->timestamps();
        });

        Schema::create('whatsapp_message_templates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('account_id')->nullable()->constrained('whatsapp_accounts')->nullOnDelete();
            $table->string('name')->index();
            $table->string('language', 10)->default('ar');
            $table->string('category', 30)->default('UTILITY');
            $table->string('status', 30)->default('APPROVED')->index();
            $table->string('header_type', 20)->default('NONE');
            $table->text('header_text')->nullable();
            $table->text('body_text');
            $table->text('footer_text')->nullable();
            $table->json('buttons')->nullable();
            $table->json('example_parameters')->nullable();
            $table->timestamps();

            $table->unique(['name', 'language']);
        });

        Schema::create('whatsapp_quick_replies', function (Blueprint $table) {
            $table->id();
            $table->string('shortcut', 50)->unique();
            $table->string('title');
            $table->text('content');
            $table->string('category')->nullable();
            $table->timestamps();
        });

        Schema::create('whatsapp_webhook_events', function (Blueprint $table) {
            $table->id();
            $table->string('event_id')->nullable()->index();
            $table->json('payload');
            $table->boolean('processed')->default(false)->index();
            $table->text('error')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('whatsapp_media');
        Schema::dropIfExists('whatsapp_messages');
        Schema::dropIfExists('whatsapp_conversations');
        Schema::dropIfExists('whatsapp_contacts');
        Schema::dropIfExists('whatsapp_webhook_events');
        Schema::dropIfExists('whatsapp_quick_replies');
        Schema::dropIfExists('whatsapp_message_templates');
        Schema::dropIfExists('whatsapp_accounts');
    }
};
