import { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, User, Cpu, Bluetooth, RotateCcw, Pause, Lightbulb, Flag, Play } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Chess } from 'chess.js';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import wsService from '../services/websocketService';
import gameService from '../services/gameService';
import { ChessBoard, initialBoard, fenToBoard } from '../components/chess';
import type { BoardState } from '../components/chess';
import { CameraView } from '../components/camera';
import { MoveHistory, GameOverModal } from '../components/game';
import type { Move } from '../components/game';
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
    
    // Game message state
    const [gameMessage, setGameMessage] = useState<string>('Waiting to start game...');
    const [boardSetupStatus, setBoardSetupStatus] = useState<'checking' | 'correct' | 'incorrect' | null>(null);
    
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
    
    // Pending moves queue for batch save
    const pendingMoves = useRef<Array<{
        gameId: string;
        moveNumber: number;
        playerColor: string;
        fromSquare: string;
        toSquare: string;
        fromPiece?: string;
        toPiece?: string;
        notation: string;
        resultsInCheck: boolean;
        fenStr: string;
    }>>([]);
    const saveTimerRef = useRef<number | null>(null);

    // Toast throttling - prevent duplicate notifications
    const lastToastRef = useRef<{
        type: string;
        message: string;
        timestamp: number;
    } | null>(null);

    // Helper: Show toast only if not duplicate within 3 seconds
    const showToast = (type: 'success' | 'error' | 'warning' | 'info', message: string, force = false) => {
        const now = Date.now();
        
        // Check if same toast was shown recently (within 3 seconds)
        if (!force && lastToastRef.current) {
            const timeSinceLastToast = now - lastToastRef.current.timestamp;
            const isSameToast = lastToastRef.current.type === type && lastToastRef.current.message === message;
            
            if (isSameToast && timeSinceLastToast < 3000) {
                console.log(`[Toast] Blocked duplicate: ${message}`);
                return; // Skip duplicate toast
            }
        }
        
        // Show toast and update tracker
        lastToastRef.current = { type, message, timestamp: now };
        
        // Use toastId to prevent react-toastify duplicates
        const toastId = `${type}-${message}`;
        const toastOptions = {
            toastId: toastId,
            autoClose: 3000
        };
        
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



    // WebSocket connection setup (separate from gameId to prevent disconnect on game start)
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

        // Auto-connect on mount
        const autoConnect = async () => {
            if (!wsService.isConnected()) {
                try {
                    console.log('[VsBot] Auto-connecting to server...');
                    setConnectionStatus('connecting');
                    await wsService.connect();
                } catch (error) {
                    console.error('[VsBot] Auto-connect failed:', error);
                    setConnectionStatus('error');
                }
            }
        };
        
        autoConnect();

        // Cleanup on unmount only
        return () => {
            unsubscribeConnection();
            wsService.disconnect();
        };
    }, []); // ✓ No dependencies - only setup/cleanup on mount/unmount

    // Handle game over (checkmate/stalemate) - defined before useEffect to avoid dependency issues
    const handleGameOver = useCallback(async (data: any) => {
        console.log('[handleGameOver] ========== CALLED ==========');
        console.log('[handleGameOver] gameId:', gameId);
        console.log('[handleGameOver] data:', data);
        
        if (!gameId) {
            console.warn('[handleGameOver] ✗ No gameId - skipping game over handling');
            return;
        }

        const { reason, winner, message } = data;
        console.log('[handleGameOver] ✓ Processing - reason:', reason, 'winner:', winner);
        
        try {
            // Save any pending moves first
            if (pendingMoves.current.length > 0) {
                await savePendingMoves();
            }

            // Get current move count
            const totalMoves = chessGame.current.history().length;
            const currentFen = chessGame.current.fen();

            // Determine result based on winner
            let result: 'win' | 'lose' | 'draw';
            let notificationMessage: string;
            let emoji: string;

            if (reason === 'checkmate') {
                if (winner === 'white') {
                    result = 'win';
                    emoji = '🎉';
                    notificationMessage = 'Checkmate! You won!';
                } else {
                    result = 'lose';
                    emoji = '😔';
                    notificationMessage = 'Checkmate! Robot won!';
                }
            } else if (reason === 'stalemate') {
                result = 'draw';
                emoji = '🤝';
                notificationMessage = 'Stalemate! Game is a draw';
            } else {
                result = 'draw';
                emoji = '🤝';
                notificationMessage = message || 'Game Over - Draw';
            }

            // Update game result in database (this also sends end command to AI)
            await gameService.updateGameResult(
                gameId,
                result,
                'completed',
                Math.ceil(totalMoves / 2),
                currentFen
            );

            console.log(`[VsBot] ✓ Game over - Result: ${result}, Reason: ${reason}`);
            
            // Update UI
            setGameStatus('ended');
            setGameMessage(notificationMessage);
            
            // Show game over modal instead of toast
            setGameOverModal({
                isOpen: true,
                result: result,
                reason: reason.charAt(0).toUpperCase() + reason.slice(1),
                message: notificationMessage
            });

        } catch (error: any) {
            console.error('[VsBot] ✗ Failed to update game over:', error);
            showToast('error', '✗ Failed to save game result. Please try again.');
        }
    }, [gameId]);

    // Handle incoming messages (separate effect that can access gameId)
    useEffect(() => {
        const unsubscribeMessage = wsService.on('message', (data) => {
            console.log('[VsBot] Received message:', data);
            
            // Update board if FEN string is provided
            if (data.fen_str) {
                console.log('[VsBot] Updating board with FEN:', data.fen_str);
                try {
                    const newBoard = fenToBoard(data.fen_str);
                    setBoard(newBoard);
                    
                    // Update move history from FEN change
                    updateMoveHistoryFromFen(data.fen_str);
                } catch (error) {
                    console.error('[VsBot] Failed to parse FEN:', error);
                }
            }
            
            // Handle different message types
            if (data.type === 'board_status') {
                console.log('[VsBot] Board status:', data);
                const newStatus = data.status === 'correct' ? 'correct' : 'incorrect';
                
                // Only show toast if status changed (prevent spam)
                if (boardSetupStatus !== newStatus) {
                    setBoardSetupStatus(newStatus);
                    
                    if (data.status === 'correct') {
                        showToast('success', '✓ Board setup correct! Starting game...');
                        setGameMessage('Board verified - Game in progress');
                    } else {
                        showToast('warning', '⚠ Please adjust pieces to match starting position');
                        setGameMessage('Waiting for correct board setup...');
                    }
                }
            } else if (data.type === 'ai_move_executed' || data.type === 'move_detected') {
                console.log('[VsBot] AI move:', data);
                const move = data.move;
                
                // NOTE: We DON'T save move here because:
                // - Robot moves will be saved via FEN update (updateMoveHistoryFromFen)
                // - This prevents duplicate saves
                // - FEN is the source of truth for board state
                
                // Just show UI feedback
                if (move) {
                    const moveText = `${move.from_piece?.replace('_', ' ')} ${move.from} → ${move.to}`;
                    showToast('info', `🤖 Robot: ${moveText}`);
                    setGameMessage(`Robot moved: ${move.notation || moveText}`);
                    
                    if (move.results_in_check) {
                        setTimeout(() => {
                            showToast('warning', '⚠️ Check!');
                        }, 1000);
                    }
                }
            } else if (data.type === 'robot_response') {
                console.log('[VsBot] Robot response:', data);
                if (data.status === 'completed') {
                    showToast('success', '✓ Robot movement completed');
                } else if (data.status === 'error') {
                    showToast('error', '✗ Robot movement failed');
                }
            } else if (data.type === 'check_detected') {
                console.log('[VsBot] Check detected:', data);
                const playerInCheck = data.player_in_check;
                const message = playerInCheck === 'white' 
                    ? '⚠ Check! Your king is under attack!' 
                    : '⚠ Check! Robot king is under attack!';
                
                showToast('warning', message);
                setGameMessage(`Check - ${playerInCheck} king in danger`);
            } else if (data.type === 'illegal_move') {
                console.log('[VsBot] Illegal move:', data);
                const move = data.move;
                const moveText = move ? `${move.piece} from ${move.from} to ${move.to}` : 'Unknown move';
                showToast('error', `✗ Illegal move: ${moveText}`);
                setGameMessage('Illegal move detected - please try again');
            } else if (data.type === 'game_over') {
                console.log('[VsBot] ========== GAME OVER RECEIVED ==========');
                console.log('[VsBot] Full data:', JSON.stringify(data, null, 2));
                console.log('[VsBot] Reason:', data.reason);
                console.log('[VsBot] Winner:', data.winner);
                console.log('[VsBot] Message:', data.message);
                console.log('[VsBot] Current gameId:', gameId);
                console.log('[VsBot] ==========================================');
                handleGameOver(data);
            }
        });

        // Cleanup message handler when effect re-runs (gameId changes)
        return () => {
            unsubscribeMessage();
        };
    }, [gameId, handleGameOver]);

    // Cleanup pending moves on unmount
    useEffect(() => {
        return () => {
            // Save pending moves before unmount
            if (pendingMoves.current.length > 0) {
                savePendingMoves();
            }
            
            // Clear timer
            if (saveTimerRef.current) {
                clearTimeout(saveTimerRef.current);
            }
        };
    }, []);

    // Batch save pending moves
    const savePendingMoves = async () => {
        if (pendingMoves.current.length === 0) return;
        
        const movesToSave = [...pendingMoves.current];
        pendingMoves.current = []; // Clear queue
        
        try {
            if (movesToSave.length === 1) {
                // Save single move
                await gameService.saveMove(movesToSave[0]);
                console.log('[VsBot] ✓ Move saved to database');
            } else {
                // Batch save multiple moves
                await gameService.saveMovesBatch(movesToSave[0].gameId, movesToSave);
                console.log(`[VsBot] ✓ Batch saved ${movesToSave.length} moves to database`);
            }
        } catch (error) {
            console.error('[VsBot] ✗ Failed to save moves:', error);
            // Put failed moves back in queue
            pendingMoves.current.unshift(...movesToSave);
        }
    };
    
    // Queue move for batch save
    const queueMoveForSave = useCallback((moveData: any) => {
        pendingMoves.current.push(moveData);
        
        // Clear existing timer
        if (saveTimerRef.current) {
            clearTimeout(saveTimerRef.current);
        }
        
        // Save after 3 seconds of inactivity OR when 5 moves accumulated
        if (pendingMoves.current.length >= 5) {
            savePendingMoves();
        } else {
            saveTimerRef.current = window.setTimeout(() => {
                savePendingMoves();
            }, 3000);
        }
    }, []);
    
    // Update move history from FEN changes
    // This is the SINGLE SOURCE OF TRUTH for saving moves:
    // - Player (White) moves: Camera detects → TCP sends FEN → Save here
    // - Robot (Black) moves: Robot executes → TCP sends FEN → Save here
    // FEN updates come from board_status messages (line ~94)
    const updateMoveHistoryFromFen = (newFen: string) => {
        // Skip if this FEN was already processed
        if (newFen === lastProcessedFen.current) {
            return;
        }

        try {
            // Get the position part of FEN (before turn indicator)
            const newPosition = newFen.split(' ')[0];
            const currentPosition = chessGame.current.fen().split(' ')[0];

            // If positions are the same, no move was made
            if (newPosition === currentPosition) {
                return;
            }

            // Try to find the move by checking all legal moves
            const possibleMoves = chessGame.current.moves({ verbose: true });
            let moveFound = false;

            for (const move of possibleMoves) {
                // Create temporary game to test move
                const testGame = new Chess(chessGame.current.fen());
                testGame.move(move.san);
                
                // Check if this move results in the new position
                if (testGame.fen().split(' ')[0] === newPosition) {
                    // Make the move in our game
                    const madeMove = chessGame.current.move(move.san);
                    
                    if (madeMove && gameId) {
                        console.log('[VsBot] Move detected from FEN:', madeMove.san);
                        
                        // 💾 Queue move for batch save (instead of immediate save)
                        const totalMoves = chessGame.current.history().length;
                        const moveNumber = Math.ceil(totalMoves / 2);
                        
                        queueMoveForSave({
                            gameId: gameId,
                            moveNumber: moveNumber,
                            playerColor: madeMove.color === 'w' ? 'white' : 'black',
                            fromSquare: madeMove.from,
                            toSquare: madeMove.to,
                            fromPiece: `${madeMove.color === 'w' ? 'white' : 'black'}_${madeMove.piece}`,
                            toPiece: madeMove.captured ? 
                                    `${madeMove.color === 'w' ? 'black' : 'white'}_${madeMove.captured}` : 
                                    undefined,
                            notation: madeMove.san,
                            resultsInCheck: chessGame.current.inCheck(),
                            fenStr: newFen
                        });
                        
                        // Update move history UI
                        setMoveHistory(() => {
                            const history = chessGame.current.history();
                            const moves: Move[] = [];
                            
                            for (let i = 0; i < history.length; i += 2) {
                                moves.push({
                                    moveNumber: Math.floor(i / 2) + 1,
                                    white: history[i],
                                    black: history[i + 1]
                                });
                            }
                            
                            return moves;
                        });
                        
                        // Check for game end conditions
                        if (chessGame.current.isCheckmate()) {
                            const winner = madeMove.color === 'w' ? 'white' : 'black';
                            const result = winner === 'white' ? 'win' : 'lose';
                            const message = winner === 'white' ? 'Checkmate! You won!' : 'Checkmate! Robot won!';
                            
                            console.log(`[VsBot] Checkmate! ${winner} wins`);
                            setGameStatus('ended');
                            setGameMessage(message);
                            
                            // Update game result
                            (async () => {
                                try {
                                    await gameService.updateGameResult(
                                        gameId,
                                        result,
                                        'completed',
                                        moveNumber,
                                        newFen
                                    );
                                    console.log(`[VsBot] ✓ Game result updated: ${result}`);
                                    
                                    // Show modal after successful update
                                    setGameOverModal({
                                        isOpen: true,
                                        result: result,
                                        reason: 'Checkmate',
                                        message: message
                                    });
                                } catch (error) {
                                    console.error('[VsBot] ✗ Failed to update game result:', error);
                                }
                            })();
                        } else if (chessGame.current.isDraw()) {
                            const drawReason = chessGame.current.isStalemate() ? 'Stalemate' :
                                              chessGame.current.isThreefoldRepetition() ? 'Threefold Repetition' :
                                              chessGame.current.isInsufficientMaterial() ? 'Insufficient Material' : 'Draw';
                            const message = `Game drawn by ${drawReason}`;
                            
                            console.log(`[VsBot] Draw: ${drawReason}`);
                            setGameStatus('ended');
                            setGameMessage(message);
                            
                            // Update game result
                            (async () => {
                                try {
                                    await gameService.updateGameResult(
                                        gameId,
                                        'draw',
                                        'completed',
                                        moveNumber,
                                        newFen
                                    );
                                    console.log('[VsBot] ✓ Game result updated: draw');
                                    
                                    // Show modal after successful update
                                    setGameOverModal({
                                        isOpen: true,
                                        result: 'draw',
                                        reason: drawReason,
                                        message: message
                                    });
                                } catch (error) {
                                    console.error('[VsBot] ✗ Failed to update game result:', error);
                                }
                            })();
                        }
                        
                        moveFound = true;
                    }
                    // Update UI even without gameId
                    else if (madeMove) {
                        console.log('[VsBot] Move detected from FEN:', madeMove.san);
                        
                        setMoveHistory(() => {
                            const history = chessGame.current.history();
                            const moves: Move[] = [];
                            
                            for (let i = 0; i < history.length; i += 2) {
                                moves.push({
                                    moveNumber: Math.floor(i / 2) + 1,
                                    white: history[i],
                                    black: history[i + 1]
                                });
                            }
                            
                            return moves;
                        });
                        
                        moveFound = true;
                    }
                    break;
                }
            }

            if (!moveFound) {
                // If we couldn't find the move, reset the game with new FEN
                console.log('[VsBot] Could not determine move, resetting game state');
                chessGame.current.load(newFen);
                
                // Rebuild move history from chess.js
                const history = chessGame.current.history();
                const moves: Move[] = [];
                
                for (let i = 0; i < history.length; i += 2) {
                    moves.push({
                        moveNumber: Math.floor(i / 2) + 1,
                        white: history[i],
                        black: history[i + 1]
                    });
                }
                
                setMoveHistory(moves);
            }

            lastProcessedFen.current = newFen;
        } catch (error) {
            console.error('[VsBot] Error updating move history:', error);
        }
    };

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

            // Save any pending moves before starting new game
            if (pendingMoves.current.length > 0) {
                await savePendingMoves();
            }

            // Reset move history and chess game
            setMoveHistory([]);
            chessGame.current = new Chess();
            lastProcessedFen.current = '';
            pendingMoves.current = [];

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
            showToast('success', '✓ Game started! Please set up your board');

        } catch (error: any) {
            console.error('[VsBot] Failed to start game:', error);
            setGameStatus('idle');
            alert(error.message || 'Failed to start game. Please try again.');
        } finally {
            setIsStartingGame(false);
        }
    };

    // Handle resign game
    const handleResignGame = async () => {
        if (!gameId || gameStatus !== 'playing') {
            return;
        }

        // Show confirmation dialog
        const confirmed = window.confirm(
            '⚠️ Are you sure you want to resign?\n\n' +
            'This will end the game and count as a loss.\n' +
            'This action cannot be undone.'
        );

        if (!confirmed) {
            return;
        }

        try {
            // Save any pending moves first
            if (pendingMoves.current.length > 0) {
                await savePendingMoves();
            }

            // Get current move count
            const totalMoves = chessGame.current.history().length;
            const currentFen = chessGame.current.fen();

            // 1. Update game result in database (this also sends end command to AI)
            await gameService.updateGameResult(
                gameId,
                'lose',
                'completed',
                Math.ceil(totalMoves / 2),
                currentFen
            );

            console.log('[VsBot] ✓ Game resigned - Database updated and AI notified');
            
            // Update UI
            setGameStatus('ended');
            setGameMessage('You resigned - Game Over');
            
            // Show modal for resignation
            setGameOverModal({
                isOpen: true,
                result: 'lose',
                reason: 'Resignation',
                message: 'You resigned the game'
            });

        } catch (error: any) {
            console.error('[VsBot] ✗ Failed to resign game:', error);
            showToast('error', '✗ Failed to resign game. Please try again.');
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
                preventDuplicates={true}
            />

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

                        {/* Start Game Button */}
                        <button
                            className="vs-bot-action-button"
                            onClick={handleStartGame}
                            disabled={!isConnected || isStartingGame || gameStatus === 'playing'}
                            style={{ 
                                backgroundColor: gameStatus === 'playing' ? '#10B981' : '#3B82F6',
                                color: 'white'
                            }}
                        >
                            <Play size={20} color="#FFF" />
                            <span className="vs-bot-action-button-text" style={{ color: 'white' }}>
                                {isStartingGame ? 'Starting...' : 
                                 gameStatus === 'playing' ? 'Game Active' : 'Start Game'}
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

                        <button 
                            className="vs-bot-action-button" 
                            style={{ backgroundColor: '#FEF2F2' }}
                            onClick={handleResignGame}
                            disabled={gameStatus !== 'playing'}
                        >
                            <Flag size={20} color="#EF4444" />
                            <span className="vs-bot-action-button-text" style={{ color: '#EF4444' }}>Resign Game</span>
                        </button>
                    </div>

                    {/* Camera View */}
                    <div style={{ height: '300px', marginTop: '16px' }}>
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

                    {/* Move History */}
                    <MoveHistory moves={moveHistory} />
                </div>
            </div>

            {/* Game Over Modal */}
            <GameOverModal
                isOpen={gameOverModal.isOpen}
                result={gameOverModal.result}
                reason={gameOverModal.reason}
                message={gameOverModal.message}
                onClose={() => {
                    setGameOverModal({ ...gameOverModal, isOpen: false });
                    navigate(-1); // Go back to previous page
                }}
            />
        </div>
    );
}