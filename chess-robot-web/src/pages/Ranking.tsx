import { useState } from 'react';
import { ArrowLeft, ChevronUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../styles/Ranking.css';

const globalRankings = [
    { id: '1', name: 'Grandmaster 1', elo: 2800, avatar: 'https://i.pravatar.cc/100?img=1' },
    { id: '2', name: 'Grandmaster 2', elo: 2750, avatar: 'https://i.pravatar.cc/100?img=2' },
    { id: '3', name: 'Grandmaster 3', elo: 2700, avatar: 'https://i.pravatar.cc/100?img=3' },
    { id: '4', name: 'Player 4', elo: 2650, avatar: 'https://i.pravatar.cc/100?img=4' },
    { id: '5', name: 'Player 5', elo: 2600, avatar: 'https://i.pravatar.cc/100?img=5' },
    { id: '6', name: 'Player 6', elo: 2550, avatar: 'https://i.pravatar.cc/100?img=6' },
    { id: '7', name: 'Player 7', elo: 2500, avatar: 'https://i.pravatar.cc/100?img=7' },
    { id: '8', name: 'Player 8', elo: 2450, avatar: 'https://i.pravatar.cc/100?img=8' },
    { id: '9', name: 'Player 9', elo: 2400, avatar: 'https://i.pravatar.cc/100?img=9' },
    { id: '10', name: 'Player 10', elo: 2350, avatar: 'https://i.pravatar.cc/100?img=10' },
];

const friendsRankings = [
    { id: '2', name: 'Grandmaster 2', elo: 2750, avatar: 'https://i.pravatar.cc/100?img=2' },
    { id: '12', name: 'My Friend 1', elo: 1600, avatar: 'https://i.pravatar.cc/100?img=12' },
    { id: 'me', name: 'You', elo: 1200, avatar: 'https://i.pravatar.cc/100?img=12' },
    { id: '13', name: 'My Friend 2', elo: 1100, avatar: 'https://i.pravatar.cc/100?img=13' },
];

export default function Ranking() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'global' | 'friends'>('global');

    const data = activeTab === 'global' ? globalRankings : friendsRankings;
    const topThree = data.slice(0, 3);
    const restOfList = data.slice(3);

    const renderPodiumItem = (item: any, rank: number) => {
        const isFirst = rank === 1;
        const size = isFirst ? 100 : 80;
        const crownColor = isFirst ? '#FFD700' : rank === 2 ? '#C0C0C0' : '#CD7F32';

        return (
            <div className={`podium-item ${isFirst ? 'first' : ''}`}>
                <div className="avatar-wrapper">
                    <img src={item.avatar} alt={item.name} className="podium-avatar" style={{ width: size, height: size }} />
                    <div className="rank-badge" style={{ backgroundColor: crownColor }}>
                        {rank}
                    </div>
                </div>
                <div className="podium-name">{item.name}</div>
                <div className="podium-elo">{item.elo}</div>
            </div>
        );
    };

    return (
        <div className="ranking-container">
            <div className="ranking-header">
                <div onClick={() => navigate('/')} style={{ cursor: 'pointer', padding: '8px' }}>
                    <ArrowLeft size={24} color="var(--color-text)" />
                </div>
                <h2 className="header-title" style={{ fontSize: '18px' }}>Leaderboard</h2>
                <div style={{ width: 40 }}></div>
            </div>

            <div className="tabs-container">
                <div
                    className={`tab ${activeTab === 'global' ? 'active' : ''}`}
                    onClick={() => setActiveTab('global')}
                >
                    <span className="tab-text">Global</span>
                </div>
                <div
                    className={`tab ${activeTab === 'friends' ? 'active' : ''}`}
                    onClick={() => setActiveTab('friends')}
                >
                    <span className="tab-text">Friends</span>
                </div>
            </div>

            <div className="ranking-list-content">
                <div className="podium-container">
                    {topThree.length > 1 && renderPodiumItem(topThree[1], 2)}
                    {topThree.length > 0 && renderPodiumItem(topThree[0], 1)}
                    {topThree.length > 2 && renderPodiumItem(topThree[2], 3)}
                </div>

                {restOfList.map((item, index) => (
                    <div key={item.id} className="list-item">
                        <div className="list-rank">{index + 4}</div>
                        <img src={item.avatar} alt={item.name} className="list-avatar" />
                        <div className="list-info">
                            <div className="list-name">{item.name}</div>
                            <div className="list-elo">{item.elo} ELO</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="user-rank-footer">
                <div className="list-rank">156</div>
                <img src="https://i.pravatar.cc/100?img=12" alt="You" className="list-avatar" />
                <div className="list-info">
                    <div className="list-name">You</div>
                    <div className="list-elo">1200 ELO</div>
                </div>
                <ChevronUp size={20} color="#10B981" />
                <span style={{ color: '#10B981', fontWeight: '600', marginLeft: '4px' }}>12</span>
            </div>
        </div>
    );
}
