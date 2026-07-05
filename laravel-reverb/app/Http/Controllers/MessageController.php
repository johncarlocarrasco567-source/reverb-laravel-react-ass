<?php

namespace App\Http\Controllers;

use App\Models\Message;
use App\Models\User;
use App\Events\MessageSent;
use App\Notifications\NewMessageNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class MessageController extends Controller
{
    public function index($userId)
    {
        $authId = auth()->id();
        $messages = Message::where(function ($q) use ($authId, $userId) {
                $q->where('sender_id', $authId)->where('receiver_id', $userId);
            })->orWhere(function ($q) use ($authId, $userId) {
                $q->where('sender_id', $userId)->where('receiver_id', $authId);
            })->orderBy('created_at')->get();

        return response()->json($messages);
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'receiver_id' => 'required|exists:users,id',
                'content'     => 'required|string',
            ]);

            $message = Message::create([
                'sender_id'   => auth()->id(),
                'receiver_id' => $validated['receiver_id'],
                'content'     => $validated['content'],
            ]);

            // Load the sender relationship for the notification
            $message->load('sender');

            // Broadcast (catch errors so response isn't blocked)
            try {
                broadcast(new MessageSent($message))->toOthers();
            } catch (\Exception $e) {
                Log::error('Broadcast failed: ' . $e->getMessage());
            }

            // Notify recipient (catch errors)
            try {
                $recipient = User::find($validated['receiver_id']);
                $recipient->notify(new NewMessageNotification($message));
            } catch (\Exception $e) {
                Log::error('Notification failed: ' . $e->getMessage());
            }

            return response()->json($message, 201);
        } catch (\Exception $e) {
            Log::error('Message store error: ' . $e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ]);
            return response()->json([
                'error' => 'Failed to send message: ' . $e->getMessage()
            ], 500);
        }
    }
}