import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Gamepad2, QrCode } from 'lucide-react';
import authService from '../services/authService';
import QRCodeLogin from '../components/QRCodeLogin';
import '../styles/Auth.css';

export default function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [loginMode, setLoginMode] = useState<'email' | 'qr'>('email');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await authService.login(email, password);

            if (response.success) {
                // Login successful, navigate to dashboard
                navigate('/');
            } else {
                setError(response.error || 'Login failed. Please try again.');
            }
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleSocialLogin = (provider: string) => {
        console.log(`Login with ${provider}`);
        // TODO: Implement social login
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <div className="auth-logo">
                        <Gamepad2 size={60} />
                    </div>
                    <h1 className="auth-title">Welcome Back!</h1>
                    <p className="auth-subtitle">Sign in to continue your chess journey</p>
                </div>

                {/* Login Mode Toggle */}
                <div className="login-mode-toggle">
                    <button
                        type="button"
                        className={`mode-button ${loginMode === 'email' ? 'active' : ''}`}
                        onClick={() => setLoginMode('email')}
                    >
                        <Mail size={18} />
                        <span>Email Login</span>
                    </button>
                    <button
                        type="button"
                        className={`mode-button ${loginMode === 'qr' ? 'active' : ''}`}
                        onClick={() => setLoginMode('qr')}
                    >
                        <QrCode size={18} />
                        <span>QR Code</span>
                    </button>
                </div>

                {loginMode === 'email' ? (
                <form className="auth-form" onSubmit={handleLogin}>
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

                    <div className="input-group">
                        <div className="input-wrapper">
                            <Lock size={20} className="input-icon" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                className="auth-input"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                autoComplete="current-password"
                                required
                                disabled={loading}
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

                    <div className="forgot-password">
                        <Link to="/forgot-password" className="forgot-link">Forgot Password?</Link>
                    </div>

                    <button type="submit" className="auth-button" disabled={loading}>
                        {loading ? 'Logging in...' : 'Log In'}
                    </button>

                    <div className="divider">
                        <span className="divider-text">Or continue with</span>
                    </div>

                    <div className="social-buttons">
                        <button
                            type="button"
                            className="social-button"
                            onClick={() => handleSocialLogin('google')}
                        >
                            <svg className="social-icon" viewBox="0 0 24 24">
                                <path fill="#DB4437" d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/>
                            </svg>
                        </button>
                        <button
                            type="button"
                            className="social-button"
                            onClick={() => handleSocialLogin('facebook')}
                        >
                            <svg className="social-icon" viewBox="0 0 24 24">
                                <path fill="#4267B2" d="M12 2.04C6.5 2.04 2 6.53 2 12.06C2 17.06 5.66 21.21 10.44 21.96V14.96H7.9V12.06H10.44V9.85C10.44 7.34 11.93 5.96 14.22 5.96C15.31 5.96 16.45 6.15 16.45 6.15V8.62H15.19C13.95 8.62 13.56 9.39 13.56 10.18V12.06H16.34L15.89 14.96H13.56V21.96A10 10 0 0 0 22 12.06C22 6.53 17.5 2.04 12 2.04Z"/>
                            </svg>
                        </button>
                        <button
                            type="button"
                            className="social-button"
                            onClick={() => handleSocialLogin('apple')}
                        >
                            <svg className="social-icon" viewBox="0 0 24 24">
                                <path fill="#000000" d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                            </svg>
                        </button>
                    </div>

                    <div className="auth-footer">
                        <span className="footer-text">Don't have an account? </span>
                        <Link to="/register" className="footer-link">Sign Up</Link>
                    </div>
                </form>
                ) : (
                    <QRCodeLogin />
                )}
            </div>
        </div>
    );
}
