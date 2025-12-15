import { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, AlertCircle, Lightbulb, DollarSign, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getMyPaymentHistory, getMyTransactions } from '../services/paymentService';
import type { PaymentHistory as PaymentHistoryType, PointTransaction } from '../services/paymentService';
import '../styles/PointsHistory.css';

export default function PointsHistory() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'payments' | 'usage'>('payments');
    const [payments, setPayments] = useState<PaymentHistoryType[]>([]);
    const [transactions, setTransactions] = useState<PointTransaction[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch data when component mounts or tab changes
    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        setError(null);

        try {
            if (activeTab === 'payments') {
                const data = await getMyPaymentHistory();
                setPayments(data);
            } else {
                const data = await getMyTransactions();
                setTransactions(data);
            }
        } catch (err: any) {
            console.error('Error fetching data:', err);
            const errorMessage = err.message || 'Unable to load data. Please try again.';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Format date to Vietnamese locale
    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('vi-VN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return dateString;
        }
    };

    // Format currency
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    // Get transaction type icon and color
    const getTransactionIcon = (type: string) => {
        switch (type) {
            case 'ai_suggestion':
                return { icon: Lightbulb, color: '#F59E0B', bgColor: '#FEF3C7' };
            case 'deposit':
                return { icon: DollarSign, color: '#10B981', bgColor: '#D1FAE5' };
            case 'adjustment':
                return { icon: Settings, color: '#6B7280', bgColor: '#F3F4F6' };
            default:
                return { icon: AlertCircle, color: '#3B82F6', bgColor: '#DBEAFE' };
        }
    };

    // Format transaction description to be more user-friendly
    const formatTransactionDescription = (item: PointTransaction): string => {
        const type = item.transactionType;
        const description = item.description || '';

        // Handle AI suggestion transactions
        if (type === 'ai_suggestion' || type === 'service_usage') {
            // New format: "AI Hint for [Game Type Name]"
            if (description.includes('AI Hint for')) {
                return description; // Already formatted correctly from backend
            }
            // Legacy format: "Gợi ý AI cho game [game-id]"
            if (description.toLowerCase().includes('game')) {
                return 'AI Hint Used in Game';
            }
            return 'AI Hint Used';
        }

        // Handle deposit transactions
        if (type === 'deposit') {
            return description || 'Points Added';
        }

        // Handle adjustment transactions
        if (type === 'adjustment') {
            return description || 'Points Adjustment';
        }

        // Default: return description or type
        return description || type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    return (
        <div className="points-history-container">
            <ToastContainer position="top-right" autoClose={3000} />

            {/* Header */}
            <div className="points-history-header">
                <div onClick={() => navigate('/profile')} style={{ cursor: 'pointer', padding: '8px', borderRadius: '12px', backgroundColor: '#F3F4F6' }}>
                    <ArrowLeft size={24} color="var(--color-text)" />
                </div>
                <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>Points History</h2>
                <div style={{ width: 40 }}></div>
            </div>

            {/* Tabs */}
            <div className="tabs-container">
                <button
                    className={`tab ${activeTab === 'payments' ? 'active-tab' : ''}`}
                    onClick={() => setActiveTab('payments')}
                >
                    <span className={`tab-text ${activeTab === 'payments' ? 'active-tab-text' : ''}`}>Payments</span>
                </button>
                <button
                    className={`tab ${activeTab === 'usage' ? 'active-tab' : ''}`}
                    onClick={() => setActiveTab('usage')}
                >
                    <span className={`tab-text ${activeTab === 'usage' ? 'active-tab-text' : ''}`}>Points Usage</span>
                </button>
            </div>

            {/* Content */}
            <div className="history-content">
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#6B7280' }}>
                        Loading...
                    </div>
                ) : error ? (
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                        <AlertCircle size={48} color="#EF4444" style={{ margin: '0 auto 16px' }} />
                        <div style={{ color: '#EF4444', marginBottom: '16px' }}>{error}</div>
                        <button
                            onClick={fetchData}
                            style={{
                                padding: '8px 16px',
                                backgroundColor: '#3B82F6',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer'
                            }}
                        >
                            Retry
                        </button>
                    </div>
                ) : activeTab === 'payments' ? (
                    <div className="list-content">
                        {payments.length > 0 ? (
                            payments.map((item) => (
                                <div key={item.id} className="history-card">
                                    <div className="card-left">
                                        <div className="icon-container" style={{
                                            backgroundColor: item.status === 'success' ? '#D1FAE5' : '#FEE2E2'
                                        }}>
                                            {item.status === 'success' ? (
                                                <CheckCircle size={24} color="#10B981" />
                                            ) : (
                                                <AlertCircle size={24} color="#EF4444" />
                                            )}
                                        </div>
                                        <div>
                                            <div className="card-title">
                                                {item.package?.name || 'Points Package'}
                                                {item.package?.points && ` (+${item.package.points} points)`}
                                            </div>
                                            <div className="card-date">{formatDate(item.createdAt)}</div>
                                        </div>
                                    </div>
                                    <div className="card-right">
                                        <div className="amount-text">{formatCurrency(item.amount)}</div>
                                        <div className="status-text" style={{
                                            color: item.status === 'success' ? '#10B981' : '#EF4444'
                                        }}>
                                            {item.status === 'success' ? 'Success' :
                                                item.status === 'pending' ? 'Pending' : 'Failed'}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="empty-text">No payment history yet.</div>
                        )}
                    </div>
                ) : (
                    <div className="list-content">
                        {transactions.length > 0 ? (
                            transactions.map((item) => {
                                const iconData = getTransactionIcon(item.transactionType);
                                const IconComponent = iconData.icon;
                                const displayDescription = formatTransactionDescription(item);

                                return (
                                    <div key={item.id} className="history-card">
                                        <div className="card-left">
                                            <div className="icon-container" style={{ backgroundColor: iconData.bgColor }}>
                                                <IconComponent size={24} color={iconData.color} />
                                            </div>
                                            <div>
                                                <div className="card-title">
                                                    {displayDescription}
                                                </div>
                                                <div className="card-date">{formatDate(item.createdAt)}</div>
                                            </div>
                                        </div>
                                        <div className="card-right">
                                            <div className="amount-text" style={{
                                                color: item.amount >= 0 ? '#10B981' : '#EF4444'
                                            }}>
                                                {item.amount >= 0 ? '+' : ''}{item.amount}
                                            </div>
                                            <div className="points-label">Points</div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="empty-text">No points usage history yet.</div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
