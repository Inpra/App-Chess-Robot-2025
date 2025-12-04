import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Send, ArrowLeft, CheckCircle } from 'lucide-react';
import authService from '../services/authService';
import '../styles/ResendVerification.css';

export default function ResendVerification() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess(false);

        if (!email) {
            setError('Please enter your email address.');
            return;
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('Please enter a valid email address.');
            return;
        }

        setLoading(true);

        try {
            const response = await authService.resendVerification(email);

            if (response.success) {
                setSuccess(true);
                setError('');
                
                // Optionally redirect after 5 seconds
                setTimeout(() => {
                    navigate('/login');
                }, 5000);
            } else {
                setError(response.error || 'Failed to resend verification email. Please try again.');
            }
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="resend-verification-container">
            <div className="resend-verification-card">
                <div className="resend-verification-header">
                    <button 
                        className="back-button" 
                        onClick={() => navigate('/login')}
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div className="header-icon">
                        <Mail size={48} />
                    </div>
                    <h1 className="resend-verification-title">Resend Verification Email</h1>
                    <p className="resend-verification-subtitle">
                        Enter your email address to receive a new verification link
                    </p>
                </div>

                {success ? (
                    <div className="success-container">
                        <div className="success-icon">
                            <CheckCircle size={64} />
                        </div>
                        <h2 className="success-title">Email Sent!</h2>
                        <p className="success-message">
                            If the email exists in our system, a verification email has been sent.
                            Please check your inbox and spam folder.
                        </p>
                        <p className="redirect-message">
                            Redirecting to login page in 5 seconds...
                        </p>
                        <Link to="/login" className="btn-primary">
                            Back to Login
                        </Link>
                    </div>
                ) : (
                    <form className="resend-verification-form" onSubmit={handleSubmit}>
                        {error && (
                            <div className="error-message">
                                {error}
                            </div>
                        )}

                        <div className="input-group">
                            <label htmlFor="email" className="input-label">
                                Email Address
                            </label>
                            <div className="input-wrapper">
                                <Mail size={20} className="input-icon" />
                                <input
                                    id="email"
                                    type="email"
                                    className="resend-input"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    autoComplete="email"
                                    required
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <div className="spinner" />
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <Send size={20} />
                                    Send Verification Email
                                </>
                            )}
                        </button>

                        <div className="form-footer">
                            <p>
                                Already verified?{' '}
                                <Link to="/login" className="link">
                                    Login here
                                </Link>
                            </p>
                            <p>
                                Don't have an account?{' '}
                                <Link to="/register" className="link">
                                    Sign up
                                </Link>
                            </p>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
