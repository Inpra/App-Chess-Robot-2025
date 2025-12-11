import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Chess } from 'chess.js';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Pause, Flag } from 'lucide-react';
import wsService from '../services/websocketService';
import gameService from '../services/gameService';
import { ChessBoard, initialBoard, fenToBoard } from '../components/chess';
import type { BoardState } from '../components/chess';
import { CameraView } from '../components/camera';
import {
    MoveHistory,
    GameOverModal,
    ConfirmModal,
    GameHeader,
    MatchHeader,
    ServerStatusCard,
    GameActionsCard
} from '../components/game';
import type { Move } from '../components/game';
import { CAMERA_CONFIG } from '../services/apiConfig';
import authService from '../services/authService';
import '../styles/VsBot.css';

export default function VsBot({ isGuest: propIsGuest = false }: { isGuest?: boolean }) {
    const navigate = useNavigate();
    const location = useLocation();

    // Auto-detect guest mode if user is not logged in
    const user = authService.getCurrentUser();
    const isGuest = propIsGuest || !user;

    const { elo, difficulty, difficultyName, resumeGameId } = (location.state as any) || { elo: 1500, difficulty: 'medium', difficultyName: 'Medium' };
    const [isConnected, setIsConnected] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
    const [board, setBoard] = useState<BoardState>([...initialBoard]);
    const [selectedSquare] = useState<{ row: number, col: number } | null>(null); // Read-only: no manual interaction
    const [lastMove] = useState<{ from: number; to: number } | null>(null); // Read-only: updated from WebSocket
    const [checkSquare, setCheckSquare] = useState<{ row: number, col: number } | null>(null);
    const [hintSquares, setHintSquares] = useState<{ from: number; to: number } | null>(null);

    // Game state
    const [gameId, setGameId] = useState<string | null>(resumeGameId || null);
    const [gameStatus, setGameStatus] = useState<'waiting' | 'in_progress' | 'finished' | 'paused' | 'ended' | 'starting' | 'idle'>(resumeGameId ? 'paused' : 'waiting');
    const [isStartingGame, setIsStartingGame] = useState(false);
    const [isLoadingHint, setIsLoadingHint] = useState(false);

    // Game message state
    const [, setGameMessage] = useState<string>('Waiting to start game...');
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

    // Confirm modal state
    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
        variant: 'danger' | 'warning' | 'info';
        icon?: React.ReactNode;
    }>({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
        variant: 'warning'
    });

    // Chess.js instance to track game state
    const chessGame = useRef<Chess>(new Chess());
    const lastProcessedFen = useRef<string>('');

    // Message deduplication
    const lastMessageHash = useRef<Map<string, string>>(new Map());

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

    // Auto-resume game if resumeGameId is provided
    useEffect(() => {
        const autoResume = async () => {
            if (resumeGameId && gameStatus === 'paused' && isConnected && gameId) {
                console.log('[VsBot] Auto-resuming game:', resumeGameId);
                // Show message that game will be resumed
                setGameMessage('Resuming paused game...');

                try {
                    // Call API to resume game
                    const response = await gameService.resumeGame(gameId);

                    console.log('[VsBot] ✓ Game resumed:', response);

                    // Load the saved FEN position
                    if (response.fenStr) {
                        const newBoard = fenToBoard(response.fenStr);
                        setBoard(newBoard);
                        chessGame.current.load(response.fenStr);
                        lastProcessedFen.current = response.fenStr;

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

                    // Update UI
                    setGameStatus('in_progress');
                    setBoardSetupStatus('checking');
                    setGameMessage('Game resumed - Set up your board to continue');
                    showToast('success', '✓ Game resumed! Please set up your board');

                } catch (error: any) {
                    console.error('[VsBot] ✗ Failed to resume game:', error);
                    showToast('error', '✗ Failed to resume game. Please try again.');
                }
            }
        };

        autoResume();
    }, [resumeGameId, isConnected, gameStatus, gameId]); // Include all dependencies

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

            if (reason === 'checkmate') {
                if (winner === 'white') {
                    result = 'win';
                    notificationMessage = 'Checkmate! You won!';
                } else {
                    result = 'lose';
                    notificationMessage = 'Checkmate! Robot won!';
                }
            } else if (reason === 'stalemate') {
                result = 'draw';
                notificationMessage = 'Stalemate! Game is a draw';
            } else {
                result = 'draw';
                notificationMessage = message || 'Game Over - Draw';
            }

            // Update game result in database (this also sends end command to AI)
            if (!isGuest) {
                await gameService.updateGameResult(
                    gameId,
                    result,
                    'completed',
                    Math.ceil(totalMoves / 2),
                    currentFen
                );
                console.log(`[VsBot] ✓ Game over - Result: ${result}, Reason: ${reason}`);
            } else {
                console.log(`[VsBot] (Guest) - Result: ${result}, Reason: ${reason} - API update skipped`);
            }

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
    }, [gameId, isGuest]);

    const computeMessageHash = (type: string, data: any): string => {
        // Simple hash based on key fields
        const key = JSON.stringify({
            type,
            status: data.status,
            game_id: data.game_id,
            fen_str: data.fen_str,
            move: data.move
        });
        return key;
    };

    // Handle incoming messages (separate effect that can access gameId)
    useEffect(() => {
        const unsubscribeMessage = wsService.on('message', (data) => {
            console.log('[VsBot] Received message:', data);

            // Deduplicate messages
            if (data.type) {
                const messageHash = computeMessageHash(data.type, data);
                const lastHash = lastMessageHash.current.get(data.type);

                if (lastHash === messageHash) {
                    console.log(`[VsBot] Skipped duplicate ${data.type} message`);
                    return; // Skip duplicate
                }

                lastMessageHash.current.set(data.type, messageHash);
            }

            // Update board if FEN string is provided
            if (data.fen_str) {
                console.log('[VsBot] Updating board with FEN:', data.fen_str);
                try {
                    const newBoard = fenToBoard(data.fen_str);
                    setBoard(newBoard);

                    // Clear hint when board updates (any move made)
                    setHintSquares(prev => {
                        if (prev) {
                            console.log('[VsBot] Clearing hint squares due to FEN update');
                            return null;
                        }
                        return prev;
                    });

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
        if (isGuest) return; // Guests don't save moves
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

    // Update move history from FEN changes
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
                                    if (!isGuest) {
                                        await gameService.updateGameResult(
                                            gameId,
                                            result,
                                            'completed',
                                            moveNumber,
                                            newFen
                                        );
                                        console.log(`[VsBot] ✓ Game result updated: ${result}`);
                                    }

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
                                    if (!isGuest) {
                                        await gameService.updateGameResult(
                                            gameId,
                                            'draw',
                                            'completed',
                                            moveNumber,
                                            newFen
                                        );
                                        console.log('[VsBot] ✓ Game result updated: draw');
                                    }

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

            // Update check status
            updateCheckSquare();
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
            setCheckSquare(null);

            // Call API to start game
            let response;
            if (isGuest) {
                response = await gameService.testStartGame();
            } else {
                response = await gameService.startGame({
                    gameTypeCode: 'normal_game',
                    difficulty: difficulty || 'medium',
                });
            }

            console.log('[VsBot] Game started:', response);
            setGameId(response.gameId);
            setGameStatus('in_progress');
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

    // Handle pause game
    const handlePauseGame = async () => {
        if (!gameId || gameStatus !== 'in_progress') {
            console.warn('[VsBot] Cannot pause - gameId:', gameId, 'status:', gameStatus);
            return;
        }

        if (isGuest) {
            showToast('info', 'Feature not available for guests');
            return;
        }

        console.log('[VsBot] Pausing game:', gameId, 'current status:', gameStatus);

        // Show confirmation modal
        setConfirmModal({
            isOpen: true,
            title: 'Pause Game?',
            message: 'Your progress will be saved and you can resume later from Match History.\n\nDo you want to pause this game?',
            variant: 'warning',
            icon: <Pause size={64} />,
            onConfirm: async () => {
                setConfirmModal({ ...confirmModal, isOpen: false });
                await executePauseGame();
            }
        });
    };

    // Execute pause game after confirmation
    const executePauseGame = async () => {
        if (!gameId) return;

        try {
            // Save any pending moves first
            if (pendingMoves.current.length > 0) {
                console.log('[VsBot] Saving pending moves before pause:', pendingMoves.current.length);
                await savePendingMoves();
            }

            // Call API to pause game (saves state and sends end command to AI)
            console.log('[VsBot] Calling pauseGame API for gameId:', gameId);
            const response = await gameService.pauseGame(gameId);

            console.log('[VsBot] ✓ Game paused successfully:', response);

            // Update UI
            setGameStatus('paused');
            setGameMessage('Game paused - Progress saved');
            showToast('success', '✓ Game paused! Check Match History to resume');

            // Navigate back to home after short delay
            setTimeout(() => {
                navigate('/');
            }, 1500);

        } catch (error: any) {
            console.error('[VsBot] ✗ Failed to pause game:', error);
            showToast('error', '✗ Failed to pause game. Please try again.');
        }
    };

    // Handle resume game
    const handleResumeGame = async () => {
        if (!gameId || gameStatus !== 'paused') {
            return;
        }

        try {
            // Call API to resume game (sends resume command with saved FEN to AI)
            const response = await gameService.resumeGame(gameId);

            console.log('[VsBot] ✓ Game resumed:', response);

            // Load the saved FEN position
            if (response.fenStr) {
                const newBoard = fenToBoard(response.fenStr);
                setBoard(newBoard);
                chessGame.current.load(response.fenStr);
                lastProcessedFen.current = response.fenStr;

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

            // Update UI
            setGameStatus('in_progress');
            setBoardSetupStatus('checking');
            setGameMessage('Game resumed - Set up your board to continue');
            showToast('success', '✓ Game resumed! Please set up your board');

        } catch (error: any) {
            console.error('[VsBot] ✗ Failed to resume game:', error);
            showToast('error', '✗ Failed to resume game. Please try again.');
        }
    };

    // Handle resign game
    const handleResignGame = async () => {
        if (!gameId || gameStatus !== 'in_progress') {
            return;
        }

        // Show confirmation modal
        setConfirmModal({
            isOpen: true,
            title: 'Resign Game?',
            message: 'This will end the game and count as a loss.\n\nThis action cannot be undone.\n\nAre you sure you want to resign?',
            variant: 'danger',
            icon: <Flag size={64} />,
            onConfirm: async () => {
                setConfirmModal({ ...confirmModal, isOpen: false });
                await executeResignGame();
            }
        });
    };

    // Execute resign game after confirmation
    const executeResignGame = async () => {
        if (!gameId) return;

        try {
            // Save any pending moves first
            if (pendingMoves.current.length > 0) {
                await savePendingMoves();
            }

            // Get current move count
            const totalMoves = chessGame.current.history().length;
            const currentFen = chessGame.current.fen();

            // 1. Update game result in database (this also sends end command to AI)
            if (!isGuest) {
                await gameService.updateGameResult(
                    gameId,
                    'lose',
                    'completed',
                    Math.ceil(totalMoves / 2),
                    currentFen
                );
            } else {
                // For guests, maybe just end locally or call test-end if exists?
                // For now, assume robot just resets eventually or we can send a custom command if needed.
                // But updateGameResult is what notifies AI. Guests can't call it.
                // We will rely on just closing the loop locally. `gameService.endGame` also requires auth.
                // We might need a `gameService.testEndGame` if we want to reset robot state properly for guest.
                // GamesController has `test-end`.
                // For now, let's just log.
                console.log('[VsBot] Guest resigned - API update skipped');
                // Ideally, we should call testEndGame here.
            }

            console.log('[VsBot] ✓ Game resigned - Database updated and AI notified');

            // Update UI
            setGameStatus('finished');
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

    // Handle hint/AI suggestion
    const handleHint = async () => {
        if (!gameId || gameStatus !== 'in_progress') {
            showToast('warning', 'Bạn chỉ có thể xem gợi ý khi đang chơi');
            return;
        }

        if (isGuest) {
            showToast('warning', 'Guests cannot use AI hints');
            return;
        }

        try {
            // Get current FEN position
            const currentFen = chessGame.current.fen();

            // Set loading state
            setIsLoadingHint(true);

            // Request AI suggestion
            const suggestion = await gameService.getSuggestion({
                gameId: gameId,
                fenPosition: currentFen,
                depth: 15, // Medium depth for balance between speed and accuracy
            });

            // Helper: Convert chess square notation to board index
            const squareToIndex = (square: string): number => {
                const file = square.charCodeAt(0) - 'a'.charCodeAt(0); // a=0, b=1, ..., h=7
                const rank = 8 - parseInt(square[1]); // 8=0, 7=1, ..., 1=7
                return rank * 8 + file;
            };

            // Parse the suggested move to get from/to squares
            const move = chessGame.current.move(suggestion.suggestedMoveSan);

            if (move) {
                // Convert chess.js square notation (e.g., 'e2', 'e4') to board indices
                const fromIndex = squareToIndex(move.from);
                const toIndex = squareToIndex(move.to);

                // Undo the move (we only wanted to parse it)
                chessGame.current.undo();

                // Set hint squares to highlight on board
                setHintSquares({ from: fromIndex, to: toIndex });

                console.log(`[VsBot] Hint displayed: ${suggestion.suggestedMoveSan} (from: ${move.from}, to: ${move.to})`);
                console.log(`[VsBot] Points deducted: ${suggestion.pointsDeducted}, Remaining: ${suggestion.remainingPoints}`);
            } else {
                showToast('error', 'Không thể phân tích nước đi gợi ý');
            }

        } catch (error: any) {
            console.error('[VsBot] Failed to get hint:', error);

            // Show specific error messages
            if (error.message.includes('đủ điểm') || error.message.includes('Insufficient points')) {
                showToast('error', error.message, true);
            } else if (error.message.includes('đợi') || error.message.includes('rate limit')) {
                showToast('warning', error.message, true);
            } else {
                showToast('error', 'Không thể lấy gợi ý. Vui lòng thử lại.', true);
            }
        } finally {
            setIsLoadingHint(false);
        }
    };

    // Note: Board interaction is disabled - users move pieces on physical board
    // The web interface only displays the current state

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
            />

            {/* Header */}
            <GameHeader onBack={() => navigate(-1)} />

            <div className="vs-bot-content-container">
                {/* Board Section */}
                <div className="vs-bot-board-section">
                    {/* Match Header Card */}
                    <MatchHeader
                        userElo={1200}
                        robotElo={elo}
                        difficultyName={difficultyName}
                    />

                    {/* Chess Board Area */}
                    <div className="vs-bot-board-container">
                        <ChessBoard
                            board={board}
                            selectedSquare={selectedSquare}
                            lastMove={lastMove}
                            checkSquare={checkSquare}
                            hintSquares={hintSquares}
                            interactive={false}
                            size="full"
                        />
                    </div>
                </div>

                {/* Sidebar: Controls & Info */}
                <div className="vs-bot-sidebar">
                    {/* Game Status Banner */}
                    {/* <GameStatusBanner 
                        gameStatus={gameStatus}
                        boardSetupStatus={boardSetupStatus}
                        gameMessage={gameMessage}
                    /> */}

                    {/* Robot Status */}
                    <ServerStatusCard connectionStatus={connectionStatus} />

                    {/* Game Actions */}
                    <GameActionsCard
                        connectionStatus={connectionStatus}
                        isConnected={isConnected}
                        isStartingGame={isStartingGame}
                        gameStatus={gameStatus}
                        isLoadingHint={isLoadingHint}
                        onConnect={handleConnect}
                        onStartGame={handleStartGame}
                        onResign={handleResignGame}
                        onPause={gameStatus === 'paused' ? handleResumeGame : handlePauseGame}
                        onHint={handleHint}
                    />

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

                    {/* Test Modal Buttons (Development Only) */}
                    <div style={{
                        marginTop: '16px',
                        padding: '12px',
                        backgroundColor: '#1a1a2e',
                        borderRadius: '8px',
                        border: '1px solid #2a2a3e'
                    }}>
                        <div style={{
                            fontSize: '12px',
                            color: '#888',
                            marginBottom: '8px',
                            fontWeight: 'bold'
                        }}>
                            🧪 Test Game Over Modal:
                        </div>
                        <div style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
                            <button
                                onClick={() => setGameOverModal({
                                    isOpen: true,
                                    result: 'win',
                                    reason: 'Checkmate',
                                    message: 'Checkmate! You won!'
                                })}
                                style={{
                                    padding: '8px 12px',
                                    backgroundColor: '#28a745',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '12px',
                                    fontWeight: '500'
                                }}
                            >
                                ✅ Test Win Modal
                            </button>
                            <button
                                onClick={() => setGameOverModal({
                                    isOpen: true,
                                    result: 'lose',
                                    reason: 'Checkmate',
                                    message: 'Checkmate! Robot won!'
                                })}
                                style={{
                                    padding: '8px 12px',
                                    backgroundColor: '#dc3545',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '12px',
                                    fontWeight: '500'
                                }}
                            >
                                ❌ Test Lose Modal
                            </button>
                            <button
                                onClick={() => setGameOverModal({
                                    isOpen: true,
                                    result: 'draw',
                                    reason: 'Stalemate',
                                    message: 'Stalemate! Game is a draw'
                                })}
                                style={{
                                    padding: '8px 12px',
                                    backgroundColor: '#6c757d',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '12px',
                                    fontWeight: '500'
                                }}
                            >
                                ⚖️ Test Draw Modal
                            </button>
                            <button
                                onClick={() => setConfirmModal({
                                    isOpen: true,
                                    title: 'Pause Game?',
                                    message: 'Test pause confirmation modal',
                                    variant: 'warning',
                                    icon: <Pause size={64} />,
                                    onConfirm: () => {
                                        setConfirmModal({ ...confirmModal, isOpen: false });
                                        alert('Pause confirmed!');
                                    }
                                })}
                                style={{
                                    padding: '8px 12px',
                                    backgroundColor: '#f59e0b',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '12px',
                                    fontWeight: '500'
                                }}
                            >
                                ⏸️ Test Pause Modal
                            </button>
                            <button
                                onClick={() => setConfirmModal({
                                    isOpen: true,
                                    title: 'Resign Game?',
                                    message: 'Test resign confirmation modal',
                                    variant: 'danger',
                                    icon: <Flag size={64} />,
                                    onConfirm: () => {
                                        setConfirmModal({ ...confirmModal, isOpen: false });
                                        alert('Resign confirmed!');
                                    }
                                })}
                                style={{
                                    padding: '8px 12px',
                                    backgroundColor: '#ef4444',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '12px',
                                    fontWeight: '500'
                                }}
                            >
                                🏳️ Test Resign Modal
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Confirm Modal */}
            <ConfirmModal
                isOpen={confirmModal.isOpen}
                title={confirmModal.title}
                message={confirmModal.message}
                variant={confirmModal.variant}
                icon={confirmModal.icon}
                confirmText="Yes"
                cancelText="No"
                onConfirm={confirmModal.onConfirm}
                onCancel={() => setConfirmModal({ ...confirmModal, isOpen: false })}
            />

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