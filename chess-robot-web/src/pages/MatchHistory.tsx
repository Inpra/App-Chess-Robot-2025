import { useState, useEffect } from 'react';
import { ArrowLeft, User, ArrowUpDown, TrendingUp, TrendingDown, Loader2, Trophy, X, Minus, Pause, LayoutList } from 'lucide-react';
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
    const [statsLoading, setStatsLoading] = useState(true);
    const [games, setGames] = useState<GameData[]>([]);
    const [selectedFilter, setSelectedFilter] = useState<'all' | 'win' | 'lose' | 'draw' | 'paused'>('all');
    const [playerStats, setPlayerStats] = useState({
        totalGames: 0,
        winRate: 0,
        currentElo: 0,
        wins: 0,
        losses: 0,
        draws: 0,
    });

    useEffect(() => {
        // Load stats only once on mount
        loadPlayerStats();
    }, []);

    useEffect(() => {
        // Load games whenever filter changes
        loadFilteredGames(selectedFilter);
    }, [selectedFilter]);

    const loadPlayerStats = async () => {
        try {
            setStatsLoading(true);
            const currentUser = authService.getCurrentUser();
            if (!currentUser?.id) {
                navigate('/login');
                return;
            }

            // Fetch fresh user profile to get stats from database (accurate source of truth)
            const userProfile = await authService.getProfile();

            // Use stats from user profile (from database) - most accurate
            const totalGames = (userProfile as any)?.totalGamesPlayed || 0;
            const wins = (userProfile as any)?.wins || 0;
            const losses = (userProfile as any)?.losses || 0;
            const draws = (userProfile as any)?.draws || 0;
            const currentElo = (userProfile as any)?.eloRating || 1200;
            const winRate = totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0;

            setPlayerStats({
                totalGames,
                winRate,
                currentElo,
                wins,
                losses,
                draws,
            });
        } catch (error) {
            console.error('Failed to load player stats:', error);
        } finally {
            setStatsLoading(false);
        }
    };

    const loadFilteredGames = async (filter: 'all' | 'win' | 'lose' | 'draw' | 'paused') => {
        try {
            setLoading(true);
            const currentUser = authService.getCurrentUser();
            if (!currentUser?.id) {
                navigate('/login');
                return;
            }

            // Build filter parameters for API
            const filters: { status?: string; result?: string } = {};

            if (filter === 'all') {
                // Get all displayable games (finished, aborted, paused)
                // No API filter, will filter client-side
            } else if (filter === 'paused') {
                filters.status = 'paused';
            } else {
                // win, lose, draw filters
                filters.status = 'finished';
                filters.result = filter;
            }

            // Fetch player games with filters
            const gamesData = await gameService.getPlayerGames(currentUser.id, filters);

            // Additional client-side filter for 'all' case
            let displayGames = gamesData;
            if (filter === 'all') {
                displayGames = gamesData.filter(
                    (game: GameData) => game.status === 'finished' || game.status === 'aborted' || game.status === 'paused'
                );
            }

            setGames(displayGames);
        } catch (error) {
            console.error('Failed to load filtered games:', error);
        } finally {
            setLoading(false);
        }
    };

    const getResultColor = (result: string, status?: string) => {
        // If game is paused, show purple
        if (status === 'paused') return '#8B5CF6';

        const lowerResult = result?.toLowerCase();
        switch (lowerResult) {
            case 'win': return '#23b249';
            case 'lose': return '#EF4444';
            case 'draw': return '#1567b1';
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

    const handleFilterChange = (filter: 'all' | 'win' | 'lose' | 'draw' | 'paused') => {
        setSelectedFilter(filter);
        // Games will be fetched by useEffect when selectedFilter changes
        // Stats remain unchanged
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
                        <div className="summary-value">{statsLoading ? '-' : playerStats.totalGames}</div>
                        <div className="summary-label">Total Games</div>
                    </div>
                    <div className="divider" />
                    <div className="summary-item">
                        <div className="summary-value">{statsLoading ? '-' : `${playerStats.winRate}%`}</div>
                        <div className="summary-label">Win Rate</div>
                    </div>
                    <div className="divider" />
                    <div className="summary-item">
                        <div className="summary-value">{statsLoading ? '-' : playerStats.currentElo}</div>
                        <div className="summary-label">Current ELO</div>
                    </div>
                </div>

                <div style={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 20,
                    backgroundColor: 'var(--color-background)',
                    paddingTop: 10,
                    paddingBottom: 10,
                    marginBottom: 10
                }}>
                    <h3 className="section-title" style={{ marginBottom: 12 }}>Recent Matches</h3>

                    {/* Filter Tabs */}
                    <div style={{
                        display: 'flex',
                        gap: 8,
                        overflowX: 'auto',
                        paddingBottom: 4
                    }}>
                        <button
                            onClick={() => handleFilterChange('all')}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6,
                                padding: '10px 18px',
                                borderRadius: 20,
                                border: 'none',
                                backgroundColor: selectedFilter === 'all' ? 'var(--color-primary)' : '#F3F4F6',
                                color: selectedFilter === 'all' ? 'white' : 'var(--color-text)',
                                fontWeight: 600,
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                                transition: 'all 0.2s',
                                fontSize: '14px'
                            }}
                        >
                            <LayoutList size={16} color={selectedFilter === 'all' ? 'white' : 'var(--color-text)'} />
                            All
                        </button>
                        <button
                            onClick={() => handleFilterChange('win')}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6,
                                padding: '10px 18px',
                                borderRadius: 20,
                                border: 'none',
                                backgroundColor: selectedFilter === 'win' ? '#23b249' : '#F3F4F6',
                                color: selectedFilter === 'win' ? 'white' : 'var(--color-text)',
                                fontWeight: 600,
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                                transition: 'all 0.2s',
                                fontSize: '14px'
                            }}
                        >
                            <Trophy size={16} color={selectedFilter === 'win' ? 'white' : '#23b249'} />
                            Win
                        </button>
                        <button
                            onClick={() => handleFilterChange('lose')}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6,
                                padding: '10px 18px',
                                borderRadius: 20,
                                border: 'none',
                                backgroundColor: selectedFilter === 'lose' ? '#EF4444' : '#F3F4F6',
                                color: selectedFilter === 'lose' ? 'white' : 'var(--color-text)',
                                fontWeight: 600,
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                                transition: 'all 0.2s',
                                fontSize: '14px'
                            }}
                        >
                            <X size={16} color={selectedFilter === 'lose' ? 'white' : '#EF4444'} />
                            Lose
                        </button>
                        <button
                            onClick={() => handleFilterChange('draw')}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6,
                                padding: '10px 18px',
                                borderRadius: 20,
                                border: 'none',
                                backgroundColor: selectedFilter === 'draw' ? '#1567b1' : '#F3F4F6',
                                color: selectedFilter === 'draw' ? 'white' : 'var(--color-text)',
                                fontWeight: 600,
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                                transition: 'all 0.2s',
                                fontSize: '14px'
                            }}
                        >
                            <Minus size={16} color={selectedFilter === 'draw' ? 'white' : '#1567b1'} />
                            Draw
                        </button>
                        <button
                            onClick={() => handleFilterChange('paused')}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6,
                                padding: '10px 18px',
                                borderRadius: 20,
                                border: 'none',
                                backgroundColor: selectedFilter === 'paused' ? '#8B5CF6' : '#F3F4F6',
                                color: selectedFilter === 'paused' ? 'white' : 'var(--color-text)',
                                fontWeight: 600,
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                                transition: 'all 0.2s',
                                fontSize: '14px'
                            }}
                        >
                            <Pause size={16} color={selectedFilter === 'paused' ? 'white' : '#8B5CF6'} />
                            Paused
                        </button>
                    </div>
                </div>

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
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    {/* Game Type Badge */}
                                    {game.gameType && (
                                        <div style={{
                                            padding: '6px 12px',
                                            borderRadius: 16,
                                            backgroundColor: game.gameType.code === 'training_puzzle' ? '#EDE9FE' : '#e8f0fe',
                                            border: `1px solid ${game.gameType.code === 'training_puzzle' ? '#A78BFA' : '#1567b1'}`,
                                            fontSize: '12px',
                                            fontWeight: 600,
                                            color: game.gameType.code === 'training_puzzle' ? '#7C3AED' : '#1567b1',
                                            whiteSpace: 'nowrap'
                                        }}>
                                            {game.gameType.name}
                                        </div>
                                    )}
                                    {/* Result Badge */}
                                    <div className="result-badge" style={{ backgroundColor: getResultColor(game.result || '', game.status) + '20', display: 'flex', alignItems: 'center', gap: 4 }}>
                                        {game.status === 'paused' ? (
                                            <>
                                                <Pause size={14} color="#8B5CF6" />
                                                <span className="result-text" style={{ color: '#8B5CF6' }}>Paused</span>
                                            </>
                                        ) : (
                                            <span className="result-text" style={{ color: getResultColor(game.result || '', game.status) }}>
                                                {game.result ? game.result.charAt(0).toUpperCase() + game.result.slice(1) : 'N/A'}
                                            </span>
                                        )}
                                    </div>
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
                                            <TrendingUp size={18} color="#23b249" />
                                        ) : (
                                            <TrendingDown size={18} color="#EF4444" />
                                        )}
                                        <span className="stat-text" style={{ color: game.ratingChange > 0 ? '#23b249' : '#EF4444' }}>
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