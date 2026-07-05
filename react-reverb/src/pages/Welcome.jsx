import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Welcome() {
  const { user } = useAuth();

  return (
    <div className="welcome-page">
      <div className="welcome-card">
        <div className="welcome-brand">
          <span className="brand-dot" />
          <h1>ChatApp</h1>
        </div>

        {user ? (
          // Logged‑in state
          <>
            <p className="welcome-tagline">
              Welcome back, <strong>{user.name}</strong>!<br />
              Ready to chat?
            </p>
            <div className="welcome-actions">
              <Link to="/dashboard" className="btn-primary">Go to Dashboard</Link>
            </div>
          </>
        ) : (
          // Guest state
          <>
            <p className="welcome-tagline">
              Connect instantly. <br />
              Chat with anyone, anywhere.
            </p>
            <div className="welcome-actions">
              <Link to="/login" className="btn-primary">Sign In</Link>
              <Link to="/register" className="btn-secondary">Create Account</Link>
            </div>
          </>
        )}

        <div className="welcome-features">
          <span>⚡ Real‑time</span>
          <span>🔒 Private</span>
          <span>📱 Mobile‑ready</span>
        </div>
      </div>
    </div>
  );
}