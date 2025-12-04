import { useState, useEffect } from 'react';
import { ArrowLeft, Star, Trophy, Diamond, ShieldCheck, ArrowRight, Clock, QrCode, X, Crown, Zap, Gift } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../styles/PurchasePoints.css';
import { getActivePointPackages, formatPrice, type PointPackage } from '../services/pointPackageService';

// Package display configuration
interface PackageDisplay extends PointPackage {
    color: string;
    accent: string;
    popular: boolean;
    icon: string;
}

const PACKAGE_STYLES = [
    { color: '#10B981', accent: '#D1FAE5', icon: 'star' },
    { color: '#3B82F6', accent: '#DBEAFE', icon: 'trophy' },
    { color: '#8B5CF6', accent: '#EDE9FE', icon: 'diamond' },
    { color: '#F59E0B', accent: '#FEF3C7', icon: 'crown' },
    { color: '#EF4444', accent: '#FEE2E2', icon: 'zap' },
    { color: '#EC4899', accent: '#FCE7F3', icon: 'gift' },
];

export default function PurchasePoints() {
    const navigate = useNavigate();
    const [packages, setPackages] = useState<PackageDisplay[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedPackage, setSelectedPackage] = useState<PackageDisplay | null>(null);
    const [modalVisible, setModalVisible] = useState(false);

    useEffect(() => {
        loadPackages();
    }, []);

    const loadPackages = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getActivePointPackages();
            
            // Transform API data to display format
            const displayPackages: PackageDisplay[] = data.map((pkg, index) => {
                const style = PACKAGE_STYLES[index % PACKAGE_STYLES.length];
                // Mark the middle package as popular if there are 3 or more packages
                const isPopular = data.length >= 3 && index === Math.floor(data.length / 2);
                
                return {
                    ...pkg,
                    color: style.color,
                    accent: style.accent,
                    icon: style.icon,
                    popular: isPopular,
                };
            });
            
            setPackages(displayPackages);
        } catch (err) {
            console.error('Error loading packages:', err);
            setError('Không thể tải danh sách gói điểm. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };

    const handlePurchase = (pkg: PackageDisplay) => {
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
            case 'crown':
                return <Crown size={size} color={color} />;
            case 'zap':
                return <Zap size={size} color={color} />;
            case 'gift':
                return <Gift size={size} color={color} />;
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

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                        <p style={{ color: 'var(--color-text-secondary)' }}>Đang tải gói điểm...</p>
                    </div>
                ) : error ? (
                    <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                        <p style={{ color: '#EF4444', marginBottom: '16px' }}>{error}</p>
                        <button 
                            onClick={loadPackages}
                            style={{
                                padding: '12px 24px',
                                backgroundColor: 'var(--color-primary)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '12px',
                                cursor: 'pointer',
                                fontWeight: '500',
                            }}
                        >
                            Thử lại
                        </button>
                    </div>
                ) : packages.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                        <p style={{ color: 'var(--color-text-secondary)' }}>Hiện chưa có gói điểm nào.</p>
                    </div>
                ) : (
                    <div className="cards-container">
                        {packages.map((pkg) => (
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
                                        <div className="points-value" style={{ color: pkg.color }}>
                                            {new Intl.NumberFormat('vi-VN').format(pkg.points)}
                                        </div>
                                        <div className="points-label">Points</div>
                                    </div>
                                </div>

                                <div className="card-body">
                                    <h3 className="package-name">{pkg.name}</h3>
                                    <p className="package-description">
                                        {pkg.description || 'Nạp điểm để sử dụng các tính năng cao cấp'}
                                    </p>
                                </div>

                                <div className="card-footer">
                                    <div className="price-button" style={{ backgroundColor: pkg.color }}>
                                        <span className="price-text">{formatPrice(pkg.price)}</span>
                                        <ArrowRight size={16} color="white" style={{ marginLeft: '8px' }} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

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
                                <span className="amount-value">{formatPrice(selectedPackage?.price || 0)}</span>
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
