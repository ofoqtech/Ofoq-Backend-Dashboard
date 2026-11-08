<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\LeadController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\WhatsAppController;
use App\Http\Controllers\WhatsAppWebhookController;
use Illuminate\Support\Facades\Route;

// Default server landing page: redirects directly to login (or dashboard if already authenticated)
Route::get('/', function () {
    return auth()->check()
        ? redirect('/dashboard')
        : redirect('/login');
})->name('home');

// Swagger Documentation redirect
Route::redirect('swagger', '/api/documentation');
Route::redirect('api/docs', '/api/documentation');

// Meta WhatsApp Cloud API Webhooks
Route::get('webhooks/whatsapp', [WhatsAppWebhookController::class, 'verify'])->name('webhooks.whatsapp.verify');
Route::post('webhooks/whatsapp', [WhatsAppWebhookController::class, 'handle'])->name('webhooks.whatsapp.handle');

Route::middleware(['auth:web,sanctum'])->group(function () {
    Route::get('dashboard', DashboardController::class)->name('dashboard');

    // CRM & Lead Pipeline Management
    Route::get('crm', [LeadController::class, 'index'])->name('crm.index');
    Route::get('crm/realtime-check', [LeadController::class, 'realtimeCheck'])->name('crm.realtime-check');
    Route::get('notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::post('notifications/mark-as-read', [NotificationController::class, 'markAsRead'])->name('notifications.mark-as-read');
    Route::post('crm/notifications/mark-read', [NotificationController::class, 'markAsRead'])->name('crm.notifications.mark-read');
    Route::post('crm', [LeadController::class, 'store'])->name('crm.store');
    Route::patch('crm/{lead}/status', [LeadController::class, 'updateStatus'])->name('crm.update-status');
    Route::patch('crm/{lead}/priority', [LeadController::class, 'updatePriority'])->name('crm.update-priority');
    Route::patch('crm/{lead}/assign', [LeadController::class, 'assign'])->name('crm.assign');
    Route::post('crm/{lead}/notes', [LeadController::class, 'addNote'])->name('crm.add-note');
    Route::delete('crm/{lead}', [LeadController::class, 'destroy'])->name('crm.destroy');

    // WhatsApp CRM Inbox & Direct Messaging
    Route::get('crm/whatsapp', [WhatsAppController::class, 'index'])->name('crm.whatsapp.index');
    Route::get('crm/whatsapp/conversations/{conversation}/messages', [WhatsAppController::class, 'messages'])->name('crm.whatsapp.messages');
    Route::post('crm/whatsapp/conversations/{conversation}/messages', [WhatsAppController::class, 'sendMessage'])->name('crm.whatsapp.send-message');
    Route::post('crm/whatsapp/conversations/{conversation}/media', [WhatsAppController::class, 'sendMedia'])->name('crm.whatsapp.send-media');
    Route::post('crm/whatsapp/conversations/{conversation}/templates', [WhatsAppController::class, 'sendTemplate'])->name('crm.whatsapp.send-template');
    Route::patch('crm/whatsapp/conversations/{conversation}/assign', [WhatsAppController::class, 'assign'])->name('crm.whatsapp.assign');
    Route::patch('crm/whatsapp/conversations/{conversation}/status', [WhatsAppController::class, 'updateStatus'])->name('crm.whatsapp.update-status');
    Route::post('crm/whatsapp/conversations', [WhatsAppController::class, 'startConversation'])->name('crm.whatsapp.start');
    Route::post('crm/whatsapp/conversations/{conversation}/lead-notes', [WhatsAppController::class, 'addLeadNote'])->name('crm.whatsapp.add-lead-note');
    Route::patch('crm/whatsapp/conversations/{conversation}/lead-status', [WhatsAppController::class, 'updateLeadStatus'])->name('crm.whatsapp.update-lead-status');

    Route::resource('employees', EmployeeController::class);
    Route::resource('admins', AdminController::class);
    Route::resource('categories', CategoryController::class);
    Route::delete('projects/{project}/images/{image}', [ProjectController::class, 'destroyImage'])->name('projects.images.destroy');
    Route::resource('projects', ProjectController::class);
});

require __DIR__.'/settings.php';
