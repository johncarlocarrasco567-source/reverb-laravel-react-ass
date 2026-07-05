<?php

namespace App\Events;

use App\Models\Message;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessageSent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $message;

    public function __construct(Message $message)
    {
        $this->message = $message;
    }

    public function broadcastOn()
    {
        // Broadcast to the receiver's private channel
        return new PrivateChannel('chat.' . $this->message->receiver_id);
    }

    // 👇 This makes the event name 'MessageSent' (without namespace)
  public function broadcastAs()
{
    return 'MessageSent';
}

    public function broadcastWith()
    {
        return [
            'id'          => $this->message->id,
            'sender_id'   => $this->message->sender_id,
            'content'     => $this->message->content,
            'created_at'  => $this->message->created_at->toISOString(),
        ];
    }
}