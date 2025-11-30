import { useState } from 'react';
import { ArrowLeft, User, Cpu, Bluetooth, RotateCcw, Pause, Lightbulb, Flag } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/VsBot.css';

// Chess piece images
import chessboard from '../assets/chessboard.png';
import bp from '../assets/bp.png';
import br from '../assets/br.png';
import bn from '../assets/bn.png';
import bb from '../assets/bb.png';
import bq from '../assets/bq.png';
import bk from '../assets/bk.png';
import wp from '../assets/wp.png';
import wr from '../assets/wr.png';
import wn from '../assets/wn.png';
import wb from '../assets/wb.png';
import wq from '../assets/wq.png';
import wk from '../assets/wk.png';

// Initial board state (8x8 = 64 squares)
// null = empty, { type: 'p'|'r'|'n'|'b'|'q'|'k', color: 'w'|'b' }
const initialBoard = [
    { type: 'r', color: 'b' }, { type: 'n', color: 'b' }, { type: 'b', color: 'b' }, { type: 'q', color: 'b' }, { type: 'k', color: 'b' }, { type: 'b', color: 'b' }, { type: 'n', color: 'b' }, { type: 'r', color: 'b' },
    { type: 'p', color: 'b' }, { type: 'p', color: 'b' }, { type: 'p', color: 'b' }, { type: 'p', color: 'b' }, { type: 'p', color: 'b' }, { type: 'p', color: 'b' }, { type: 'p', color: 'b' }, { type: 'p', color: 'b' },
    null, null, null, null, null, null, null, null,
    null, null, null, null, null, null, null, null,
    null, null, null, null, null, null, null, null,
    null, null, null, null, null, null, null, null,
    { type: 'p', color: 'w' }, { type: 'p', color: 'w' }, { type: 'p', color: 'w' }, { type: 'p', color: 'w' }, { type: 'p', color: 'w' }, { type: 'p', color: 'w' }, { type: 'p', color: 'w' }, { type: 'p', color: 'w' },
    { type: 'r', color: 'w' }, { type: 'n', color: 'w' }, { type: 'b', color: 'w' }, { type: 'q', color: 'w' }, { type: 'k', color: 'w' }, { type: 'b', color: 'w' }, { type: 'n', color: 'w' }, { type: 'r', color: 'w' },
];

export default function VsBot() {
    const navigate = useNavigate();
    const location = useLocation();
    const { elo } = (location.state as any) || { elo: 1500 };
    const [isConnected, setIsConnected] = useState(false);
    const [board, setBoard] = useState(initialBoard);
    const [selectedSquare, setSelectedSquare] = useState<{ row: number, col: number } | null>(null);

    // Helper to get piece image
    const getPieceImage = (type: string, color: string) => {
        const pieceKey = `${color}${type}`;
        const pieceMap: Record<string, string> = {
            'wp': wp, 'wr': wr, 'wn': wn, 'wb': wb, 'wq': wq, 'wk': wk,
            'bp': bp, 'br': br, 'bn': bn, 'bb': bb, 'bq': bq, 'bk': bk,
        };
        return pieceMap[pieceKey];
    };

    // Handle square click
    const handleSquareClick = (row: number, col: number) => {
        const index = row * 8 + col;
        const piece = board[index];

        if (selectedSquare) {
            // Move piece (simplified - no validation)
            const selectedIndex = selectedSquare.row * 8 + selectedSquare.col;
            const selectedPiece = board[selectedIndex];

            if (selectedSquare.row === row && selectedSquare.col === col) {
                // Deselect
                setSelectedSquare(null);
            } else {
                // Make move
                const newBoard = [...board];
                newBoard[index] = selectedPiece;
                newBoard[selectedIndex] = null;
                setBoard(newBoard);
                setSelectedSquare(null);
            }
        } else if (piece) {
            // Select piece
            setSelectedSquare({ row, col });
        }
    };

    return (
        <div className="vs-bot-container">
            {/* Header */}
            <div className="vs-bot-header">
                <div onClick={() => navigate(-1)} style={{ cursor: 'pointer', padding: '8px', borderRadius: '12px', backgroundColor: '#F3F4F6' }}>
                    <ArrowLeft size={24} color="var(--color-text)" />
                </div>
                <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>Vs Robot Arm</h2>
                <div style={{ width: 40 }}></div>
            </div>

            <div className="vs-bot-content-container">
                {/* Board Section */}
                <div className="vs-bot-board-section">
                    {/* Match Header Card */}
                    <div className="vs-bot-match-header">
                        {/* You (Left) */}
                        <div className="vs-bot-player-side">
                            <div className="avatar-container">
                                <User size={20} color="#6B7280" />
                            </div>
                            <div className="vs-bot-player-details">
                                <div className="vs-bot-player-name">You</div>
                                <div className="vs-bot-player-elo">1200</div>
                            </div>
                        </div>

                        {/* Score/Status (Center) */}
                        <div className="vs-bot-score-container">
                            <div className="vs-bot-timer-pill">
                                <div className="vs-bot-timer-text">10:00</div>
                            </div>
                        </div>

                        {/* Robot (Right) */}
                        <div className="vs-bot-player-side-right">
                            <div className="avatar-container">
                                <Cpu size={16} color="#6B7280" />
                            </div>
                            <div className="vs-bot-player-details-right">
                                <div className="vs-bot-player-name">Robot</div>
                                <div className="vs-bot-player-elo">{elo || '1500'}</div>
                            </div>
                        </div>
                    </div>

                    {/* Chess Board Area */}
                    <div className="vs-bot-board-container">
                        <div className="vs-bot-board-placeholder">
                            {/* Chessboard background */}
                            <img
                                src={chessboard}
                                alt="Chessboard"
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    position: 'absolute',
                                    borderRadius: '16px'
                                }}
                            />

                            {/* Chess Pieces Overlay */}
                            <div style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                display: 'flex',
                                flexWrap: 'wrap'
                            }}>
                                {Array.from({ length: 8 }).map((_, rowIndex) => (
                                    Array.from({ length: 8 }).map((_, colIndex) => {
                                        const index = rowIndex * 8 + colIndex;
                                        const piece = board[index];
                                        const isSelected = selectedSquare?.row === rowIndex && selectedSquare?.col === colIndex;

                                        return (
                                            <div
                                                key={`${rowIndex}-${colIndex}`}
                                                onClick={() => handleSquareClick(rowIndex, colIndex)}
                                                style={{
                                                    width: '12.5%',
                                                    height: '12.5%',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    cursor: 'pointer',
                                                    backgroundColor: isSelected ? 'rgba(255, 255, 0, 0.5)' : 'transparent',
                                                }}
                                            >
                                                {piece && (
                                                    <img
                                                        src={getPieceImage(piece.type, piece.color)}
                                                        alt={`${piece.color}${piece.type}`}
                                                        style={{
                                                            width: '85%',
                                                            height: '85%',
                                                            objectFit: 'contain',
                                                            pointerEvents: 'none'
                                                        }}
                                                    />
                                                )}
                                            </div>
                                        );
                                    })
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar: Controls & Info */}
                <div className="vs-bot-sidebar">
                    {/* Robot Status */}
                    <div className="vs-bot-status-card">
                        <div className="vs-bot-status-text">Robot Status</div>
                        <div className="vs-bot-status-indicator">
                            <div className="vs-bot-dot" style={{ backgroundColor: isConnected ? '#10B981' : '#EF4444' }}></div>
                            <span style={{ color: 'var(--color-icon)' }}>{isConnected ? 'Connected' : 'Disconnected'}</span>
                        </div>
                    </div>

                    {/* Game Actions */}
                    <div className="vs-bot-actions-card">
                        <button
                            className="vs-bot-action-button vs-bot-primary-button"
                            onClick={() => setIsConnected(!isConnected)}
                        >
                            <Bluetooth size={20} color="#FFF" />
                            <span className="vs-bot-action-button-text vs-bot-primary-button-text">
                                {isConnected ? 'Disconnect Robot' : 'Connect Robot'}
                            </span>
                        </button>

                        <div className="vs-bot-action-row">
                            <button className="vs-bot-action-button" style={{ flex: 1 }}>
                                <RotateCcw size={20} color="var(--color-text)" />
                                <span className="vs-bot-action-button-text">Undo</span>
                            </button>

                            <button className="vs-bot-action-button" style={{ flex: 1 }}>
                                <Pause size={20} color="var(--color-text)" />
                                <span className="vs-bot-action-button-text">Pause</span>
                            </button>

                            <button className="vs-bot-action-button" style={{ flex: 1 }}>
                                <Lightbulb size={20} color="var(--color-text)" />
                                <span className="vs-bot-action-button-text">Hint</span>
                            </button>
                        </div>

                        <button className="vs-bot-action-button" style={{ backgroundColor: '#FEF2F2' }}>
                            <Flag size={20} color="#EF4444" />
                            <span className="vs-bot-action-button-text" style={{ color: '#EF4444' }}>Resign Game</span>
                        </button>
                    </div>

                    {/* Move History */}
                    <div className="vs-bot-history-container">
                        <div className="vs-bot-history-title">Move History</div>
                        <div className="vs-bot-history-list">
                            {[1, 2, 3].map((move) => (
                                <div key={move} className="vs-bot-history-item">
                                    <span className="vs-bot-history-move">{move}.</span>
                                    <span className="vs-bot-history-move">e4</span>
                                    <span className="vs-bot-history-move">e5</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
