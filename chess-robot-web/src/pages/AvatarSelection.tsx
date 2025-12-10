import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, CheckCircle, ArrowRight } from 'lucide-react';
import authService from '../services/authService';
import '../styles/Auth.css';

export default function AvatarSelection() {
    const navigate = useNavigate();
    const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const avatars = [
        'https://res.cloudinary.com/dw9cr6zyk/image/upload/v1765340148/ava1_o13968.png',
        'https://res.cloudinary.com/dw9cr6zyk/image/upload/v1765340147/ava2_cmdxpn.png',
        'https://res.cloudinary.com/dw9cr6zyk/image/upload/v1765340148/ava3_z7wbrj.png',
        'https://res.cloudinary.com/dw9cr6zyk/image/upload/v1765340148/ava4_mox4cg.png'
    ];

    const handleContinue = async () => {
        if (!selectedAvatar) return;

        setLoading(true);
        setError('');

        try {
            const response = await authService.updateAvatar(selectedAvatar);

            if (response.success) {
                // Navigate to Elo selection after avatar is set
                navigate('/elo-selection');
            } else {
                setError(response.error || 'Failed to update avatar. Please try again.');
            }
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card" style={{ maxWidth: '800px' }}>
                <div className="auth-header">
                    <h1 className="auth-title">Choose Your Avatar</h1>
                    <p className="auth-subtitle">Select an avatar that represents you</p>
                </div>

                {error && (
                    <div className="error-message" style={{ marginBottom: '20px' }}>
                        {error}
                    </div>
                )}

                <div className="avatars-grid" style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                    gap: '20px',
                    marginBottom: '30px',
                    justifyContent: 'center'
                }}>
                    {avatars.map((avatar, index) => (
                        <div
                            key={index}
                            onClick={() => setSelectedAvatar(avatar)}
                            style={{
                                border: selectedAvatar === avatar
                                    ? `3px solid #3B82F6`
                                    : '3px solid transparent',
                                backgroundColor: selectedAvatar === avatar
                                    ? `#3B82F610`
                                    : '#f8fafc',
                                borderRadius: '16px',
                                padding: '20px',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                position: 'relative'
                            }}
                            className="avatar-option-card"
                        >
                            {selectedAvatar === avatar && (
                                <div style={{
                                    position: 'absolute',
                                    top: '10px',
                                    right: '10px',
                                    color: '#3B82F6'
                                }}>
                                    <CheckCircle size={24} fill="#3B82F6" color="white" />
                                </div>
                            )}

                            <div style={{
                                width: '120px',
                                height: '120px',
                                borderRadius: '50%',
                                overflow: 'hidden',
                                border: '2px solid #e5e7eb',
                                backgroundColor: 'white'
                            }}>
                                <img
                                    src={avatar}
                                    alt={`Avatar ${index + 1}`}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover'
                                    }}
                                />
                            </div>
                        </div>
                    ))}
                </div>

                <div className="auth-action" style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center' }}>
                    <button
                        className="auth-button"
                        onClick={handleContinue}
                        disabled={loading || !selectedAvatar}
                        style={{
                            opacity: !selectedAvatar ? 0.7 : 1,
                            maxWidth: '300px',
                            width: '100%',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        {loading ? 'Saving...' : (
                            <>
                                Continue to Rank Selection <ArrowRight size={20} />
                            </>
                        )}
                    </button>

                    <button
                        className="footer-link"
                        onClick={() => navigate('/elo-selection')}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            marginTop: '16px'
                        }}
                    >
                        Skip
                    </button>
                </div>
            </div>
        </div>
    );
}
