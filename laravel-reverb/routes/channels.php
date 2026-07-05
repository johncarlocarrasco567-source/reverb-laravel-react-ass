<?php

use Illuminate\Support\Facades\Broadcast;

// 👇 Tell Laravel to use Sanctum for broadcast authentication
Broadcast::routes(['middleware' => ['auth:sanctum']]);

Broadcast::channel('notifications.{userId}', function ($user, $userId) {
    return (int) $user->id === (int) $userId;
});

Broadcast::channel('chat.{userId}', function ($user, $userId) {
    return (int) $user->id === (int) $userId;
});