import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import authService from '../services/authService';
import '../styles/Auth.css';
import BeginnerImage from '../assets/Beginner.png';
import IntermediateImage from '../assets/Intermediate.png';
import AdvancedImage from '../assets/Advanced.png';

export default function EloSelection() {
    const navigate = useNavigate();
    const [selectedElo, setSelectedElo] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const eloOptions = [
        {
            value: 800,
            title: 'Beginner',
            description: 'I know the rules but have little experience.',
            image: BeginnerImage,
            color: '#10B981'
        },
        {
            value: 1200,
            title: 'Intermediate',
            description: 'I play occasionally and know some basic tactics.',
            image: IntermediateImage,
            color: '#F59E0B'
        },
        {
            value: 1600,
            title: 'Advanced',
            description: 'I am an experienced player or have a club rating.',
            image: AdvancedImage,
            color: '#EF4444'
        }
    ];

    const handleContinue = async () => {
        if (!selectedElo) return;

        setLoading(true);
        setError('');

        try {
            const response = await authService.setInitialElo(selectedElo);

            if (response.success) {
                const user = authService.getCurrentUser();
                if (user?.id) {
                    localStorage.setItem(`initial_elo_set_${user.id}`, 'true');
                }
                navigate('/');
            } else {
                setError(response.error || 'Failed to set level');
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
                    <h1 className="auth-title">Select Your Level</h1>
                    <p className="auth-subtitle">Help us ranking you better</p>
                </div>

                {error && (
                    <div className="error-message" style={{ marginBottom: '20px' }}>
                        {error}
                    </div>
                )}

                <div className="elo-options-grid" style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '20px',
                    marginBottom: '30px'
                }}>
                    {eloOptions.map((option) => (
                        <div
                            key={option.value}
                            onClick={() => setSelectedElo(option.value)}
                            style={{
                                border: selectedElo === option.value
                                    ? `2px solid ${option.color}`
                                    : '2px solid transparent',
                                backgroundColor: selectedElo === option.value
                                    ? `${option.color}10`
                                    : '#f8fafc',
                                borderRadius: '16px',
                                padding: '24px',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                textAlign: 'center',
                                position: 'relative'
                            }}
                            className="elo-option-card"
                        >
                            {selectedElo === option.value && (
                                <div style={{
                                    position: 'absolute',
                                    top: '12px',
                                    right: '12px',
                                    color: option.color
                                }}>
                                    <CheckCircle size={24} fill={option.color} color="white" />
                                </div>
                            )}

                            <div style={{ marginBottom: '16px' }}>
                                <img
                                    src={option.image}
                                    alt={option.title}
                                    style={{
                                        width: '120px',
                                        height: '120px',
                                        objectFit: 'cover',
                                        borderRadius: '50%',
                                        border: `3px solid ${option.color}`
                                    }}
                                />
                            </div>
                            <h3 style={{
                                margin: '0 0 8px 0',
                                color: '#111827',
                                fontSize: '18px'
                            }}>
                                {option.title}
                            </h3>
                            <div style={{
                                fontSize: '24px',
                                fontWeight: 'bold',
                                color: option.color,
                                marginBottom: '12px'
                            }}>
                                {option.value}
                            </div>
                            <p style={{
                                margin: 0,
                                color: '#6B7280',
                                fontSize: '14px',
                                lineHeight: '1.4'
                            }}>
                                {option.description}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="auth-action" style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center' }}>
                    <button
                        className="auth-button"
                        onClick={handleContinue}
                        disabled={loading || !selectedElo}
                        style={{
                            opacity: !selectedElo ? 0.7 : 1,
                            maxWidth: '300px',
                            width: '100%'
                        }}
                    >
                        {loading ? 'Saving...' : 'Start Playing'}
                    </button>

                    <div style={{ textAlign: 'center', marginTop: '16px' }}>
                        <button
                            className="footer-link"
                            onClick={() => {
                                const user = authService.getCurrentUser();
                                if (user?.id) {
                                    localStorage.setItem(`initial_elo_set_${user.id}`, 'true');
                                }
                                navigate('/');
                            }}
                            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                        >
    
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
