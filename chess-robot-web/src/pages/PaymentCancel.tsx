import { useNavigate } from 'react-router-dom';
import { XCircle } from 'lucide-react';

export default function PaymentCancel() {
    const navigate = useNavigate();

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
                <XCircle size={64} color="#F59E0B" style={{ margin: '0 auto 24px' }} />
                
                <h2 style={{ 
                    fontSize: '24px', 
                    fontWeight: 'bold', 
                    marginBottom: '12px',
                    color: '#F59E0B'
                }}>
                    Đã hủy thanh toán
                </h2>
                
                <p style={{ 
                    color: '#6B7280', 
                    marginBottom: '32px',
                    lineHeight: '1.6'
                }}>
                    Giao dịch đã bị hủy. Bạn có thể thử lại hoặc chọn gói điểm khác.
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
                        cursor: 'pointer',
                        marginBottom: '12px',
                        transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2563EB'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3B82F6'}
                >
                    Mua điểm
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
                        cursor: 'pointer',
                        transition: 'border-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = '#D1D5DB'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = '#E5E7EB'}
                >
                    Về trang chủ
                </button>
            </div>
        </div>
    );
}
