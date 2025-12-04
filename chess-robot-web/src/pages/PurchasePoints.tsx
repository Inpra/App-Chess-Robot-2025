import { useState, useEffect } from 'react';
import { ArrowLeft, Star, Trophy, Diamond, ShieldCheck, ArrowRight, Clock, QrCode, X, Crown, Zap, Gift, Loader2, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import '../styles/PurchasePoints.css';
import { getActivePointPackages, formatPrice, type PointPackage } from '../services/pointPackageService';
import { createPayment, checkPaymentStatus, type PaymentResponse } from '../services/paymentService';

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
    const [paymentData, setPaymentData] = useState<PaymentResponse | null>(null);
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState<'pending' | 'success' | 'failed'>('pending');
    const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);

    useEffect(() => {
        loadPackages();
    }, []);

    useEffect(() => {
        // Cleanup polling on unmount or modal close
        return () => {
            if (pollingInterval) {
                clearInterval(pollingInterval);
            }
        };
    }, [pollingInterval]);

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

    const handlePurchase = async (pkg: PackageDisplay) => {
        setSelectedPackage(pkg);
        setModalVisible(true);
        setIsProcessingPayment(true);
        setPaymentData(null);
        setPaymentStatus('pending');
        
        // Clear any existing polling
        if (pollingInterval) {
            clearInterval(pollingInterval);
            setPollingInterval(null);
        }

        try {
            // Create payment link
            console.log('Creating payment for package:', pkg.id, pkg);
            const payment = await createPayment(pkg.id);
            console.log('Payment response:', payment);
            setPaymentData(payment);
            
            // Start polling for payment status
            startPollingPaymentStatus(payment.transactionId || payment.TransactionId);
        } catch (err: any) {
            console.error('Error creating payment:', err);
            alert(err.response?.data?.error || 'Không thể tạo link thanh toán. Vui lòng đăng nhập và thử lại.');
            setModalVisible(false);
        } finally {
            setIsProcessingPayment(false);
        }
    };

    const startPollingPaymentStatus = (orderCode: string) => {
        // Poll every 3 seconds
        const interval = setInterval(async () => {
            try {
                console.log('Polling payment status for:', orderCode);
                const status = await checkPaymentStatus(orderCode);
                console.log('Payment status:', status);
                
                if (status.status === 'success' || status.Status === 'success') {
                    setPaymentStatus('success');
                    // Stop polling
                    clearInterval(interval);
                    setPollingInterval(null);
                    
                    // Auto close modal after 3 seconds
                    setTimeout(() => {
                        setModalVisible(false);
                        // Optionally reload user points or navigate
                        window.location.reload();
                    }, 3000);
                } else if (status.status === 'failed' || status.Status === 'failed') {
                    setPaymentStatus('failed');
                    clearInterval(interval);
                    setPollingInterval(null);
                }
            } catch (error) {
                console.error('Error polling payment status:', error);
            }
        }, 3000);
        
        setPollingInterval(interval);
    };

    const handlePayNow = () => {
        if (!paymentData) return;
        
        // Get orderCode from payment data
        const orderCode = paymentData.transactionId || paymentData.TransactionId;
        
        // Close modal and navigate to success page to check status
        setModalVisible(false);
        navigate(`/payment/success?orderCode=${orderCode}`);
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
                        {packages.map((pkg, index) => (
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
            {modalVisible && selectedPackage && (
                <div className="modal-overlay" onClick={() => setModalVisible(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">Thanh toán</h3>
                            <button className="close-button" onClick={() => setModalVisible(false)}>
                                <X size={20} color="#6B7280" />
                            </button>
                        </div>

                        <div className="qr-container">
                            {isProcessingPayment ? (
                                <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                                    <Loader2 size={48} color="#3B82F6" className="spinner" style={{ animation: 'spin 1s linear infinite' }} />
                                    <p style={{ marginTop: '16px', color: '#6B7280' }}>Đang tạo link thanh toán...</p>
                                </div>
                            ) : paymentData ? (
                                <>
                                    {(paymentData.qrCodeUrl || paymentData.QrCodeUrl) && (
                                        <div className="qr-image-container" style={{ 
                                            display: 'flex', 
                                            justifyContent: 'center', 
                                            alignItems: 'center',
                                            padding: '20px',
                                            backgroundColor: 'white',
                                            borderRadius: '12px'
                                        }}>
                                            <QRCodeSVG 
                                                value={paymentData.qrCodeUrl || paymentData.QrCodeUrl} 
                                                size={250}
                                                level="H"
                                                includeMargin={true}
                                            />
                                        </div>
                                    )}
                                    
                                    <div style={{ marginTop: '20px', textAlign: 'center' }}>
                                        <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
                                            {selectedPackage.name}
                                        </h4>
                                        <p style={{ color: '#6B7280', fontSize: '14px', marginBottom: '4px' }}>
                                            {new Intl.NumberFormat('vi-VN').format(selectedPackage.points)} điểm
                                        </p>
                                    </div>

                                    <div className="amount-container">
                                        <span className="amount-label">Số tiền thanh toán</span>
                                        <span className="amount-value">{formatPrice(selectedPackage.price)}</span>
                                    </div>

                                    <p className="pay-instruction">
                                        Quét mã QR bằng ứng dụng ngân hàng để thanh toán. Hệ thống sẽ tự động xác nhận và cộng điểm cho bạn.
                                    </p>

                                    {paymentStatus === 'success' ? (
                                        <div style={{
                                            marginTop: '20px',
                                            padding: '16px',
                                            backgroundColor: '#D1FAE5',
                                            borderRadius: '12px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '8px'
                                        }}>
                                            <CheckCircle size={24} color="#10B981" />
                                            <span style={{ color: '#10B981', fontWeight: '600' }}>
                                                Thanh toán thành công! Điểm đã được cộng.
                                            </span>
                                        </div>
                                    ) : paymentStatus === 'failed' ? (
                                        <div style={{
                                            marginTop: '20px',
                                            padding: '16px',
                                            backgroundColor: '#FEE2E2',
                                            borderRadius: '12px',
                                            textAlign: 'center',
                                            color: '#EF4444',
                                            fontWeight: '600'
                                        }}>
                                            Thanh toán thất bại hoặc đã bị hủy
                                        </div>
                                    ) : (
                                        <div style={{
                                            marginTop: '20px',
                                            padding: '16px',
                                            backgroundColor: '#F3F4F6',
                                            borderRadius: '12px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '8px'
                                        }}>
                                            <Loader2 size={20} color="#6B7280" style={{ animation: 'spin 1s linear infinite' }} />
                                            <span style={{ color: '#6B7280', fontSize: '14px' }}>
                                                Đang chờ thanh toán...
                                            </span>
                                        </div>
                                    )}

                                    <p style={{ 
                                        marginTop: '16px', 
                                        fontSize: '12px', 
                                        color: '#9CA3AF',
                                        textAlign: 'center'
                                    }}>
                                        Mã giao dịch: {paymentData.transactionId || paymentData.TransactionId}
                                    </p>
                                </>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                                    <p style={{ color: '#EF4444' }}>Không thể tạo link thanh toán</p>
                                    <button
                                        onClick={() => setModalVisible(false)}
                                        style={{
                                            marginTop: '16px',
                                            padding: '12px 24px',
                                            backgroundColor: '#6B7280',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '12px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Đóng
                    </button>
                </div>
            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}