import { ArrowLeft, User, Clock, ArrowUpDown, TrendingUp, TrendingDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../styles/MatchHistory.css';

const MATCH_HISTORY = [
    {
        id: '1',
        opponent: 'Robot Arm (Level 1)',
        result: 'Win',
        date: '2023-11-23',
        time: '14:30',
        duration: '15m 20s',
        eloChange: '+12',
        moves: 34,
        avatar: 'https://i.pravatar.cc/100?img=1',
    },
    {
        id: '2',
        opponent: 'Grandmaster Bot',
        result: 'Loss',
        date: '2023-11-22',
        time: '09:15',
        duration: '22m 10s',
        eloChange: '-8',
        moves: 45,
        avatar: 'https://i.pravatar.cc/100?img=2',
    },
    {
        id: '3',
        opponent: 'Robot Arm (Level 2)',
        result: 'Draw',
        date: '2023-11-20',
        time: '18:45',
        duration: '45m 00s',
        eloChange: '+2',
        moves: 60,
        avatar: 'https://i.pravatar.cc/100?img=3',
    },
    {
        id: '4',
        opponent: 'Online Player 123',
        result: 'Win',
        date: '2023-11-18',
        time: '10:00',
        duration: '12m 05s',
        eloChange: '+15',
        moves: 28,
        avatar: 'https://i.pravatar.cc/100?img=4',
    },
    {
        id: '5',
        opponent: 'Robot Arm (Level 3)',
        result: 'Loss',
        date: '2023-11-15',
        time: '20:30',
        duration: '30m 15s',
        eloChange: '-10',
        moves: 52,
        avatar: 'https://i.pravatar.cc/100?img=5',
    },
];

export default function MatchHistory() {
    const navigate = useNavigate();

    const getResultColor = (result: string) => {
        switch (result) {
            case 'Win': return '#10B981';
            case 'Loss': return '#EF4444';
            case 'Draw': return '#F59E0B';
            default: return 'var(--color-text)';
        }
    };

    return (
        <div className="match-history-container">
            <div className="match-history-header">
                <div onClick={() => navigate('/')} style={{ cursor: 'pointer', padding: '8px', borderRadius: '12px', backgroundColor: '#F3F4F6' }}>
                    <ArrowLeft size={24} color="var(--color-text)" />
                </div>
                <h2 className="header-title">Match History</h2>
                <div style={{ width: 40 }}></div>
            </div>

            <div className="list-content">
                <div className="stats-summary">
                    <div className="summary-item">
                        <div className="summary-value">142</div>
                        <div className="summary-label">Total Games</div>
                    </div>
                    <div className="divider" />
                    <div className="summary-item">
                        <div className="summary-value">58%</div>
                        <div className="summary-label">Win Rate</div>
                    </div>
                    <div className="divider" />
                    <div className="summary-item">
                        <div className="summary-value">2450</div>
                        <div className="summary-label">Current ELO</div>
                    </div>
                </div>

                <h3 className="section-title">Recent Matches</h3>

                {MATCH_HISTORY.map((item) => (
                    <div key={item.id} className="match-card">
                        <div className="match-header">
                            <div className="opponent-info">
                                <div className="avatar-container">
                                    <User size={24} color="#9CA3AF" />
                                </div>
                                <div>
                                    <div className="opponent-name">{item.opponent}</div>
                                    <div className="match-date">{item.date} • {item.time}</div>
                                </div>
                            </div>
                            <div className="result-badge" style={{ backgroundColor: getResultColor(item.result) + '20' }}>
                                <span className="result-text" style={{ color: getResultColor(item.result) }}>{item.result}</span>
                            </div>
                        </div>

                        <div className="match-stats">
                            <div className="stat-item">
                                <Clock size={18} color="#9CA3AF" />
                                <span className="stat-text">{item.duration}</span>
                            </div>
                            <div className="stat-item">
                                <ArrowUpDown size={18} color="#9CA3AF" />
                                <span className="stat-text">{item.moves} Moves</span>
                            </div>
                            <div className="stat-item">
                                {item.eloChange.startsWith('+') ? (
                                    <TrendingUp size={18} color="#10B981" />
                                ) : (
                                    <TrendingDown size={18} color="#EF4444" />
                                )}
                                <span className="stat-text" style={{ color: item.eloChange.startsWith('+') ? '#10B981' : '#EF4444' }}>
                                    {item.eloChange} ELO
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
