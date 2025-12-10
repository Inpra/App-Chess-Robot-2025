import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import './ForgotPassword.css';

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
    <div className="forgot-password-container">
      <div className="forgot-password-card">
        <h2>Forgot Password</h2>
        <p className="description">
          Enter your email address and we'll send you a link to reset your password.
        </p>

        {message && (
          <div className="success-message">
            <p>{message}</p>
            <button onClick={() => navigate('/login')} className="back-to-login-btn">
              Back to Login
            </button>
          </div>
        )}

        {!message && (
          <form onSubmit={handleSubmit}>
            {error && <div className="error-message">{error}</div>}

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
                disabled={loading}
              />
            </div>

            <button type="submit" disabled={loading} className="submit-btn">
              {loading ? 'Sending...' : 'Send Reset Password Email'}
            </button>

            <div className="back-link">
              <button type="button" onClick={() => navigate('/login')} className="link-btn">
                ← Back to Login
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
