import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { getEcho } from '../echo';

export default function NotificationBell() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef();
  const navigate = useNavigate();

  const fetchUnread = async () => {
    try {
      const { data } = await axios.get('/api/notifications');
      setNotifications(data);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  useEffect(() => {
    if (user) {
      const echo = getEcho();
      if (!echo) return;
      fetchUnread();
      const channel = echo.private(`notifications.${user.id}`);
      channel.notification(() => fetchUnread());
      return () => {
        channel.stopListening('.BroadcastNotificationCreated');
      };
    }
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = async (notification) => {
    await axios.post(`/api/notifications/${notification.id}/read`);
    setNotifications(prev => prev.filter(n => n.id !== notification.id));
    navigate(`/dashboard/chat/${notification.data.chat_user_id}`);
    setIsOpen(false);
  };

  const markAllRead = async () => {
    await axios.post('/api/notifications/read-all');
    setNotifications([]);
  };

  const unreadCount = notifications.length;

  return (
    <div className="notification-bell" ref={dropdownRef}>
      <button className="bell-btn" onClick={() => setIsOpen(!isOpen)}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="bell-dropdown">
          <div className="header">
            <h4>Notifications</h4>
            {unreadCount > 0 && (
              <button className="mark-all" onClick={markAllRead}>Mark all read</button>
            )}
          </div>
          <div className="list">
            {notifications.length === 0 ? (
              <div className="empty">No new notifications</div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className="notification-item"
                  onClick={() => handleNotificationClick(notif)}
                >
                  <span className="avatar-sm">{notif.data.sender_name.charAt(0).toUpperCase()}</span>
                  <div className="content">
                    <div className="sender">{notif.data.sender_name}</div>
                    <div className="preview">{notif.data.content_preview}</div>
                    <div className="time">{new Date(notif.created_at).toLocaleString()}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}