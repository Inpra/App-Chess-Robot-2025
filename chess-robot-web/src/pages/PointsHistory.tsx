import { useState } from 'react';
import { ArrowLeft, CheckCircle, AlertCircle, Gamepad2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../styles/PointsHistory.css';

const PAYMENTS = [
    { id: '1', date: '2023-11-20', package: 'Pro Pack', amount: '100,000 VND', status: 'Success', points: '+1200' },
    { id: '2', date: '2023-11-15', package: 'Starter Pack', amount: '50,000 VND', status: 'Success', points: '+500' },
    { id: '3', date: '2023-11-10', package: 'Grandmaster Pack', amount: '200,000 VND', status: 'Failed', points: '0' },
];

const USAGE = [
    { id: '1', date: '2023-11-22', activity: 'Vs Bot (Hard)', points: '-50' },
    { id: '2', date: '2023-11-21', activity: 'Puzzle #42', points: '-10' },
    { id: '3', date: '2023-11-21', activity: 'Vs Bot (Medium)', points: '-20' },
    { id: '4', date: '2023-11-20', activity: 'Tournament Entry', points: '-100' },
];

export default function PointsHistory() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'payments' | 'usage'>('payments');

    return (
        <div className="points-history-container">
            {/* Header */}
            <div className="points-history-header">
                <div onClick={() => navigate('/purchase-points')} style={{ cursor: 'pointer', padding: '8px', borderRadius: '12px', backgroundColor: '#F3F4F6' }}>
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
                    <span className={`tab-text ${activeTab === 'usage' ? 'active-tab-text' : ''}`}>Point Usage</span>
                </button>
            </div>

            {/* Content */}
            <div className="history-content">
                {activeTab === 'payments' ? (
                    <div className="list-content">
                        {PAYMENTS.length > 0 ? (
                            PAYMENTS.map((item) => (
                                <div key={item.id} className="history-card">
                                    <div className="card-left">
                                        <div className="icon-container" style={{ backgroundColor: item.status === 'Success' ? '#D1FAE5' : '#FEE2E2' }}>
                                            {item.status === 'Success' ? (
                                                <CheckCircle size={24} color="#10B981" />
                                            ) : (
                                                <AlertCircle size={24} color="#EF4444" />
                                            )}
                                        </div>
                                        <div>
                                            <div className="card-title">{item.package}</div>
                                            <div className="card-date">{item.date}</div>
                                        </div>
                                    </div>
                                    <div className="card-right">
                                        <div className="amount-text">{item.amount}</div>
                                        <div className="status-text" style={{ color: item.status === 'Success' ? '#10B981' : '#EF4444' }}>
                                            {item.status}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="empty-text">No payment history found.</div>
                        )}
                    </div>
                ) : (
                    <div className="list-content">
                        {USAGE.length > 0 ? (
                            USAGE.map((item) => (
                                <div key={item.id} className="history-card">
                                    <div className="card-left">
                                        <div className="icon-container" style={{ backgroundColor: '#DBEAFE' }}>
                                            <Gamepad2 size={24} color="#3B82F6" />
                                        </div>
                                        <div>
                                            <div className="card-title">{item.activity}</div>
                                            <div className="card-date">{item.date}</div>
                                        </div>
                                    </div>
                                    <div className="card-right">
                                        <div className="amount-text" style={{ color: '#EF4444' }}>{item.points}</div>
                                        <div className="points-label">Points</div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="empty-text">No usage history found.</div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
