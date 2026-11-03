<?php

use App\Http\Controllers\Api\LeadApiController;
use App\Http\Controllers\Api\ProjectApiController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// CRM Services and Inquiry submission (throttled against spam and email bombing)
Route::get('services', [LeadApiController::class, 'services'])->name('api.services.index');
Route::post('service-form', [LeadApiController::class, 'submitServiceForm'])
    ->middleware('throttle:10,1')
    ->name('api.service-form.submit');
Route::post('contact', [LeadApiController::class, 'submitServiceForm'])
    ->middleware('throttle:10,1')
    ->name('api.contact.submit');

// Portfolio Projects and Categories
Route::get('categories', [ProjectApiController::class, 'categories'])->name('api.categories.index');
Route::get('projects', [ProjectApiController::class, 'index'])->name('api.projects.index');
Route::get('projects/{project}', [ProjectApiController::class, 'show'])->name('api.projects.show');
