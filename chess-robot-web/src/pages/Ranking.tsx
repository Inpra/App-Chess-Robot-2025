import { useState, useEffect } from 'react';
import { ArrowLeft, ChevronUp, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import rankingService, { type RankingUser } from '../services/rankingService';
import '../styles/Ranking.css';

export default function Ranking() {
    const navigate = useNavigate();
    const [rankings, setRankings] = useState<RankingUser[]>([]);
    const [userRanking, setUserRanking] = useState<RankingUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchRankings();
    }, []);

    const fetchRankings = async () => {
        setLoading(true);
        setError(null);
        
        try {
            // Fetch all rankings
            const allRankings = await rankingService.getGlobalRanking(100);
            setRankings(allRankings);

            // Fetch current user's ranking
            try {
                const myRanking = await rankingService.getMyRanking();
                setUserRanking(myRanking.userRanking);
            } catch (err) {
                console.log('User not logged in or no ranking data');
            }
        } catch (err: any) {
            console.error('Error fetching rankings:', err);
            const errorMessage = err.message || 'Không thể tải bảng xếp hạng';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const topThree = rankings.slice(0, 3);
    const restOfList = rankings.slice(3);

    const getAvatarUrl = (url?: string) => {
        if (url) return url;
        return `https://ui-avatars.com/api/?name=${encodeURIComponent('User')}&background=667eea&color=fff&size=100`;
    };

    const renderPodiumItem = (item: RankingUser, displayRank: number) => {
        const isFirst = displayRank === 1;
        const size = isFirst ? 100 : 80;
        const crownColor = isFirst ? '#FFD700' : displayRank === 2 ? '#C0C0C0' : '#CD7F32';

        return (
            <div className={`podium-item ${isFirst ? 'first' : ''}`} key={item.userId}>
                <div className="avatar-wrapper">
                    <img 
                        src={getAvatarUrl(item.avatarUrl)} 
                        alt={item.fullName || item.username} 
                        className="podium-avatar" 
                        style={{ width: size, height: size }} 
                    />
                    <div className="rank-badge" style={{ backgroundColor: crownColor }}>
                        {displayRank}
                    </div>
                </div>
                <div className="podium-name">{item.fullName || item.username}</div>
                <div className="podium-elo">{item.eloRating}</div>
            </div>
        );
    };

    return (
        <div className="ranking-container">
            <ToastContainer position="top-right" autoClose={3000} />
            
            <div className="ranking-header">
                <div onClick={() => navigate('/')} style={{ cursor: 'pointer', padding: '8px' }}>
                    <ArrowLeft size={24} color="var(--color-text)" />
                </div>
                <h2 className="header-title" style={{ fontSize: '18px' }}>Bảng Xếp Hạng</h2>
                <div style={{ width: 40 }}></div>
            </div>

            {loading ? (
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    minHeight: '400px',
                    color: '#6B7280'
                }}>
                    <Loader2 size={40} className="spin" />
                </div>
            ) : error ? (
                <div style={{ 
                    padding: '40px 20px', 
                    textAlign: 'center', 
                    color: '#EF4444' 
                }}>
                    {error}
                </div>
            ) : rankings.length === 0 ? (
                <div style={{ 
                    padding: '40px 20px', 
                    textAlign: 'center', 
                    color: '#6B7280' 
                }}>
                    Chưa có dữ liệu xếp hạng
                </div>
            ) : (
                <div className="ranking-list-content">
                    <div className="podium-container">
                        {topThree.length > 1 && renderPodiumItem(topThree[1], 2)}
                        {topThree.length > 0 && renderPodiumItem(topThree[0], 1)}
                        {topThree.length > 2 && renderPodiumItem(topThree[2], 3)}
                    </div>

                    {restOfList.map((item) => (
                        <div key={item.userId} className="list-item">
                            <div className="list-rank">{item.rank}</div>
                            <img 
                                src={getAvatarUrl(item.avatarUrl)} 
                                alt={item.fullName || item.username} 
                                className="list-avatar" 
                            />
                            <div className="list-info">
                                <div className="list-name">{item.fullName || item.username}</div>
                                <div className="list-elo">{item.eloRating} ELO</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {userRanking && (
                <div className="user-rank-footer">
                    <div className="list-rank">{userRanking.rank}</div>
                    <img 
                        src={getAvatarUrl(userRanking.avatarUrl)} 
                        alt={userRanking.fullName || userRanking.username} 
                        className="list-avatar" 
                    />
                    <div className="list-info">
                        <div className="list-name">{userRanking.fullName || userRanking.username}</div>
                        <div className="list-elo">{userRanking.eloRating} ELO</div>
                    </div>
                    {userRanking.winRate > 0 && (
                        <>
                            <ChevronUp size={20} color="#10B981" />
                            <span style={{ color: '#10B981', fontWeight: '600', marginLeft: '4px' }}>
                                {userRanking.winRate.toFixed(1)}%
                            </span>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
