import { useState } from 'react';
import { ArrowLeft, Star, Trophy, Diamond, ShieldCheck, ArrowRight, Clock, QrCode, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../styles/PurchasePoints.css';

const PACKAGES = [
    {
        id: '1',
        name: 'Starter Pack',
        points: 500,
        price: '50,000 VND',
        color: '#10B981',
        accent: '#D1FAE5',
        description: 'Perfect for beginners to start their journey.',
        popular: false,
        icon: 'star',
    },
    {
        id: '2',
        name: 'Pro Pack',
        points: 1200,
        price: '100,000 VND',
        color: '#3B82F6',
        accent: '#DBEAFE',
        description: 'Best value for regular players.',
        popular: true,
        icon: 'trophy',
    },
    {
        id: '3',
        name: 'Grandmaster Pack',
        points: 3000,
        price: '200,000 VND',
        color: '#8B5CF6',
        accent: '#EDE9FE',
        description: 'For the serious competitors who want it all.',
        popular: false,
        icon: 'diamond',
    },
];

export default function PurchasePoints() {
    const navigate = useNavigate();
    const [selectedPackage, setSelectedPackage] = useState<typeof PACKAGES[0] | null>(null);
    const [modalVisible, setModalVisible] = useState(false);

    const handlePurchase = (pkg: typeof PACKAGES[0]) => {
        setSelectedPackage(pkg);
        setModalVisible(true);
    };

    const getIcon = (iconName: string, size: number, color: string) => {
        switch (iconName) {
            case 'star':
                return <Star size={size} color={color} />;
            case 'trophy':
                return <Trophy size={size} color={color} />;
            case 'diamond':
                return <Diamond size={size} color={color} />;
            default:
                return <Star size={size} color={color} />;
        }
    };

    return (
        <div className="purchase-points-container">
            {/* Header */}
            <div className="purchase-points-header">
                <div onClick={() => navigate('/')} style={{ cursor: 'pointer', padding: '8px', borderRadius: '12px', backgroundColor: '#F3F4F6' }}>
                    <ArrowLeft size={24} color="var(--color-text)" />
                </div>
                <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>Store</h2>
                <div onClick={() => navigate('/points-history')} style={{ cursor: 'pointer', padding: '8px' }}>
                    <Clock size={24} color="var(--color-text)" />
                </div>
            </div>

            <div className="purchase-points-content">
                <div className="hero-section">
                    <h1 className="hero-title">Top Up Points</h1>
                    <p className="hero-subtitle">Unlock premium features and join tournaments.</p>
                </div>

                <div className="cards-container">
                    {PACKAGES.map((pkg) => (
                        <div
                            key={pkg.id}
                            className={`package-card ${pkg.popular ? 'popular-card' : ''}`}
                            style={{ borderColor: pkg.popular ? pkg.color : 'transparent' }}
                            onClick={() => handlePurchase(pkg)}
                        >
                            {pkg.popular && (
                                <div className="popular-tag" style={{ backgroundColor: pkg.color }}>
                                    <span className="popular-text">MOST POPULAR</span>
                                </div>
                            )}

                            <div className="card-header">
                                <div className="icon-container" style={{ backgroundColor: pkg.accent }}>
                                    {getIcon(pkg.icon, 28, pkg.color)}
                                </div>
                                <div className="points-container">
                                    <div className="points-value" style={{ color: pkg.color }}>{pkg.points}</div>
                                    <div className="points-label">Points</div>
                                </div>
                            </div>

                            <div className="card-body">
                                <h3 className="package-name">{pkg.name}</h3>
                                <p className="package-description">{pkg.description}</p>
                            </div>

                            <div className="card-footer">
                                <div className="price-button" style={{ backgroundColor: pkg.color }}>
                                    <span className="price-text">{pkg.price}</span>
                                    <ArrowRight size={16} color="white" style={{ marginLeft: '8px' }} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="footer-note">
                    <ShieldCheck size={16} color="#9CA3AF" />
                    <span className="footer-note-text">Secure payment via PayOS</span>
                </div>
            </div>

            {/* Payment Modal */}
            {modalVisible && (
                <div className="modal-overlay" onClick={() => setModalVisible(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">Scan to Pay</h3>
                            <button className="close-button" onClick={() => setModalVisible(false)}>
                                <X size={20} color="#6B7280" />
                            </button>
                        </div>

                        <div className="qr-container">
                            <div className="qr-placeholder">
                                <QrCode size={120} color="#1F2937" />
                            </div>
                            <p className="pay-instruction">Open your banking app and scan the QR code to complete payment.</p>

                            <div className="amount-container">
                                <span className="amount-label">Total Amount</span>
                                <span className="amount-value">{selectedPackage?.price}</span>
                            </div>
                        </div>

                        <button
                            className="done-button"
                            style={{ backgroundColor: selectedPackage?.color || 'var(--color-primary)' }}
                            onClick={() => setModalVisible(false)}
                        >
                            I have paid
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
