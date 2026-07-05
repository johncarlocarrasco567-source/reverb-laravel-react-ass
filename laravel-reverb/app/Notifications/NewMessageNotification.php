<?php

namespace App\Notifications;

use App\Models\Message;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class NewMessageNotification extends Notification implements ShouldBroadcast
{
    protected $message;

    public function __construct(Message $message)
    {
        $this->message = $message;
    }

    public function via($notifiable)
    {
        return ['database', 'broadcast'];
    }

    public function toDatabase($notifiable)
    {
        return [
            'message_id'     => $this->message->id,
            'sender_id'      => $this->message->sender_id,
            'sender_name'    => $this->message->sender->name ?? 'Unknown',
            'content_preview'=> substr($this->message->content, 0, 50),
            'chat_user_id'   => $this->message->sender_id,
        ];
    }

    public function toBroadcast($notifiable)
    {
        return new BroadcastMessage([
            'message_id'     => $this->message->id,
            'sender_id'      => $this->message->sender_id,
            'sender_name'    => $this->message->sender->name ?? 'Unknown',
            'content_preview'=> substr($this->message->content, 0, 50),
            'chat_user_id'   => $this->message->sender_id,
        ]);
    }

    public function broadcastOn()
    {
        return new PrivateChannel('notifications.' . $this->message->receiver_id);
    }
}