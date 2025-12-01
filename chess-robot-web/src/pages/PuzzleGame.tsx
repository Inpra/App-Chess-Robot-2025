import { useState, useEffect } from 'react';
import { ArrowLeft, User, Cpu, RotateCcw, Pause, Lightbulb, Bluetooth } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChessBoard, initialBoard, fenToBoard } from '../components/chess';
import type { BoardState } from '../components/chess';
import '../styles/PuzzleGame.css';
import { CAMERA_CONFIG } from '../services/apiConfig';
import { CameraView } from '../components/camera';

const PUZZLE_FEN = "7k/6pp/8/8/8/8/Q5PP/6K1 w - - 0 1";

export default function PuzzleGame() {
    const navigate = useNavigate();
    const { id } = useParams();

    const [board, setBoard] = useState<BoardState>([]);
    const [selectedSquare, setSelectedSquare] = useState<{ row: number, col: number } | null>(null);
    const [lastMove, setLastMove] = useState<{ from: number; to: number } | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        try {
            const newBoard = fenToBoard(PUZZLE_FEN);
            setBoard(newBoard);
        } catch (e) {
            console.error("Failed to parse FEN:", e);
            setBoard([...initialBoard]);
        }
    }, []);

    const handleSquareClick = (row: number, col: number, index: number) => {
        const piece = board[index];

        if (selectedSquare) {
            // If clicking the same square, deselect
            if (selectedSquare.row === row && selectedSquare.col === col) {
                setSelectedSquare(null);
                return;
            }

            const selectedIndex = selectedSquare.row * 8 + selectedSquare.col;
            const selectedPiece = board[selectedIndex];

            // If clicking another piece of same color, select it instead
            if (piece && selectedPiece && piece.color === selectedPiece.color) {
                setSelectedSquare({ row, col });
                return;
            }

            // Move logic
            const newBoard = [...board];
            newBoard[index] = selectedPiece;
            newBoard[selectedIndex] = null;
            setBoard(newBoard);
            setLastMove({ from: selectedIndex, to: index });
            setSelectedSquare(null);

            // Check solution (Queen to h8 -> index 7)
            // We know the starting position, so we can check specific indices.
            // Queen starts at 48. Target is 7.

            if (selectedIndex === 48 && index === 7) {
                setMessage('Correct! Checkmate.');
            } else {
                setMessage('Incorrect move. Try again.');
                setTimeout(() => {
                    // Reset board
                    const resetBoard = fenToBoard(PUZZLE_FEN);
                    setBoard(resetBoard);
                    setMessage(null);
                    setLastMove(null);
                }, 1000);
            }

        } else if (piece) {
            // Select piece (only white for this puzzle)
            if (piece.color === 'w') {
                setSelectedSquare({ row, col });
            }
        }
    };

    return (
        <div className="puzzle-game-container">
            {/* Header */}
            <div className="puzzle-game-header">
                <div onClick={() => navigate('/puzzles')} style={{ cursor: 'pointer', padding: '8px', borderRadius: '12px', backgroundColor: '#F3F4F6' }}>
                    <ArrowLeft size={24} color="var(--color-text)" />
                </div>
                <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>Puzzle #{id}</h2>
                <div style={{ width: 40 }}></div>
            </div>

            <div className="puzzle-game-content">
                {/* Board Section */}
                <div className="puzzle-board-section">
                    {/* Match Header */}
                    <div className="puzzle-match-header">
                        <div className="puzzle-player-side">
                            <div className="avatar-container">
                                <Cpu size={20} color="#6B7280" />
                            </div>
                            <div className="puzzle-player-details">
                                <div className="puzzle-player-name">Puzzle Bot</div>
                                <div className="puzzle-player-elo">1200</div>
                            </div>
                        </div>

                        <div className="puzzle-score-container">
                            <div className="puzzle-timer-pill">
                                <div className="puzzle-timer-text">--:--</div>
                            </div>
                        </div>

                        <div className="puzzle-player-side-right">
                            <div className="avatar-container">
                                <User size={20} color="#6B7280" />
                            </div>
                            <div className="puzzle-player-details-right">
                                <div className="puzzle-player-name">You</div>
                                <div className="puzzle-player-elo">1200</div>
                            </div>
                        </div>
                    </div>

                    {/* Board */}
                    <div className="puzzle-board-container">
                        <ChessBoard
                            board={board}
                            selectedSquare={selectedSquare}
                            lastMove={lastMove}
                            interactive={true}
                            onSquareClick={handleSquareClick}
                            size="full"
                        />
                    </div>
                </div>

                {/* Sidebar */}
                <div className="puzzle-sidebar">
                    <div className="puzzle-sidebar-header">
                        <h3>Actions</h3>
                    </div>
                    {/* Camera View */}
                    <div style={{ height: '240px', marginBottom: '16px', borderRadius: '16px', overflow: 'hidden', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-border)' }}>
                        <CameraView
                            streamUrl={CAMERA_CONFIG.STREAM_URL}
                            title="Robot Camera"
                            allowFullscreen={true}
                            showRefresh={true}
                            onConnectionChange={(connected) => {
                                console.log('[VsBot] Camera connection status:', connected);
                            }}
                        />
                    </div>
                    {/* Feedback */}
                    {message && (
                        <div className="puzzle-feedback-card" style={{
                            backgroundColor: message.includes('Correct') ? '#D1FAE5' : '#FEE2E2',
                            color: message.includes('Correct') ? '#065F46' : '#991B1B',
                            border: `1px solid ${message.includes('Correct') ? '#10B981' : '#EF4444'}`
                        }}>
                            {message}
                        </div>
                    )}

                    {/* Status */}
                    <div className="puzzle-status-card">
                        <div className="puzzle-status-text">Robot Status</div>
                        <div className="puzzle-status-indicator">
                            <div className="puzzle-dot" style={{
                                backgroundColor: isConnected ? '#10B981' : '#EF4444'
                            }}></div>
                            <span style={{ color: 'var(--color-icon)' }}>
                                {isConnected ? 'Connected' : 'Disconnected'}
                            </span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="puzzle-actions-card">
                        <button
                            className="puzzle-action-button puzzle-primary-button"
                            onClick={() => setIsConnected(!isConnected)}
                        >
                            <Bluetooth size={20} color="#FFF" />
                            <span className="puzzle-action-button-text puzzle-primary-button-text">
                                {isConnected ? 'Disconnect Robot' : 'Connect Robot'}
                            </span>
                        </button>

                        <div className="puzzle-action-row">
                            <button className="puzzle-action-button" style={{ flex: 1 }}>
                                <RotateCcw size={20} color="var(--color-text)" />
                                <span className="puzzle-action-button-text">Undo</span>
                            </button>

                            <button className="puzzle-action-button" style={{ flex: 1 }}>
                                <Pause size={20} color="var(--color-text)" />
                                <span className="puzzle-action-button-text">Pause</span>
                            </button>

                            <button className="puzzle-action-button" style={{ flex: 1 }}>
                                <Lightbulb size={20} color="var(--color-text)" />
                                <span className="puzzle-action-button-text">Hint</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
