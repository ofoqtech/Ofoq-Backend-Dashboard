<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\Api\ProjectApiController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\ProjectController;
use Illuminate\Support\Facades\Route;

// Default server landing page: redirects directly to login (or dashboard if already authenticated)
Route::get('/', function () {
    return auth()->check()
        ? redirect()->route('dashboard')
        : redirect()->route('login');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', DashboardController::class)->name('dashboard');

    Route::resource('employees', EmployeeController::class);
    Route::resource('admins', AdminController::class);
    Route::resource('categories', CategoryController::class);
    Route::delete('projects/{project}/images/{image}', [ProjectController::class, 'destroyImage'])->name('projects.images.destroy');
    Route::resource('projects', ProjectController::class);
});

// Public API endpoints for ofoq-frontend
Route::prefix('api')->name('api.')->group(function () {
    Route::get('categories', [ProjectApiController::class, 'categories'])->name('categories.index');
    Route::get('projects', [ProjectApiController::class, 'index'])->name('projects.index');
    Route::get('projects/{project}', [ProjectApiController::class, 'show'])->name('projects.show');
});

require __DIR__.'/settings.php';
