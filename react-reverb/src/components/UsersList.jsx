import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useParams } from 'react-router-dom';

export default function UsersList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const { userId } = useParams(); // still works because param is 'userId'

  useEffect(() => {
    axios.get('/api/users')
      .then(res => {
        setUsers(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(query.toLowerCase()) ||
    u.email.toLowerCase().includes(query.toLowerCase())
  );

  if (loading) return <div className="text-center mt-4">Loading users...</div>;

  return (
    <div className="users-list">
      <h3>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        Contacts
      </h3>

      <div className="users-search">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
        <input
          type="text"
          placeholder="Search contacts..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <ul>
        {filteredUsers.length === 0 ? (
          <li className="users-empty">No contacts found</li>
        ) : (
          filteredUsers.map(user => (
            <li key={user.id}>
              <Link to={`/dashboard/chat/${user.id}`} className={parseInt(userId) === user.id ? 'active' : ''}>
                <span className="avatar">{getInitials(user.name)}</span>
                <span className="user-info">
                  <span className="name">{user.name}</span>
                  <span className="email">{user.email}</span>
                </span>
              </Link>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}