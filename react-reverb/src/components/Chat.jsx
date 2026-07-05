import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { getEcho } from '../echo';

export default function Chat() {
  const { userId } = useParams();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [recipient, setRecipient] = useState(null);
  const messagesEndRef = useRef();

  // Load messages & recipient, and subscribe to real‑time channel
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [msgsRes, userRes] = await Promise.all([
          axios.get(`/api/messages/${userId}`),
          axios.get(`/api/users/${userId}`)
        ]);
        setMessages(msgsRes.data);
        setRecipient(userRes.data);
      } catch (err) {
        console.error('Failed to load chat:', err);
      }
    };
    fetchData();

    // Real‑time subscription
    const echo = getEcho();
    if (!echo || !user) return;

    const channel = echo.private(`chat.${user.id}`);
    channel
      .listen('.MessageSent', (data) => {
        console.log('🔥 Chat event received:', data);
        // Only add if it's from the other user (we already have ours optimistically)
        if (data.sender_id === parseInt(userId, 10)) {
          setMessages(prev => [...prev, data]);
        }
      })
      .subscribed(() => console.log('✅ Subscribed to chat channel'))
      .error((err) => console.error('❌ Channel error:', err));

    return () => {
      channel.stopListening('.MessageSent');
      echo.leaveChannel(`private-chat.${user.id}`);
    };
  }, [userId, user]);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send message
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    try {
      const { data } = await axios.post('/api/messages', {
        receiver_id: userId,
        content: newMessage,
      });
      // Optimistically add the message
      setMessages(prev => [...prev, data]);
      setNewMessage('');
    } catch (err) {
      console.error('Send error:', err);
    }
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (!recipient) {
    return (
      <div className="spinner">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M4 12a8 8 0 018-8" />
        </svg>
        Loading...
      </div>
    );
  }

  return (
    <>
      {/* Chat Header */}
      <div className="chat-header">
        <span className="avatar">{getInitials(recipient.name)}</span>
        <div>
          <div className="recipient-name">{recipient.name}</div>
          <div className="online-status">Online</div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="messages-area">
        {messages.length === 0 ? (
          <div className="empty-messages">No messages yet. Start chatting!</div>
        ) : (
          messages.map((msg) => {
            const isMine = msg.sender_id === user.id;
            return (
              <div key={msg.id} className={`message ${isMine ? 'sent' : 'received'}`}>
                <div className="bubble">
                  {msg.content}
                  <span className="time">
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form className="chat-input" onSubmit={sendMessage}>
        <input
          type="text"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button type="submit" disabled={!newMessage.trim()}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </form>
    </>
  );
}