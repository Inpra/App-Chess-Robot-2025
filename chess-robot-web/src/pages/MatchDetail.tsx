import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Share2, User, Cpu, Trophy, TrendingDown, Equal } from 'lucide-react';
import { ChessBoard, initialBoard, fenToBoard, INITIAL_FEN } from '../components/chess';
import ReplayControls from '../components/game/ReplayControls';
import GameStatistics from '../components/game/GameStatistics';
import MoveHistory from '../components/game/MoveHistory';
import type { Move } from '../components/game/MoveHistory';
import gameService from '../services/gameService';
import type { GameReplayResponse } from '../services/gameService';
import '../styles/MatchDetail.css';

export default function MatchDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    
    // State
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [replayData, setReplayData] = useState<GameReplayResponse | null>(null);
    const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
    const [board, setBoard] = useState([...initialBoard]);
    const [isPlaying, setIsPlaying] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    
    const playIntervalRef = useRef<number | null>(null);

    // Load replay data
    useEffect(() => {
        if (!id) {
            setError('Game ID is required');
            setLoading(false);
            return;
        }

        loadReplayData();
    }, [id]);

    const loadReplayData = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await gameService.getGameReplay(id!);
            setReplayData(data);
            
            // Initialize board with starting FEN
            const startFen = data.fenStart || INITIAL_FEN;
            const startBoard = fenToBoard(startFen);
            setBoard(startBoard);
        } catch (err: any) {
            console.error('Failed to load replay data:', err);
            setError(err.message || 'Failed to load game replay');
        } finally {
            setLoading(false);
        }
    };

    // Apply move to board
    const applyMove = useCallback((moveIndex: number) => {
        if (!replayData || moveIndex < 0 || moveIndex > replayData.moves.length) return;

        setCurrentMoveIndex(moveIndex);

        // Apply move based on index
        if (moveIndex === 0) {
            // Reset to starting position
            const startFen = replayData.fenStart || INITIAL_FEN;
            const startBoard = fenToBoard(startFen);
            setBoard(startBoard);
        } else if (moveIndex > 0 && replayData.moves[moveIndex - 1]?.fenStr) {
            // Parse FEN from move and update board
            const moveFen = replayData.moves[moveIndex - 1].fenStr;
            const newBoard = fenToBoard(moveFen);
            setBoard(newBoard);
        }
    }, [replayData]);

    // Auto-play functionality
    useEffect(() => {
        if (isPlaying && replayData) {
            playIntervalRef.current = setInterval(() => {
                setCurrentMoveIndex(prev => {
                    if (prev >= replayData.moves.length) {
                        setIsPlaying(false);
                        return prev;
                    }
                    applyMove(prev + 1);
                    return prev + 1;
                });
            }, 1000 / playbackSpeed);
        }

        return () => {
            if (playIntervalRef.current) {
                clearInterval(playIntervalRef.current);
            }
        };
    }, [isPlaying, playbackSpeed, replayData, applyMove]);

    // Control handlers
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleFirst = () => {
        setIsPlaying(false);
        applyMove(0);
    };
    const handlePrevious = () => {
        setIsPlaying(false);
        applyMove(currentMoveIndex - 1);
    };
    const handleNext = () => {
        setIsPlaying(false);
        applyMove(currentMoveIndex + 1);
    };
    const handleLast = () => {
        setIsPlaying(false);
        if (replayData) applyMove(replayData.moves.length);
    };
    const handleSpeedChange = (speed: number) => setPlaybackSpeed(speed);
    const handleMoveSelect = (moveIndex: number) => {
        setIsPlaying(false);
        applyMove(moveIndex);
    };

    // Helper to format moves for MoveHistory component
    const getFormattedMoves = useCallback((): Move[] => {
        if (!replayData) return [];
        
        const formattedMoves: Move[] = [];
        const moves = replayData.moves;
        
        for (let i = 0; i < moves.length; i += 2) {
            formattedMoves.push({
                moveNumber: Math.floor(i / 2) + 1,
                white: moves[i].notation + (moves[i].resultsInCheck ? '+' : ''),
                black: moves[i + 1] ? moves[i + 1].notation + (moves[i + 1].resultsInCheck ? '+' : '') : undefined
            });
        }
        return formattedMoves;
    }, [replayData]);

    // Get result icon
    const getResultIcon = () => {
        if (!replayData?.result) return null;
        switch (replayData.result.toLowerCase()) {
            case 'win':
                return <Trophy size={20} color="#10B981" />;
            case 'lose':
                return <TrendingDown size={20} color="#EF4444" />;
            case 'draw':
                return <Equal size={20} color="#6B7280" />;
            default:
                return null;
        }
    };

    // Get result color
    const getResultColor = () => {
        if (!replayData?.result) return '#6B7280';
        switch (replayData.result.toLowerCase()) {
            case 'win':
                return '#10B981';
            case 'lose':
                return '#EF4444';
            case 'draw':
                return '#6B7280';
            default:
                return '#6B7280';
        }
    };

    if (loading) {
        return (
            <div className="match-detail-container">
                <div className="loading-state">Loading replay...</div>
            </div>
        );
    }

    if (error || !replayData) {
        return (
            <div className="match-detail-container">
                <div className="error-state">
                    <p>{error || 'Game not found'}</p>
                    <button onClick={() => navigate(-1)} className="back-button">
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="match-detail-container">
            {/* Header */}
            <div className="match-detail-header">
                <div onClick={() => navigate(-1)} style={{ cursor: 'pointer', padding: '8px', borderRadius: '12px', backgroundColor: '#F3F4F6' }}>
                    <ArrowLeft size={24} color="var(--color-text)" />
                </div>
                <h2 className="match-detail-title">Match Replay</h2>
                <div style={{ cursor: 'pointer', padding: '8px', borderRadius: '12px', backgroundColor: '#F3F4F6' }}>
                    <Share2 size={24} color="var(--color-text)" />
                </div>
            </div>

            <div className="match-detail-content">
                {/* Match Info */}
                <div className="match-info-card">
                    <div className="player-info">
                        <div className="avatar-container">
                            <User size={20} color="#9CA3AF" />
                        </div>
                        <div>
                            <div className="player-name">{replayData.playerName || 'You'}</div>
                            <div className="player-elo">
                                {replayData.playerRatingBefore || 0}
                                {replayData.ratingChange !== undefined && replayData.ratingChange !== 0 && (
                                    <span className={`elo-change ${replayData.ratingChange > 0 ? 'positive' : 'negative'}`}>
                                        {replayData.ratingChange > 0 ? '+' : ''}{replayData.ratingChange}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="score-container">
                        {getResultIcon()}
                        <div className="result-text" style={{ color: getResultColor() }}>
                            {replayData.result?.toUpperCase() || 'N/A'}
                        </div>
                    </div>
                    <div className="player-info">
                        <div className="avatar-container">
                            <Cpu size={20} color="#9CA3AF" />
                        </div>
                        <div>
                            <div className="player-name">AI ({replayData.difficulty || 'Medium'})</div>
                            <div className="player-elo">
                                {replayData.difficulty === 'easy' ? '1200' : 
                                 replayData.difficulty === 'hard' ? '2600' : '2000'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Layout */}
                <div className="main-layout">
                    {/* Left Column - Board */}
                    <div className="left-column">
                        <div className="board-container">
                            <ChessBoard
                                board={board}
                                interactive={false}
                                size="full"
                            />
                        </div>
                        
                        {/* Replay Controls */}
                        <ReplayControls
                            isPlaying={isPlaying}
                            currentMove={currentMoveIndex}
                            totalMoves={replayData.moves.length}
                            playbackSpeed={playbackSpeed}
                            onPlay={handlePlay}
                            onPause={handlePause}
                            onFirst={handleFirst}
                            onPrevious={handlePrevious}
                            onNext={handleNext}
                            onLast={handleLast}
                            onSpeedChange={handleSpeedChange}
                            onMoveSelect={handleMoveSelect}
                        />
                    </div>

                    {/* Right Column - Move List & Statistics */}
                    <div className="right-column">
                        <MoveHistory 
                            moves={getFormattedMoves()} 
                            currentMoveIndex={currentMoveIndex}
                            onMoveClick={handleMoveSelect}
                            className="match-detail-move-history"
                        />

                        {/* Game Statistics */}
                        <GameStatistics
                            statistics={replayData.statistics}
                            durationSeconds={replayData.durationSeconds}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
