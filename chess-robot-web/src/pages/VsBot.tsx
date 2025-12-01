import { useState, useEffect } from 'react';
import { ArrowLeft, User, Cpu, Bluetooth, RotateCcw, Pause, Lightbulb, Flag, Play } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import wsService from '../services/websocketService';
import gameService from '../services/gameService';
import { ChessBoard, initialBoard, fenToBoard } from '../components/chess';
import type { BoardState } from '../components/chess';
import { CameraView } from '../components/camera';
import { CAMERA_CONFIG } from '../services/apiConfig';
import '../styles/VsBot.css';

export default function VsBot() {
    const navigate = useNavigate();
    const location = useLocation();
    const { elo, difficulty, difficultyName } = (location.state as any) || { elo: 1500, difficulty: 'medium', difficultyName: 'Medium' };
    const [isConnected, setIsConnected] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
    const [board, setBoard] = useState<BoardState>([...initialBoard]);
    const [selectedSquare, setSelectedSquare] = useState<{ row: number, col: number } | null>(null);
    const [lastMove, setLastMove] = useState<{ from: number; to: number } | null>(null);

    // Game state
    const [gameId, setGameId] = useState<string | null>(null);
    const [gameStatus, setGameStatus] = useState<'idle' | 'starting' | 'playing' | 'paused' | 'ended'>('idle');
    const [isStartingGame, setIsStartingGame] = useState(false);

    // Notification state
    const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'warning' | 'info', message: string } | null>(null);
    const [gameMessage, setGameMessage] = useState<string>('Waiting to start game...');
    const [boardSetupStatus, setBoardSetupStatus] = useState<'checking' | 'correct' | 'incorrect' | null>(null);

    // Auto-dismiss notification after 5 seconds
    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

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

            // Update board if FEN string is provided
            if (data.fen_str) {
                console.log('[VsBot] Updating board with FEN:', data.fen_str);
                try {
                    const newBoard = fenToBoard(data.fen_str);
                    setBoard(newBoard);
                } catch (error) {
                    console.error('[VsBot] Failed to parse FEN:', error);
                }
            }

            // Handle different message types
            if (data.type === 'board_status') {
                console.log('[VsBot] Board status:', data);
                setBoardSetupStatus(data.status === 'correct' ? 'correct' : 'incorrect');

                if (data.status === 'correct') {
                    setNotification({ type: 'success', message: '✓ Board setup correct! Starting game...' });
                    setGameMessage('Board verified - Game in progress');
                } else {
                    setNotification({ type: 'warning', message: '⚠ Please adjust pieces to match starting position' });
                    setGameMessage('Waiting for correct board setup...');
                }
            } else if (data.type === 'ai_move_executed') {
                console.log('[VsBot] AI move:', data);
                const move = data.move;
                if (move) {
                    const moveText = `${move.from_piece?.replace('_', ' ')} ${move.from} → ${move.to}`;
                    setNotification({ type: 'info', message: `🤖 Robot: ${moveText}` });
                    setGameMessage(`Robot moved: ${move.notation || moveText}`);

                    if (move.results_in_check) {
                        setTimeout(() => {
                            setNotification({ type: 'warning', message: '⚠️ Check!' });
                        }, 1000);
                    }
                }
            } else if (data.type === 'robot_response') {
                console.log('[VsBot] Robot response:', data);
                if (data.status === 'completed') {
                    setNotification({ type: 'success', message: '✓ Robot movement completed' });
                } else if (data.status === 'error') {
                    setNotification({ type: 'error', message: '✗ Robot movement failed' });
                }
            } else if (data.type === 'illegal_move') {
                console.log('[VsBot] Illegal move:', data);
                const move = data.move;
                const moveText = move ? `${move.piece} from ${move.from} to ${move.to}` : 'Unknown move';
                setNotification({ type: 'error', message: `✗ Illegal move: ${moveText}` });
                setGameMessage('Illegal move detected - please try again');
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

    // Start new game
    const handleStartGame = async () => {
        if (!isConnected) {
            alert('Please connect to server first');
            return;
        }

        try {
            setIsStartingGame(true);
            setGameStatus('starting');

            // Call API to start game
            const response = await gameService.startGame({
                gameTypeCode: 'normal_game',
                difficulty: difficulty || 'medium',
            });

            console.log('[VsBot] Game started:', response);
            setGameId(response.gameId);
            setGameStatus('playing');
            setBoardSetupStatus('checking');
            setGameMessage('Verifying board setup...');
            setNotification({ type: 'success', message: '✓ Game started! Please set up your board' });

        } catch (error: any) {
            console.error('[VsBot] Failed to start game:', error);
            setGameStatus('idle');
            alert(error.message || 'Failed to start game. Please try again.');
        } finally {
            setIsStartingGame(false);
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
            {/* Toast Notification */}
            {notification && (
                <div className={`toast-notification toast-${notification.type}`}>
                    <span>{notification.message}</span>
                    <button onClick={() => setNotification(null)} style={{ marginLeft: '12px', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: '18px' }}>×</button>
                </div>
            )}

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
                                <div className="vs-bot-player-name">Robot ({difficultyName || 'Medium'})</div>
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
                    {/* Game Status Banner */}
                    {gameStatus === 'playing' && (
                        <div className="game-status-banner" style={{
                            backgroundColor: boardSetupStatus === 'correct' ? '#D1FAE5' :
                                boardSetupStatus === 'incorrect' ? '#FEE2E2' : '#FEF3C7',
                            padding: '12px 16px',
                            borderRadius: '12px',
                            marginBottom: '16px',
                            border: `2px solid ${boardSetupStatus === 'correct' ? '#10B981' :
                                boardSetupStatus === 'incorrect' ? '#EF4444' : '#F59E0B'}`
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '16px' }}>
                                    {boardSetupStatus === 'correct' ? '✓' :
                                        boardSetupStatus === 'incorrect' ? '⚠' : '⏳'}
                                </span>
                                <span style={{
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    color: boardSetupStatus === 'correct' ? '#065F46' :
                                        boardSetupStatus === 'incorrect' ? '#991B1B' : '#92400E'
                                }}>
                                    {gameMessage}
                                </span>
                            </div>
                        </div>
                    )}

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
                            {/* Start Game Button */}
                            <button
                                className="vs-bot-action-button"
                                onClick={handleStartGame}
                                disabled={!isConnected || isStartingGame || gameStatus === 'playing'}
                                style={{
                                    flex: 1,
                                    backgroundColor: '#FFFFFF',

                                }}
                            >
                                <Play size={20} color={gameStatus === 'playing' ? '#000000ff' : '#000000ff'} />
                                <span className="vs-bot-action-button-text" style={{ color: gameStatus === 'playing' ? '#10B981' : '#050a11ff' }}>
                                    {isStartingGame ? 'Starting...' :
                                        gameStatus === 'playing' ? 'Game Active' : 'Start Game'}
                                </span>
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
