<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\NotificationController;
use App\Models\User;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Messages
    Route::get('/messages/{userId}', [MessageController::class, 'index']);
    Route::post('/messages', [MessageController::class, 'store']);

    // Notifications
    Route::get('/notifications', [NotificationController::class, 'unread']);
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllRead']);

    Route::get('/users/{id}', function ($id) {
    return User::findOrFail($id);
})->middleware('auth:sanctum');

Route::get('/users', function () {
    return \App\Models\User::all();
});
});