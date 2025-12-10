import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, ArrowLeft, CheckCircle } from 'lucide-react';
import authService from '../services/authService';
import '../styles/Auth.css';

export default function Register() {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!username || !email || !password || !confirmPassword) {
            setError('Please fill in all fields.');
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }

        setLoading(true);

        try {
            const response = await authService.signUp({
                email,
                password,
                username,
                fullName: fullName || undefined,
            });

            if (response.success) {
                // Check if user is new (0 games played) to set initial Elo
                if (response.user && response.user.totalGamesPlayed === 0) {
                    navigate('/avatar-selection');
                } else {
                    setShowSuccessMessage(true);
                }
            } else {
                setError(response.error || 'Registration failed. Please try again.');
            }
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    // Show success message instead of form
    if (showSuccessMessage) {
        return (
            <div className="auth-container">
                <div className="auth-card">
                    <div className="success-verification-container">
                        <div className="success-icon">
                            <CheckCircle size={64} />
                        </div>
                        <h1 className="success-title">Account Created Successfully!</h1>
                        <div className="success-message">
                            <p>
                                <strong>Please check your email to verify your account.</strong>
                            </p>
                            <p className="email-info">
                                We've sent a verification link to <strong>{email}</strong>
                            </p>
                            <p className="instructions">
                                Click the link in the email to activate your account and start playing.
                            </p>
                        </div>

                        <div className="success-actions">
                            <button
                                className="btn-primary"
                                onClick={() => navigate('/login')}
                            >
                                Go to Login
                            </button>
                            <Link to="/resend-verification" className="btn-secondary">
                                Didn't receive email? Resend
                            </Link>
                        </div>

                        <div className="email-check-note">
                            <p>💡 <strong>Tips:</strong></p>
                            <ul>
                                <li>Check your spam/junk folder</li>
                                <li>Make sure you entered the correct email</li>
                                <li>The verification link expires in 24 hours</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <button
                        className="back-button"
                        onClick={() => navigate('/login')}
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className="auth-title">Create Account</h1>
                    <p className="auth-subtitle">Join the community of chess masters</p>
                </div>

                <form className="auth-form" onSubmit={handleRegister}>
                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}

                    <div className="input-group">
                        <div className="input-wrapper">
                            <User size={20} className="input-icon" />
                            <input
                                type="text"
                                className="auth-input"
                                placeholder="Username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                autoComplete="username"
                                required
                                disabled={loading}
                                minLength={3}
                            />
                        </div>
                    </div>

                    <div className="input-group">
                        <div className="input-wrapper">
                            <User size={20} className="input-icon" />
                            <input
                                type="text"
                                className="auth-input"
                                placeholder="Full Name (Optional)"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                autoComplete="name"
                                disabled={loading}
                            />
                        </div>
                    </div>

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

                    <div className="input-group">
                        <div className="input-wrapper">
                            <Lock size={20} className="input-icon" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                className="auth-input"
                                placeholder="Password"
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
                                placeholder="Confirm Password"
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
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </button>

                    <div className="auth-footer">
                        <span className="footer-text">Already have an account? </span>
                        <Link to="/login" className="footer-link">Log In</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
