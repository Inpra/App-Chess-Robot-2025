import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Loader2 } from 'lucide-react';
import { checkPaymentStatus } from '../services/paymentService';

export default function PaymentSuccess() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
    const [message, setMessage] = useState('Đang xác nhận thanh toán...');

    useEffect(() => {
        const orderCode = searchParams.get('orderCode');
        const cancel = searchParams.get('cancel');
        const status = searchParams.get('status');
        
        if (cancel === 'true' || status === 'CANCELLED') {
            setStatus('failed');
            setMessage('Thanh toán đã bị hủy');
            return;
        }
        
        if (!orderCode) {
            setStatus('failed');
            setMessage('Không tìm thấy thông tin giao dịch');
            return;
        }

        // Poll payment status from backend
        const verifyPayment = async () => {
            try {
                console.log('Checking payment status for orderCode:', orderCode);
                
                // Wait a bit for PayOS to process
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                const paymentStatus = await checkPaymentStatus(orderCode);
                console.log('Payment status response:', paymentStatus);
                
                if (paymentStatus.status === 'success' || paymentStatus.Status === 'success') {
                    setStatus('success');
                    setMessage('Thanh toán thành công! Điểm đã được cộng vào tài khoản.');
                } else if (paymentStatus.status === 'pending' || paymentStatus.Status === 'pending') {
                    setStatus('loading');
                    setMessage('Đang xác nhận thanh toán từ PayOS...');
                    // Retry after 3 seconds
                    setTimeout(() => verifyPayment(), 3000);
                } else {
                    setStatus('failed');
                    setMessage('Thanh toán thất bại hoặc đã bị hủy');
                }
            } catch (error: any) {
                console.error('Error verifying payment:', error);
                setStatus('failed');
                setMessage(error.message || 'Không thể xác minh thanh toán. Vui lòng liên hệ hỗ trợ.');
            }
        };

        verifyPayment();
    }, [searchParams]);

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--color-background)',
            padding: '20px'
        }}>
            <div style={{
                maxWidth: '400px',
                width: '100%',
                backgroundColor: 'var(--color-card)',
                borderRadius: '16px',
                padding: '40px',
                textAlign: 'center',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}>
                {status === 'loading' && (
                    <>
                        <Loader2 size={64} color="#3B82F6" className="spinner" style={{ 
                            animation: 'spin 1s linear infinite',
                            margin: '0 auto 24px'
                        }} />
                        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '12px' }}>
                            Đang xử lý
                        </h2>
                        <p style={{ color: '#6B7280', marginBottom: '32px' }}>
                            {message}
                        </p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <CheckCircle size={64} color="#10B981" style={{ margin: '0 auto 24px' }} />
                        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '12px', color: '#10B981' }}>
                            Thành công!
                        </h2>
                        <p style={{ color: '#6B7280', marginBottom: '32px' }}>
                            {message}
                        </p>
                        <button
                            onClick={() => navigate('/profile')}
                            style={{
                                width: '100%',
                                padding: '12px 24px',
                                backgroundColor: '#10B981',
                                color: 'white',
                                border: 'none',
                                borderRadius: '12px',
                                fontSize: '16px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                marginBottom: '12px'
                            }}
                        >
                            Xem thông tin tài khoản
                        </button>
                        <button
                            onClick={() => navigate('/')}
                            style={{
                                width: '100%',
                                padding: '12px 24px',
                                backgroundColor: 'transparent',
                                color: '#6B7280',
                                border: '1px solid #E5E7EB',
                                borderRadius: '12px',
                                fontSize: '16px',
                                fontWeight: '600',
                                cursor: 'pointer'
                            }}
                        >
                            Về trang chủ
                        </button>
                    </>
                )}

                {status === 'failed' && (
                    <>
                        <div style={{
                            width: '64px',
                            height: '64px',
                            margin: '0 auto 24px',
                            backgroundColor: '#FEE2E2',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <X size={32} color="#EF4444" />
                        </div>
                        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '12px', color: '#EF4444' }}>
                            Thất bại
                        </h2>
                        <p style={{ color: '#6B7280', marginBottom: '32px' }}>
                            {message}
                        </p>
                        <button
                            onClick={() => navigate('/purchase-points')}
                            style={{
                                width: '100%',
                                padding: '12px 24px',
                                backgroundColor: '#3B82F6',
                                color: 'white',
                                border: 'none',
                                borderRadius: '12px',
                                fontSize: '16px',
                                fontWeight: '600',
                                cursor: 'pointer'
                            }}
                        >
                            Thử lại
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}

function X(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
        </svg>
    );
}
