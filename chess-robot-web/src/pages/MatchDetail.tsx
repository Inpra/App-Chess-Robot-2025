import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Share2, User, Cpu, SkipBack, SkipForward } from 'lucide-react';
import { ChessBoard, initialBoard } from '../components/chess';
import '../styles/MatchDetail.css';

export default function MatchDetail() {
    // const { id } = useParams(); // Unused for now
    const navigate = useNavigate();
    const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
    const [board] = useState([...initialBoard]); // setBoard unused

    // Mock Moves
    const moves = [
        'e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6', 'Ba4', 'Nf6', 'O-O', 'Be7',
        'Re1', 'b5', 'Bb3', 'd6', 'c3', 'O-O', 'h3', 'Nb8', 'd4', 'Nbd7',
        'c4', 'c6', 'cxb5', 'axb5', 'Nc3', 'Bb7', 'Bg5', 'h6', 'Bh4', 'Re8',
    ];

    const handleNextMove = () => {
        if (currentMoveIndex < moves.length) {
            setCurrentMoveIndex(prev => prev + 1);
        }
    };

    const handlePrevMove = () => {
        if (currentMoveIndex > 0) {
            setCurrentMoveIndex(prev => prev - 1);
        }
    };

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
                            <div className="player-name">You</div>
                            <div className="player-elo">2450</div>
                        </div>
                    </div>
                    <div className="score-container">
                        <div className="score-text">1 - 0</div>
                        <div className="result-text">Win</div>
                    </div>
                    <div className="player-info">
                        <div className="avatar-container">
                            <Cpu size={20} color="#9CA3AF" />
                        </div>
                        <div>
                            <div className="player-name">Robot</div>
                            <div className="player-elo">2438</div>
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
                    </div>

                    {/* Right Column - Move List */}
                    <div className="right-column">
                        <div className="move-list-container">
                            <h3 className="move-list-title">Move List</h3>
                            <div className="move-list-scroll">
                                <div className="move-grid">
                                    {moves.map((move, index) => (
                                        <div
                                            key={index}
                                            className={`move-item ${index === currentMoveIndex - 1 ? 'active' : ''}`}
                                            onClick={() => setCurrentMoveIndex(index + 1)}
                                        >
                                            <span className="move-item-text">
                                                {index % 2 === 0 ? `${index / 2 + 1}.` : ''} {move}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Controls */}
                            <div className="controls-container">
                                <button
                                    className="control-button"
                                    onClick={handlePrevMove}
                                    disabled={currentMoveIndex === 0}
                                >
                                    <SkipBack size={24} color={currentMoveIndex === 0 ? '#D1D5DB' : 'var(--color-text)'} />
                                </button>

                                <div className="move-display">
                                    <span className="move-text">
                                        {currentMoveIndex > 0 ? `${Math.ceil(currentMoveIndex / 2)}. ${moves[currentMoveIndex - 1]}` : 'Start'}
                                    </span>
                                </div>

                                <button
                                    className="control-button"
                                    onClick={handleNextMove}
                                    disabled={currentMoveIndex === moves.length}
                                >
                                    <SkipForward size={24} color={currentMoveIndex === moves.length ? '#D1D5DB' : 'var(--color-text)'} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
