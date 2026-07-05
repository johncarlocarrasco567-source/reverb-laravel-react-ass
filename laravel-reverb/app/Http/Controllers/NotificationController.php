<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Notifications\DatabaseNotification;
use Illuminate\Broadcasting\PrivateChannel; 

class NotificationController extends Controller
{
    public function unread()
    {
        $notifications = auth()->user()->unreadNotifications;
        return response()->json($notifications);
    }

    public function markAsRead($id)
    {
        $notification = DatabaseNotification::findOrFail($id);
        $this->authorize('update', $notification); // optional
        $notification->markAsRead();
        return response()->json(['message' => 'Marked as read']);
    }

    public function markAllRead()
    {
        auth()->user()->unreadNotifications->markAsRead();
        return response()->json(['message' => 'All marked as read']);
    }
}