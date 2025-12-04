import { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowLeft, User, Cpu, RotateCcw, Pause, Lightbulb, Bluetooth } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChessBoard, fenToBoard } from '../components/chess';
import type { BoardState } from '../components/chess';
import '../styles/PuzzleGame.css';
import { CAMERA_CONFIG } from '../services/apiConfig';
import { CameraView } from '../components/camera';
import puzzleService, { type TrainingPuzzle } from '../services/puzzleService';
import gameService from '../services/gameService';
import { toast, ToastContainer } from 'react-toastify';
import wsService from '../services/websocketService';
import { Chess } from 'chess.js';

export default function PuzzleGame() {
    const navigate = useNavigate();
    const { id } = useParams();

    const [puzzle, setPuzzle] = useState<TrainingPuzzle | null>(null);
    const [gameId, setGameId] = useState<string | null>(null);
    const [board, setBoard] = useState<BoardState>([]);
    const [selectedSquare, setSelectedSquare] = useState<{ row: number, col: number } | null>(null);
    const [lastMove, setLastMove] = useState<{ from: number; to: number } | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
    const [loading, setLoading] = useState(true);
    const [boardSetupStatus, setBoardSetupStatus] = useState<'checking' | 'correct' | 'incorrect' | null>(null);
    
    // Chess.js instance to track game state
    const chessGame = useRef<Chess>(new Chess());
    const lastProcessedFen = useRef<string>('');
    
    // Message deduplication
    const lastMessageHash = useRef<Map<string, string>>(new Map());

    // Toast throttling
    const lastToastRef = useRef<{
        type: string;
        message: string;
        timestamp: number;
    } | null>(null);

    // Helper: Show toast with throttling
    const showToast = (type: 'success' | 'error' | 'warning' | 'info', message: string, force = false) => {
        const now = Date.now();

        if (!force && lastToastRef.current) {
            const timeSinceLastToast = now - lastToastRef.current.timestamp;
            const isSameToast = lastToastRef.current.type === type && lastToastRef.current.message === message;

            if (isSameToast && timeSinceLastToast < 3000) {
                return;
            }
        }

        lastToastRef.current = { type, message, timestamp: now };
        const toastId = `${type}-${message}`;
        const toastOptions = { toastId: toastId, autoClose: 3000 };

        switch (type) {
            case 'success':
                toast.success(message, toastOptions);
                break;
            case 'error':
                toast.error(message, toastOptions);
                break;
            case 'warning':
                toast.warning(message, toastOptions);
                break;
            case 'info':
                toast.info(message, toastOptions);
                break;
        }
    };

    // WebSocket connection setup
    useEffect(() => {
        const unsubscribeConnection = wsService.on('connection', (data) => {
            console.log('[PuzzleGame] Connection status:', data);
            if (data.status === 'connected') {
                setIsConnected(true);
                setConnectionStatus('connected');
            } else if (data.status === 'disconnected') {
                setIsConnected(false);
                setConnectionStatus('disconnected');
            } else if (data.status === 'failed') {
                setConnectionStatus('error');
            }
        });

        // Auto-connect on mount
        const autoConnect = async () => {
            if (!wsService.isConnected()) {
                try {
                    setConnectionStatus('connecting');
                    await wsService.connect();
                } catch (error) {
                    console.error('[PuzzleGame] Auto-connect failed:', error);
                    setConnectionStatus('error');
                }
            } else {
                setIsConnected(true);
                setConnectionStatus('connected');
            }
        };

        autoConnect();

        return () => {
            unsubscribeConnection();
        };
    }, []);

    // Message deduplication helper
    const computeMessageHash = (type: string, data: any): string => {
        const key = JSON.stringify({
            type,
            status: data.status,
            game_id: data.game_id,
            fen_str: data.fen_str,
            move: data.move
        });
        return key;
    };

    // Handle puzzle solution check
    const handlePuzzleSolution = useCallback((data: any) => {
        console.log('[PuzzleGame] Puzzle solution:', data);
        
        if (data.correct) {
            setMessage('✓ Correct! Well done!');
            showToast('success', '✓ Puzzle solved correctly!');
            
            setTimeout(() => {
                navigate('/puzzles');
            }, 2000);
        } else {
            setMessage('✗ Incorrect move. Try again!');
            showToast('error', '✗ That\'s not the solution');
            
            // Reset board after incorrect move
            setTimeout(() => {
                if (puzzle) {
                    const resetBoard = fenToBoard(puzzle.fenStr);
                    setBoard(resetBoard);
                    chessGame.current = new Chess(puzzle.fenStr);
                }
                setMessage(null);
                setLastMove(null);
            }, 1500);
        }
    }, [puzzle, navigate]);

    // Handle incoming WebSocket messages
    useEffect(() => {
        const unsubscribeMessage = wsService.on('message', (data) => {
            console.log('[PuzzleGame] Received message:', data);

            // Deduplicate messages
            if (data.type) {
                const hash = computeMessageHash(data.type, data);
                const lastHash = lastMessageHash.current.get(data.type);
                
                if (lastHash === hash) {
                    console.log('[PuzzleGame] Duplicate message ignored:', data.type);
                    return;
                }
                
                lastMessageHash.current.set(data.type, hash);
            }

            // Update board if FEN string is provided
            if (data.fen_str && data.fen_str !== lastProcessedFen.current) {
                try {
                    const newBoard = fenToBoard(data.fen_str);
                    setBoard(newBoard);
                    chessGame.current = new Chess(data.fen_str);
                    lastProcessedFen.current = data.fen_str;
                } catch (error) {
                    console.error('[PuzzleGame] Failed to parse FEN:', error);
                }
            }

            // Handle different message types
            if (data.type === 'board_status') {
                if (data.status === 'correct') {
                    setBoardSetupStatus('correct');
                    setMessage('✓ Board setup verified! Make your move.');
                    showToast('success', '✓ Board ready');
                } else if (data.status === 'incorrect') {
                    setBoardSetupStatus('incorrect');
                    setMessage('✗ Board setup incorrect. Please fix the position.');
                    showToast('error', '✗ Board position incorrect');
                }
            } else if (data.type === 'puzzle_solution') {
                handlePuzzleSolution(data);
            } else if (data.type === 'ai_move_executed' || data.type === 'move_detected') {
                if (data.move) {
                    setMessage(`Move: ${data.move}`);
                }
            } else if (data.type === 'robot_response') {
                if (data.message) {
                    console.log('[PuzzleGame] Robot:', data.message);
                }
            }
        });

        return () => {
            unsubscribeMessage();
        };
    }, [gameId, puzzle, handlePuzzleSolution]);

    // Load puzzle data and start game
    useEffect(() => {
        if (!id) {
            toast.error('Puzzle ID is required');
            navigate('/puzzles');
            return;
        }

        loadPuzzleAndStartGame();
    }, [id]);

    const loadPuzzleAndStartGame = async () => {
        try {
            setLoading(true);

            // 1. Load puzzle data from API
            console.log('[PuzzleGame] Loading puzzle:', id);
            const puzzleData = await puzzleService.getPuzzleById(id!);
            setPuzzle(puzzleData);

            // 2. Parse FEN and set board
            const newBoard = fenToBoard(puzzleData.fenStr);
            setBoard(newBoard);
            chessGame.current = new Chess(puzzleData.fenStr);
            lastProcessedFen.current = puzzleData.fenStr;

            // 3. Start game via API (sends command to AI)
            console.log('[PuzzleGame] Starting puzzle game...');
            const gameResponse = await gameService.startGame({
                gameTypeCode: 'training_puzzle',
                difficulty: puzzleData.difficulty || 'medium',
                puzzleId: id
            });
            
            setGameId(gameResponse.gameId);
            console.log('[PuzzleGame] Game started:', gameResponse);
            
            setBoardSetupStatus('checking');
            setMessage('Verifying board setup...');
            showToast('success', `✓ ${puzzleData.name} loaded!`);
        } catch (error: any) {
            console.error('[PuzzleGame] Error loading puzzle:', error);
            showToast('error', error.message || 'Failed to load puzzle');
            setTimeout(() => navigate('/puzzles'), 2000);
        } finally {
            setLoading(false);
        }
    };

    // Handle connect/disconnect
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
                console.error('[PuzzleGame] Connection failed:', error);
                setConnectionStatus('error');
                showToast('error', '✗ Failed to connect to robot');
            }
        }
    };

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
                    // Reset board to original puzzle position
                    if (puzzle) {
                        const resetBoard = fenToBoard(puzzle.fenStr);
                        setBoard(resetBoard);
                    }
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

    if (loading) {
        return (
            <div className="puzzle-game-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '18px', color: '#6B7280' }}>Loading puzzle...</div>
                </div>
            </div>
        );
    }

    if (!puzzle) {
        return (
            <div className="puzzle-game-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '18px', color: '#EF4444' }}>Puzzle not found</div>
                </div>
            </div>
        );
    }

    return (
        <div className="puzzle-game-container">
            {/* Toast Container */}
            <ToastContainer
                aria-label="Notifications"
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={true}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                limit={3}
            />

            {/* Header */}
            <div className="puzzle-game-header">
                <div onClick={() => navigate('/puzzles')} style={{ cursor: 'pointer', padding: '8px', borderRadius: '12px', backgroundColor: '#F3F4F6' }}>
                    <ArrowLeft size={24} color="var(--color-text)" />
                </div>
                <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>{puzzle.name}</h2>
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
                    {/* Puzzle Info */}
                    {puzzle.description && (
                        <div className="puzzle-feedback-card" style={{
                            backgroundColor: '#EFF6FF',
                            color: '#1E40AF',
                            border: '1px solid #3B82F6',
                            marginBottom: '16px'
                        }}>
                            <strong>Goal:</strong> {puzzle.description}
                        </div>
                    )}

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
                            onClick={handleConnect}
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
