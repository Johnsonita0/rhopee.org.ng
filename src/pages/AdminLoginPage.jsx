import { useState } from 'react';
import '../css/pages/AdminLoginPage.css';
import { signInAdmin } from '../lib/supabaseClient.js';

function AdminLoginPage({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data, error: authError } = await signInAdmin(email, password);

      if (authError) {
        throw authError;
      }

      localStorage.setItem('adminAuth', JSON.stringify({
        authenticated: true,
        loginTime: new Date().toISOString(),
        userId: data?.user?.id || null,
      }));
      onLoginSuccess(data?.user);
    } catch (authError) {
      setError(authError.message || 'Unable to access the admin dashboard.');
      setPassword('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="admin-login-page">
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <img src="/logo/logo1.jpeg" alt="RHOPEE" className="login-logo" />
            <h1>RHOPEE Admin</h1>
            <p>Use the Supabase admin account email and password.</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <label>
              <span>Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter admin email"
                required
                disabled={loading}
              />
            </label>

            <label>
              <span>Password</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
                disabled={loading}
              />
            </label>

            {error && <p className="error-message">{error}</p>}

            <button type="submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Login to Dashboard'}
            </button>
          </form>

          <div className="login-footer">
            <p>🔐 Secure admin access only</p>
            <small>For security purposes, all admin activities are logged.</small>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AdminLoginPage;
