import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Gamepad2, ArrowLeft, CheckCircle } from 'lucide-react';
import authService from '../services/authService';
import '../styles/Auth.css';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const result = await authService.forgotPassword(email);
      if (result.success) {
        setMessage(result.message || 'Password reset email sent. Please check your inbox.');
        setEmail('');
      } else {
        setError(result.error || 'An error occurred. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <button
            className="back-button"
            onClick={() => navigate('/login')}
            aria-label="Back to login"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="auth-logo">
            <Gamepad2 size={60} />
          </div>
          <h1 className="auth-title">Forgot Password?</h1>
          <p className="auth-subtitle">
            Enter your email address and we'll send you a link to reset your password
          </p>
        </div>

        {message ? (
          <div className="success-verification-container">
            <div className="success-icon">
              <CheckCircle size={64} />
            </div>
            <h2 className="success-title">Email Sent!</h2>
            <div className="success-message">
              <p>{message}</p>
            </div>
            <div className="email-info">
              <strong>Check your email:</strong> {email || 'your inbox'}
            </div>
            <div className="success-actions">
              <button onClick={() => navigate('/login')} className="btn-primary">
                Back to Login
              </button>
            </div>
            <div className="email-check-note">
              <p><strong>Didn't receive the email?</strong></p>
              <ul>
                <li>Check your spam folder</li>
                <li>Make sure the email address is correct</li>
                <li>Wait a few minutes and try again</li>
              </ul>
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
                <Mail size={20} className="input-icon" />
                <input
                  type="email"
                  className="auth-input"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Link'}
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
