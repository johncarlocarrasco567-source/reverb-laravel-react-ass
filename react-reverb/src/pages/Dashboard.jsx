import { Outlet } from 'react-router-dom';
import NotificationBell from '../components/NotificationBell';
import UsersList from '../components/UsersList';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="dashboard">
      <nav className="navbar">
        <div className="brand">ChatApp</div>
        <div className="user-section">
          <span className="user-name">Hello, {user?.name}</span>
          <NotificationBell />
          <button onClick={logout} className="logout-btn">Logout</button>
        </div>
      </nav>
      <div className="main-layout">
        <div>
          <UsersList />
        </div>
        <div className="chat-container">
          <Outlet />
        </div>
      </div>
    </div>
  );
}