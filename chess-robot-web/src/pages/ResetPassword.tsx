import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Eye, EyeOff, Gamepad2, AlertCircle, CheckCircle } from 'lucide-react';
import authService from '../services/authService';
import '../styles/Auth.css';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [token, setToken] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (!tokenFromUrl) {
      setError('Invalid or expired token.');
    } else {
      setToken(tokenFromUrl);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!token) {
      setError('Invalid token.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Password confirmation does not match.');
      return;
    }

    setLoading(true);

    try {
      const result = await authService.resetPassword(token, password);
      if (result.success) {
        setMessage(result.message || 'Password reset successfully!');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(result.error || 'An error occurred. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Invalid Token State
  if (!token) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-logo" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
              <AlertCircle size={60} color="#EF4444" />
            </div>
            <h1 className="auth-title">Invalid Token</h1>
            <p className="auth-subtitle">
              The password reset link is invalid or has expired
            </p>
          </div>

          <div className="error-message">
            Please request a new password reset link to continue.
          </div>

          <button
            onClick={() => navigate('/forgot-password')}
            className="auth-button"
          >
            Request New Password Reset
          </button>

          <div className="auth-footer" style={{ marginTop: '20px' }}>
            <span className="footer-text">Remember your password? </span>
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="footer-link"
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <Gamepad2 size={60} />
          </div>
          <h1 className="auth-title">Reset Password</h1>
          <p className="auth-subtitle">
            Enter a new password for your account
          </p>
        </div>

        {message ? (
          <div className="success-verification-container">
            <div className="success-icon">
              <CheckCircle size={64} />
            </div>
            <h2 className="success-title">Password Reset Successfully!</h2>
            <div className="success-message">
              <p>{message}</p>
            </div>
            <div className="email-info">
              Redirecting to login page...
            </div>
          </div>
        ) : (
          <form className="auth-form" onSubmit={handleSubmit}>
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <div className="input-group">
              <div className="input-wrapper">
                <Lock size={20} className="input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="auth-input"
                  placeholder="New Password (min 6 characters)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                  disabled={loading}
                  minLength={6}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="input-group">
              <div className="input-wrapper">
                <Lock size={20} className="input-icon" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="auth-input"
                  placeholder="Confirm New Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                  disabled={loading}
                  minLength={6}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={loading}
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? 'Processing...' : 'Reset Password'}
            </button>

            <div className="auth-footer">
              <span className="footer-text">Remember your password? </span>
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="footer-link"
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Sign In
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
