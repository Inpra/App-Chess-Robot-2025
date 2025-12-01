import { useState, useEffect } from 'react';
import { ArrowLeft, User, Cpu, Bluetooth, RotateCcw, Pause, Lightbulb, Flag } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import wsService from '../services/websocketService';
import { ChessBoard, initialBoard } from '../components/chess';
import type { BoardState } from '../components/chess';
import '../styles/VsBot.css';

export default function VsBot() {
    const navigate = useNavigate();
    const location = useLocation();
    const { elo } = (location.state as any) || { elo: 1500 };
    const [isConnected, setIsConnected] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
    const [board, setBoard] = useState<BoardState>([...initialBoard]);
    const [selectedSquare, setSelectedSquare] = useState<{ row: number, col: number } | null>(null);
    const [lastMove, setLastMove] = useState<{ from: number; to: number } | null>(null);

    // WebSocket connection setup
    useEffect(() => {
        // Handle connection status changes
        const unsubscribeConnection = wsService.on('connection', (data) => {
            console.log('[VsBot] Connection status:', data);
            if (data.status === 'connected') {
                setIsConnected(true);
                setConnectionStatus('connected');
            } else if (data.status === 'disconnected') {
                setIsConnected(false);
                setConnectionStatus('disconnected');
            } else if (data.status === 'failed') {
                setIsConnected(false);
                setConnectionStatus('error');
            }
        });

        // Handle incoming messages
        const unsubscribeMessage = wsService.on('message', (data) => {
            console.log('[VsBot] Received message:', data);
            // Handle different message types here
            if (data.type === 'board_status') {
                console.log('[VsBot] Board status:', data);
            } else if (data.type === 'ai_move_executed') {
                console.log('[VsBot] AI move:', data);
            } else if (data.type === 'robot_response') {
                console.log('[VsBot] Robot response:', data);
            }
        });

        // Cleanup on unmount
        return () => {
            unsubscribeConnection();
            unsubscribeMessage();
            wsService.disconnect();
        };
    }, []);

    // Connect to server
    const handleConnect = async () => {
        if (isConnected) {
            wsService.disconnect();
            setIsConnected(false);
            setConnectionStatus('disconnected');
        } else {
            try {
                setConnectionStatus('connecting');
                await wsService.connect();
            } catch (error) {
                console.error('[VsBot] Connection failed:', error);
                setConnectionStatus('error');
                alert('Failed to connect to server. Make sure the server is running.');
            }
        }
    };

    // Handle square click
    const handleSquareClick = (row: number, col: number, index: number) => {
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
                setLastMove({ from: selectedIndex, to: index });
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

                {/* Sidebar: Controls & Info */}
                <div className="vs-bot-sidebar">
                    {/* Robot Status */}
                    <div className="vs-bot-status-card">
                        <div className="vs-bot-status-text">Server Status</div>
                        <div className="vs-bot-status-indicator">
                            <div className="vs-bot-dot" style={{ 
                                backgroundColor: connectionStatus === 'connected' ? '#10B981' : 
                                               connectionStatus === 'connecting' ? '#F59E0B' : 
                                               connectionStatus === 'error' ? '#EF4444' : '#6B7280'
                            }}></div>
                            <span style={{ color: 'var(--color-icon)' }}>
                                {connectionStatus === 'connected' ? 'Connected' : 
                                 connectionStatus === 'connecting' ? 'Connecting...' : 
                                 connectionStatus === 'error' ? 'Connection Error' : 'Disconnected'}
                            </span>
                        </div>
                    </div>

                    {/* Game Actions */}
                    <div className="vs-bot-actions-card">
                        <button
                            className="vs-bot-action-button vs-bot-primary-button"
                            onClick={handleConnect}
                            disabled={connectionStatus === 'connecting'}
                        >
                            <Bluetooth size={20} color="#FFF" />
                            <span className="vs-bot-action-button-text vs-bot-primary-button-text">
                                {connectionStatus === 'connecting' ? 'Connecting...' : 
                                 isConnected ? 'Disconnect Server' : 'Connect to Server'}
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
