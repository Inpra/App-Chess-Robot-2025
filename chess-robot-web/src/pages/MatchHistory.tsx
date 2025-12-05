import { useState, useEffect } from 'react';
import { ArrowLeft, User, ArrowUpDown, TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import gameService from '../services/gameService';
import authService from '../services/authService';
import '../styles/MatchHistory.css';

interface GameData {
    id: string;
    playerId?: string;
    playerName?: string;
    status?: string;
    result?: string;
    difficulty?: string;
    totalMoves?: number;
    startedAt?: string;
    endedAt?: string;
    playerRatingBefore?: number;
    playerRatingAfter?: number;
    ratingChange?: number;
    gameType?: {
        code: string;
        name: string;
    };
}

export default function MatchHistory() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [games, setGames] = useState<GameData[]>([]);
    const [playerStats, setPlayerStats] = useState({
        totalGames: 0,
        winRate: 0,
        currentElo: 0,
        wins: 0,
        losses: 0,
        draws: 0,
    });

    useEffect(() => {
        loadMatchHistory();
    }, []);

    const loadMatchHistory = async () => {
        try {
            setLoading(true);
            const currentUser = authService.getCurrentUser();
            if (!currentUser?.id) {
                navigate('/login');
                return;
            }

            // Fetch player games
            const gamesData = await gameService.getPlayerGames(currentUser.id);

            // Filter finished and paused games (show both)
            const displayGames = gamesData.filter(
                (game: GameData) => game.status === 'finished' || game.status === 'aborted' || game.status === 'paused'
            );

            setGames(displayGames);

            // Calculate statistics (only for finished games)
            const finishedGames = displayGames.filter((g: GameData) => g.status === 'finished');
            const wins = finishedGames.filter((g: GameData) => g.result?.toLowerCase() === 'win').length;
            const losses = finishedGames.filter((g: GameData) => g.result?.toLowerCase() === 'lose').length;
            const draws = finishedGames.filter((g: GameData) => g.result?.toLowerCase() === 'draw').length;
            const total = finishedGames.length;
            const winRate = total > 0 ? Math.round((wins / total) * 100) : 0;

            // Get current Elo from most recent finished game or user profile
            const latestGame = finishedGames[0];
            // prefer playerRatingAfter from latest game, otherwise try to read from current user if available
            const currentElo = latestGame?.playerRatingAfter ?? (currentUser as any)?.eloRating ?? 0;

            setPlayerStats({
                totalGames: total,
                winRate,
                currentElo,
                wins,
                losses,
                draws,
            });
        } catch (error) {
            console.error('Failed to load match history:', error);
        } finally {
            setLoading(false);
        }
    };

    const getResultColor = (result: string, status?: string) => {
        // If game is paused, show yellow/orange
        if (status === 'paused') return '#F59E0B';
        
        const lowerResult = result?.toLowerCase();
        switch (lowerResult) {
            case 'win': return '#10B981';
            case 'lose': return '#EF4444';
            case 'draw': return '#F59E0B';
            default: return 'var(--color-text)';
        }
    };

    const handleGameClick = (game: GameData) => {
        // If game is paused, navigate to VsBot to resume
        if (game.status === 'paused') {
            navigate('/game/vs-bot', { 
                state: { 
                    resumeGameId: game.id,
                    difficulty: game.difficulty || 'medium',
                    difficultyName: game.difficulty ? game.difficulty.charAt(0).toUpperCase() + game.difficulty.slice(1) : 'Medium',
                    elo: 1500
                } 
            });
        } else {
            // Otherwise, show match detail
            navigate(`/match-history/${game.id}`);
        }
    };

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return 'N/A';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
    };



    const getDifficultyDisplay = (difficulty?: string) => {
        if (!difficulty) return 'AI';
        return `AI (${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)})`;
    };

    return (
        <div className="match-history-container">
            <div className="match-history-header">
                <div className="header-content">
                    <div onClick={() => navigate('/')} style={{ cursor: 'pointer', padding: '8px', borderRadius: '12px', backgroundColor: '#F3F4F6' }}>
                        <ArrowLeft size={24} color="var(--color-text)" />
                    </div>
                    <h2 className="header-title">Match History</h2>
                    <div style={{ width: 40 }}></div>
                </div>
            </div>

            <div className="list-content">
                <div className="stats-summary">
                    <div className="summary-item">
                        <div className="summary-value">{loading ? '-' : playerStats.totalGames}</div>
                        <div className="summary-label">Total Games</div>
                    </div>
                    <div className="divider" />
                    <div className="summary-item">
                        <div className="summary-value">{loading ? '-' : `${playerStats.winRate}%`}</div>
                        <div className="summary-label">Win Rate</div>
                    </div>
                    <div className="divider" />
                    <div className="summary-item">
                        <div className="summary-value">{loading ? '-' : playerStats.currentElo}</div>
                        <div className="summary-label">Current ELO</div>
                    </div>
                </div>

                <h3 className="section-title">Recent Matches</h3>

                {loading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 0', color: 'var(--color-icon)' }}>
                        <Loader2 size={32} className="animate-spin" style={{ marginBottom: 12, animation: 'spin 1s linear infinite' }} />
                        <div>Loading history...</div>
                        <style>{`
                            @keyframes spin {
                                from { transform: rotate(0deg); }
                                to { transform: rotate(360deg); }
                            }
                        `}</style>
                    </div>
                ) : games.length === 0 ? (
                    <div className="empty-state">
                        <p>No matches found</p>
                    </div>
                ) : (
                    games.map((game) => (
                        <div key={game.id} className="match-card" onClick={() => handleGameClick(game)}>
                            <div className="match-header">
                                <div className="opponent-info">
                                    <div className="avatar-container">
                                        <User size={24} color="#9CA3AF" />
                                    </div>
                                    <div>
                                        <div className="opponent-name">{getDifficultyDisplay(game.difficulty)}</div>
                                        <div className="match-date">
                                            {formatDate(game.startedAt)}
                                        </div>
                                    </div>
                                </div>
                                <div className="result-badge" style={{ backgroundColor: getResultColor(game.result || '', game.status) + '20' }}>
                                    <span className="result-text" style={{ color: getResultColor(game.result || '', game.status) }}>
                                        {game.status === 'paused' ? '⏸️ Paused' : game.result ? game.result.charAt(0).toUpperCase() + game.result.slice(1) : 'N/A'}
                                    </span>
                                </div>
                            </div>

                            <div className="match-stats">
                                <div className="stat-item">
                                    <ArrowUpDown size={18} color="#9CA3AF" />
                                    <span className="stat-text">{game.totalMoves || 0} Moves</span>
                                </div>
                                {game.ratingChange !== undefined && game.ratingChange !== 0 && (
                                    <div className="stat-item">
                                        {game.ratingChange > 0 ? (
                                            <TrendingUp size={18} color="#10B981" />
                                        ) : (
                                            <TrendingDown size={18} color="#EF4444" />
                                        )}
                                        <span className="stat-text" style={{ color: game.ratingChange > 0 ? '#10B981' : '#EF4444' }}>
                                            {game.ratingChange > 0 ? '+' : ''}{game.ratingChange} ELO
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}