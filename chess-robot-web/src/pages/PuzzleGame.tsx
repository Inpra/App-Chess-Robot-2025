import { useState, useEffect, useCallback, useRef } from 'react';
import { RotateCcw, Pause, Lightbulb, Bluetooth, Play, ChevronDown, ChevronUp } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { Chess } from 'chess.js';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ChessBoard, fenToBoard } from '../components/chess';
import type { BoardState } from '../components/chess';
import { CameraView } from '../components/camera';
import {
    GameHeader,
    MatchHeader,
    ServerStatusCard,
    MoveHistory,
    GameOverModal
} from '../components/game';
import type { Move } from '../components/game';
import puzzleService, { type TrainingPuzzle } from '../services/puzzleService';
import gameService from '../services/gameService';
import wsService from '../services/websocketService';
import { CAMERA_CONFIG } from '../services/apiConfig';
import '../styles/PuzzleGame.css';

export default function PuzzleGame() {
    const navigate = useNavigate();
    const { id } = useParams();

    const [puzzle, setPuzzle] = useState<TrainingPuzzle | null>(null);
    const [gameId, setGameId] = useState<string | null>(null);
    const [board, setBoard] = useState<BoardState>([]);
    const [selectedSquare, setSelectedSquare] = useState<{ row: number, col: number } | null>(null);
    const [lastMove, setLastMove] = useState<{ from: number; to: number } | null>(null);
    const [checkSquare, setCheckSquare] = useState<{ row: number, col: number } | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
    const [loading, setLoading] = useState(true);
    const [boardSetupStatus, setBoardSetupStatus] = useState<'checking' | 'correct' | 'incorrect' | null>(null);

    // Game state
    const [gameStatus, setGameStatus] = useState<'idle' | 'starting' | 'playing' | 'paused' | 'ended'>('idle');
    const [isStartingGame, setIsStartingGame] = useState(false);

    // UI state
    const [isGoalExpanded, setIsGoalExpanded] = useState(true);

    // Move history state
    const [moveHistory, setMoveHistory] = useState<Move[]>([]);

    // Game over modal state
    const [gameOverModal, setGameOverModal] = useState<{
        isOpen: boolean;
        result: 'win' | 'lose' | 'draw';
        reason: string;
        message: string;
    }>({
        isOpen: false,
        result: 'draw',
        reason: '',
        message: ''
    });

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

    // Helper to update check square
    const updateCheckSquare = () => {
        if (chessGame.current.inCheck()) {
            const turn = chessGame.current.turn();
            const board = chessGame.current.board();
            for (let row = 0; row < 8; row++) {
                for (let col = 0; col < 8; col++) {
                    const piece = board[row][col];
                    if (piece && piece.type === 'k' && piece.color === turn) {
                        setCheckSquare({ row, col });
                        return;
                    }
                }
            }
        } else {
            setCheckSquare(null);
        }
    };

    // Handle puzzle solution check
    const handlePuzzleSolution = useCallback((data: any) => {
        console.log('[PuzzleGame] Puzzle solution:', data);

        if (data.correct) {
            setMessage('✓ Correct! Well done!');
            showToast('success', '✓ Puzzle solved correctly!');

            // Show game over modal
            setGameOverModal({
                isOpen: true,
                result: 'win',
                reason: 'Puzzle Solved',
                message: 'Congratulations! You solved the puzzle!'
            });

            setTimeout(() => {
                navigate('/puzzles');
            }, 3000);
        } else {
            setMessage('✗ Incorrect move. Try again!');
            showToast('error', '✗ That\'s not the solution');

            // Reset board after incorrect move
            setTimeout(() => {
                if (puzzle) {
                    const resetBoard = fenToBoard(puzzle.fenStr);
                    setBoard(resetBoard);
                    chessGame.current = new Chess(puzzle.fenStr);
                    updateCheckSquare();
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

    // Load puzzle data on mount (don't start game yet)
    useEffect(() => {
        if (!id) {
            toast.error('Puzzle ID is required');
            navigate('/puzzles');
            return;
        }

        loadPuzzleData();
    }, [id]);

    // Load puzzle data only (no API call to start game)
    const loadPuzzleData = async () => {
        try {
            setLoading(true);

            console.log('[PuzzleGame] Loading puzzle:', id);
            const puzzleData = await puzzleService.getPuzzleById(id!);
            setPuzzle(puzzleData);

            // Parse FEN and set board
            const newBoard = fenToBoard(puzzleData.fenStr);
            setBoard(newBoard);
            chessGame.current = new Chess(puzzleData.fenStr);
            lastProcessedFen.current = puzzleData.fenStr;

            setMessage('Please arrange the board as shown on screen to start.');
            showToast('info', 'ℹ️ Please setup the board to match the puzzle position');
            console.log('[PuzzleGame] ✓ Puzzle loaded:', puzzleData.name);
        } catch (error: any) {
            console.error('[PuzzleGame] Error loading puzzle:', error);
            showToast('error', error.message || 'Failed to load puzzle');
            setTimeout(() => navigate('/puzzles'), 2000);
        } finally {
            setLoading(false);
        }
    };

    // Start game (call API to start game with robot)
    const handleStartGame = async () => {
        if (!isConnected) {
            alert('Please connect to server first');
            return;
        }

        if (!puzzle) {
            alert('Puzzle not loaded');
            return;
        }

        try {
            setIsStartingGame(true);
            setGameStatus('starting');

            // Reset game state
            setMoveHistory([]);
            chessGame.current = new Chess(puzzle.fenStr);
            lastProcessedFen.current = puzzle.fenStr;
            setCheckSquare(null);

            // Call API to start game
            console.log('[PuzzleGame] Starting puzzle game...');
            const gameResponse = await gameService.startGame({
                gameTypeCode: 'training_puzzle',
                difficulty: puzzle.difficulty || 'medium',
                puzzleId: id
            });

            setGameId(gameResponse.gameId);
            setGameStatus('playing');
            setBoardSetupStatus('checking');
            setMessage('Verifying board setup...');
            showToast('success', '✓ Game started! Please set up your board');
            console.log('[PuzzleGame] ✓ Game started:', gameResponse);

        } catch (error: any) {
            console.error('[PuzzleGame] Failed to start game:', error);
            setGameStatus('idle');
            showToast('error', error.message || 'Failed to start game. Please try again.');
        } finally {
            setIsStartingGame(false);
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

    // Remove early return for loading
    // if (loading) { ... }

    if (!puzzle && !loading) {
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

            {/* Game Over Modal */}
            <GameOverModal
                isOpen={gameOverModal.isOpen}
                result={gameOverModal.result}
                reason={gameOverModal.reason}
                message={gameOverModal.message}
                onClose={() => navigate('/puzzles')}
            />

            {/* Header */}
            <GameHeader
                onBack={() => navigate('/puzzles')}
                title={puzzle?.name || 'Loading Puzzle...'}
            />

            <div className="puzzle-game-content">
                {/* Board Section */}
                <div className="puzzle-board-section">
                    {/* Match Header */}
                    <MatchHeader
                        userElo={1200}
                        robotElo={1200}
                        difficultyName={puzzle?.difficulty || 'Medium'}
                        timer="--:--"
                    />


                    {/* Puzzle Goal - Collapsible */}
                    {puzzle?.description && (
                        <div style={{
                            backgroundColor: '#EFF6FF',
                            border: '2px solid #3B82F6',
                            borderRadius: '12px',
                            marginBottom: '16px',
                            boxShadow: '0 2px 8px rgba(59, 130, 246, 0.1)',
                            overflow: 'hidden',
                            transition: 'all 0.3s ease'
                        }}>
                            {/* Header - Always visible */}
                            <div
                                onClick={() => setIsGoalExpanded(!isGoalExpanded)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '16px 20px',
                                    cursor: 'pointer',
                                    userSelect: 'none'
                                }}
                            >
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    flex: 1
                                }}>
                                    <div style={{
                                        backgroundColor: '#3B82F6',
                                        borderRadius: '8px',
                                        padding: '8px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        minWidth: '36px',
                                        height: '36px'
                                    }}>
                                        <Lightbulb size={20} color="#FFF" />
                                    </div>
                                    <div style={{
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        color: '#1E40AF',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px'
                                    }}>
                                        Puzzle Goal
                                    </div>
                                </div>
                                {/* Toggle Button */}
                                <div style={{
                                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                    borderRadius: '6px',
                                    padding: '4px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.2s ease'
                                }}>
                                    {isGoalExpanded ? (
                                        <ChevronUp size={18} color="#3B82F6" />
                                    ) : (
                                        <ChevronDown size={18} color="#3B82F6" />
                                    )}
                                </div>
                            </div>

                            {/* Content - Collapsible */}
                            {isGoalExpanded && (
                                <div style={{
                                    padding: '0 20px 16px 68px',
                                    fontSize: '15px',
                                    color: '#1E3A8A',
                                    lineHeight: '1.6',
                                    animation: 'slideDown 0.3s ease'
                                }}>
                                    {puzzle.description}
                                </div>
                            )}
                        </div>
                    )}


                    {/* Board */}
                    <div className="puzzle-board-container">
                        <ChessBoard
                            board={board}
                            selectedSquare={selectedSquare}
                            lastMove={lastMove}
                            checkSquare={checkSquare}
                            interactive={true}
                            onSquareClick={handleSquareClick}
                            size="full"
                        />
                    </div>
                </div>

                {/* Sidebar */}
                <div className="puzzle-sidebar">
                    <div className="puzzle-sidebar-header">
                        <h3>Puzzle Info</h3>
                    </div>

                    {/* Server Status */}
                    <ServerStatusCard connectionStatus={connectionStatus} />

                    {/* Actions */}
                    <div className="puzzle-actions-card">
                        <button
                            className="puzzle-action-button puzzle-primary-button"
                            onClick={handleConnect}
                            disabled={connectionStatus === 'connecting'}
                        >
                            <Bluetooth size={20} color="#FFF" />
                            <span className="puzzle-action-button-text puzzle-primary-button-text">
                                {connectionStatus === 'connecting' ? 'Connecting...' :
                                    isConnected ? 'Disconnect Robot' : 'Connect Robot'}
                            </span>
                        </button>

                        {/* Start Game Button */}
                        <button
                            className="puzzle-action-button"
                            onClick={handleStartGame}
                            disabled={!isConnected || isStartingGame || gameStatus === 'playing'}
                            style={{
                                backgroundColor: gameStatus === 'playing' ? '#10B981' : '#3B82F6',
                                color: 'white'
                            }}
                        >
                            <Play size={20} color="#FFF" />
                            <span className="puzzle-action-button-text" style={{ color: 'white' }}>
                                {isStartingGame ? 'Starting...' :
                                    gameStatus === 'playing' ? 'Game Active' : 'Start Game'}
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

                    {/* Feedback Message */}
                    {message && (
                        <div className="puzzle-feedback-card" style={{
                            backgroundColor: message.includes('Correct') || message.includes('✓') ? '#D1FAE5' :
                                message.includes('Incorrect') || message.includes('✗') ? '#FEE2E2' :
                                    '#EFF6FF',
                            color: message.includes('Correct') || message.includes('✓') ? '#065F46' :
                                message.includes('Incorrect') || message.includes('✗') ? '#991B1B' :
                                    '#1E40AF',
                            border: `1px solid ${message.includes('Correct') || message.includes('✓') ? '#10B981' :
                                message.includes('Incorrect') || message.includes('✗') ? '#EF4444' :
                                    '#3B82F6'}`
                        }}>
                            {message}
                        </div>
                    )}

                    {/* Camera View */}
                    <div style={{ height: '300px', marginTop: '16px' }}>
                        <CameraView
                            streamUrl={CAMERA_CONFIG.STREAM_URL}
                            title="Robot Camera"
                            allowFullscreen={true}
                            showRefresh={true}
                            onConnectionChange={(connected) => {
                                console.log('[PuzzleGame] Camera connection status:', connected);
                            }}
                        />
                    </div>

                    {/* Move History */}
                    <MoveHistory moves={moveHistory} />
                </div>
            </div>
        </div>
    );
}
