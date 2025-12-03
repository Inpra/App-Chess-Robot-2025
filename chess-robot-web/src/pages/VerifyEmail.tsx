import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Loader, Mail } from 'lucide-react';
import authService from '../services/authService';
import '../styles/VerifyEmail.css';

export default function VerifyEmail() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const verifyEmail = async () => {
            const token = searchParams.get('token');

            if (!token) {
                setStatus('error');
                setMessage('Invalid verification link. No token provided.');
                return;
            }

            try {
                const response = await authService.verifyEmail(token);

                if (response.success) {
                    setStatus('success');
                    setMessage(response.message || 'Email verified successfully! You can now login.');
                    
                    // Redirect to login after 3 seconds
                    setTimeout(() => {
                        navigate('/login');
                    }, 3000);
                } else {
                    setStatus('error');
                    setMessage(response.error || 'Email verification failed. Please try again.');
                }
            } catch (error: any) {
                setStatus('error');
                setMessage(error.message || 'An unexpected error occurred during verification.');
            }
        };

        verifyEmail();
    }, [searchParams, navigate]);

    return (
        <div className="verify-email-container">
            <div className="verify-email-card">
                <div className="verify-email-icon">
                    {status === 'loading' && (
                        <Loader size={64} className="icon-loading" />
                    )}
                    {status === 'success' && (
                        <CheckCircle size={64} className="icon-success" />
                    )}
                    {status === 'error' && (
                        <XCircle size={64} className="icon-error" />
                    )}
                </div>

                <h1 className="verify-email-title">
                    {status === 'loading' && 'Verifying Your Email...'}
                    {status === 'success' && 'Email Verified!'}
                    {status === 'error' && 'Verification Failed'}
                </h1>

                <p className="verify-email-message">{message}</p>

                <div className="verify-email-actions">
                    {status === 'success' && (
                        <p className="redirect-message">
                            Redirecting to login page in 3 seconds...
                        </p>
                    )}

                    {status === 'error' && (
                        <div className="error-actions">
                            <Link to="/resend-verification" className="btn-primary">
                                <Mail size={20} />
                                Resend Verification Email
                            </Link>
                            <Link to="/login" className="btn-secondary">
                                Back to Login
                            </Link>
                        </div>
                    )}

                    {status === 'loading' && (
                        <p className="loading-message">
                            Please wait while we verify your email address...
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
