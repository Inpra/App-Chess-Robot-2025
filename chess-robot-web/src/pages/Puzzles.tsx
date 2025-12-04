import { useState, useEffect } from 'react';
import { ArrowLeft, Puzzle, ChevronRight, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import puzzleService, { type TrainingPuzzle } from '../services/puzzleService';
import '../styles/Puzzles.css';

export default function Puzzles() {
    const navigate = useNavigate();
    const [puzzles, setPuzzles] = useState<TrainingPuzzle[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');

    // Fetch puzzles on mount
    useEffect(() => {
        loadPuzzles();
    }, [filter]);

    const loadPuzzles = async () => {
        try {
            setLoading(true);
            setError(null);
            
            let data: TrainingPuzzle[];
            if (filter === 'all') {
                data = await puzzleService.getAllPuzzles();
            } else {
                data = await puzzleService.getPuzzlesByDifficulty(filter);
            }
            
            setPuzzles(data);
        } catch (err: any) {
            console.error('[Puzzles] Error loading puzzles:', err);
            setError(err.message || 'Failed to load puzzles');
        } finally {
            setLoading(false);
        }
    };

    const getDifficultyColor = (difficulty?: string) => {
        switch (difficulty?.toLowerCase()) {
            case 'easy':
                return '#10B981'; // Green
            case 'medium':
                return '#F59E0B'; // Orange
            case 'hard':
                return '#EF4444'; // Red
            default:
                return '#6B7280'; // Gray
        }
    };

    const getDifficultyLabel = (difficulty?: string) => {
        return difficulty?.charAt(0).toUpperCase() + (difficulty?.slice(1) || '');
    };

    return (
        <div className="puzzles-container">
            <div className="puzzles-header">
                <div onClick={() => navigate('/')} style={{ cursor: 'pointer', padding: '8px' }}>
                    <ArrowLeft size={24} color="var(--color-text)" />
                </div>
                <h2 className="header-title" style={{ fontSize: '18px', margin: 0 }}>Chess Puzzles</h2>
                <div 
                    onClick={loadPuzzles} 
                    style={{ cursor: 'pointer', padding: '8px' }}
                    title="Refresh"
                >
                    <RefreshCw size={20} color="var(--color-text)" />
                </div>
            </div>

            {/* Filter buttons */}
            <div style={{ padding: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {['all', 'easy', 'medium', 'hard'].map((level) => (
                    <button
                        key={level}
                        onClick={() => setFilter(level as any)}
                        style={{
                            padding: '8px 16px',
                            borderRadius: '8px',
                            border: 'none',
                            backgroundColor: filter === level ? '#3B82F6' : '#F3F4F6',
                            color: filter === level ? 'white' : '#374151',
                            fontWeight: '500',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                    </button>
                ))}
            </div>

            <div className="puzzles-list-content">
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#6B7280' }}>
                        <RefreshCw size={32} style={{ animation: 'spin 1s linear infinite' }} />
                        <p style={{ marginTop: '16px' }}>Loading puzzles...</p>
                    </div>
                ) : error ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#EF4444' }}>
                        <p>{error}</p>
                        <button
                            onClick={loadPuzzles}
                            style={{
                                marginTop: '16px',
                                padding: '8px 16px',
                                borderRadius: '8px',
                                border: 'none',
                                backgroundColor: '#3B82F6',
                                color: 'white',
                                cursor: 'pointer'
                            }}
                        >
                            Try Again
                        </button>
                    </div>
                ) : puzzles.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#6B7280' }}>
                        <Puzzle size={48} style={{ margin: '0 auto', opacity: 0.5 }} />
                        <p style={{ marginTop: '16px' }}>No puzzles found</p>
                    </div>
                ) : (
                    puzzles.map((puzzle) => (
                        <div 
                            key={puzzle.id} 
                            className="puzzle-card" 
                            onClick={() => navigate(`/puzzles/${puzzle.id}`)} 
                            style={{ cursor: 'pointer' }}
                        >
                            <div className="puzzle-icon-container">
                                <Puzzle size={24} />
                            </div>
                            <div className="puzzle-info">
                                <div className="puzzle-title">{puzzle.name}</div>
                                <div className="puzzle-meta">
                                    <span 
                                        className="puzzle-rating"
                                        style={{ 
                                            color: getDifficultyColor(puzzle.difficulty),
                                            fontWeight: '600'
                                        }}
                                    >
                                        {getDifficultyLabel(puzzle.difficulty)}
                                    </span>
                                    {puzzle.description && (
                                        <>
                                            <div className="dot" />
                                            <span className="puzzle-theme" style={{ fontSize: '12px' }}>
                                                {puzzle.description.substring(0, 50)}...
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>
                            <ChevronRight size={20} color="#9CA3AF" />
                        </div>
                    ))
                )}
            </div>

            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
