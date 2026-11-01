<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\LeadController;
use App\Http\Controllers\ProjectController;
use Illuminate\Support\Facades\Route;

// Default server landing page: redirects directly to login (or dashboard if already authenticated)
Route::get('/', function () {
    return auth()->check()
        ? redirect('/dashboard')
        : redirect('/login');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', DashboardController::class)->name('dashboard');

    // CRM & Lead Pipeline Management
    Route::get('crm', [LeadController::class, 'index'])->name('crm.index');
    Route::post('crm', [LeadController::class, 'store'])->name('crm.store');
    Route::patch('crm/{lead}/status', [LeadController::class, 'updateStatus'])->name('crm.update-status');
    Route::patch('crm/{lead}/priority', [LeadController::class, 'updatePriority'])->name('crm.update-priority');
    Route::patch('crm/{lead}/assign', [LeadController::class, 'assign'])->name('crm.assign');
    Route::post('crm/{lead}/notes', [LeadController::class, 'addNote'])->name('crm.add-note');
    Route::delete('crm/{lead}', [LeadController::class, 'destroy'])->name('crm.destroy');

    Route::resource('employees', EmployeeController::class);
    Route::resource('admins', AdminController::class);
    Route::resource('categories', CategoryController::class);
    Route::delete('projects/{project}/images/{image}', [ProjectController::class, 'destroyImage'])->name('projects.images.destroy');
    Route::resource('projects', ProjectController::class);
});

require __DIR__.'/settings.php';
