import { Chess } from 'chess.js';
import NavigationHeader from '@/components/common/NavigationHeader';
import { Colors } from '@/constants/theme';
import { getGameStyles } from '@/styles/game.styles';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import {
    SafeAreaView,
    Text,
    TouchableOpacity,
    useWindowDimensions,
    View,
    ActivityIndicator,
    Alert,
    ScrollView
} from 'react-native';
import ChessBoard from '../game/ChessBoard';
import CameraView from '../camera/CameraView';
import MoveHistory from '../game/MoveHistory';
import ServerStatusCard from '../game/ServerStatusCard';
import GameActionsCard from '../game/GameActionsCard';
import { GameOverModal } from '../game/GameOverModal';
import { CAMERA_CONFIG } from '@/services/apiConfig';
import puzzleService, { type TrainingPuzzle } from '@/services/puzzleService';
import gameService from '@/services/gameService';
import wsService from '@/services/websocketService';
import type { Move } from '../game/MoveHistory';

export default function PuzzleGameScreen() {
    const dimensions = useWindowDimensions();
    const styles = useMemo(() => getGameStyles(dimensions), [dimensions]);
    const router = useRouter();
    const { id } = useLocalSearchParams();

    // Puzzle Data
    const [puzzle, setPuzzle] = useState<TrainingPuzzle | null>(null);
    const [loading, setLoading] = useState(true);
    const [gameId, setGameId] = useState<string | null>(null);

    // Game State
    const [fen, setFen] = useState('');
    const [selectedSquare] = useState<{ row: number, col: number } | null>(null);
    const [checkSquare, setCheckSquare] = useState<{ row: number, col: number } | null>(null);
    const [hintSquares, setHintSquares] = useState<{ from: number; to: number } | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    // Connection State
    const [isConnected, setIsConnected] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');

    // UI State
    const [showCamera, setShowCamera] = useState(false);
    const [isGoalExpanded, setIsGoalExpanded] = useState(true);
    const [gameStatus, setGameStatus] = useState<'waiting' | 'in_progress' | 'finished' | 'paused' | 'ended' | 'starting' | 'idle'>('idle');
    const [isStartingGame, setIsStartingGame] = useState(false);
    const [isLoadingHint, setIsLoadingHint] = useState(false);

    // Move History
    const [moveHistory, setMoveHistory] = useState<Move[]>([]);

    // Game Over Modal
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

    // Chess.js instance
    const chessGame = useRef<Chess>(new Chess());
    const lastProcessedFen = useRef<string>('');
    const moveCounter = useRef<number>(0);
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
    const saveTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Helper: Convert FEN to board state
    const fenToBoard = (fen: string) => {
        const game = new Chess(fen);
        const board = game.board();
        return board;
    };

    // Helper: Update check square
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

    // Handle puzzle solution check
    const handlePuzzleSolution = useCallback((data: any) => {
        console.log('[PuzzleGame] Puzzle solution:', data);

        if (data.correct) {
            setMessage('✓ Correct! Well done!');

            // Show game over modal
            setGameOverModal({
                isOpen: true,
                result: 'win',
                reason: 'Puzzle Solved',
                message: 'Congratulations! You solved the puzzle!'
            });

            setTimeout(() => {
                router.navigate('/puzzles');
            }, 3000);
        } else {
            setMessage('✗ Incorrect move. Try again!');

            // Reset board after incorrect move
            setTimeout(() => {
                if (puzzle) {
                    const resetBoard = fenToBoard(puzzle.fenStr);
                    setFen(puzzle.fenStr);
                    chessGame.current = new Chess(puzzle.fenStr);
                    updateCheckSquare();
                }
                setMessage(null);
            }, 1500);
        }
    }, [puzzle, router]);

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
            if (data.fen_str) {
                console.log('[PuzzleGame] Updating board with FEN:', data.fen_str);
                try {
                    setFen(data.fen_str);

                    // Clear hint when board updates
                    setHintSquares(prev => {
                        if (prev) {
                            console.log('[PuzzleGame] Clearing hint squares due to FEN update');
                            return null;
                        }
                        return prev;
                    });

                    // Update move history from FEN change
                    updateMoveHistoryFromFen(data.fen_str);
                } catch (error) {
                    console.error('[PuzzleGame] Failed to parse FEN:', error);
                }
            }

            // Handle different message types
            if (data.type === 'puzzle_solution') {
                handlePuzzleSolution(data);
            } else if (data.type === 'ai_move_executed' || data.type === 'move_detected') {
                if (data.move) {
                    setMessage(`Move: ${data.move}`);
                }
            }
        });

        return () => {
            unsubscribeMessage();
        };
    }, [gameId, puzzle, handlePuzzleSolution]);

    // Batch save pending moves
    const savePendingMoves = async () => {
        if (pendingMoves.current.length === 0) return;

        const movesToSave = [...pendingMoves.current];
        pendingMoves.current = []; // Clear queue

        try {
            if (movesToSave.length === 1) {
                await gameService.saveMove(movesToSave[0]);
                console.log('[PuzzleGame] ✓ Move saved to database');
            } else {
                await gameService.saveMovesBatch(movesToSave[0].gameId, movesToSave);
                console.log(`[PuzzleGame] ✓ Batch saved ${movesToSave.length} moves to database`);
            }
        } catch (error) {
            console.error('[PuzzleGame] ✗ Failed to save moves:', error);
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
            saveTimerRef.current = setTimeout(() => {
                savePendingMoves();
            }, 3000) as unknown as NodeJS.Timeout;
        }
    }, []);

    // Update move history from FEN changes
    const updateMoveHistoryFromFen = (newFen: string) => {
        // Skip if this FEN was already processed
        if (newFen === lastProcessedFen.current) {
            return;
        }

        try {
            // Get the position part of FEN
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
                const testGame = new Chess(chessGame.current.fen());
                testGame.move(move.san);

                if (testGame.fen().split(' ')[0] === newPosition) {
                    const madeMove = chessGame.current.move(move.san);

                    if (madeMove && gameId) {
                        console.log('[PuzzleGame] Move detected from FEN:', madeMove.san);

                        moveCounter.current += 1;
                        const moveNumber = Math.ceil(moveCounter.current / 2);

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

                        moveFound = true;
                    }
                    break;
                }
            }

            if (!moveFound) {
                console.log('[PuzzleGame] Could not determine move, resetting game state');
                chessGame.current.load(newFen);

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
            updateCheckSquare();
        } catch (error) {
            console.error('[PuzzleGame] Error updating move history:', error);
        }
    };

    // Load puzzle data on mount (don't start game yet)
    useEffect(() => {
        if (!id) {
            Alert.alert('Error', 'Puzzle ID is required');
            router.navigate('/puzzles');
            return;
        }

        loadPuzzleData();
    }, [id]);

    // Cleanup pending moves on unmount
    useEffect(() => {
        return () => {
            if (pendingMoves.current.length > 0) {
                savePendingMoves();
            }

            if (saveTimerRef.current) {
                clearTimeout(saveTimerRef.current);
            }
        };
    }, []);

    const loadPuzzleData = async () => {
        try {
            setLoading(true);

            console.log('[PuzzleGame] Loading puzzle:', id);
            const puzzleData = await puzzleService.getPuzzleById(id as string);
            setPuzzle(puzzleData);

            // Parse FEN and set board
            setFen(puzzleData.fenStr);
            chessGame.current = new Chess(puzzleData.fenStr);
            lastProcessedFen.current = puzzleData.fenStr;
            moveCounter.current = 0;

            setMessage('Please arrange the board as shown on screen to start.');
            console.log('[PuzzleGame] ✓ Puzzle loaded:', puzzleData.name);
        } catch (error: any) {
            console.error('[PuzzleGame] Error loading puzzle:', error);
            Alert.alert('Error', error.message || 'Failed to load puzzle');
            setTimeout(() => router.navigate('/puzzles'), 2000);
        } finally {
            setLoading(false);
        }
    };

    // Start game
    const handleStartGame = async () => {
        if (!isConnected) {
            Alert.alert('Not Connected', 'Please connect to server first');
            return;
        }

        if (!puzzle) {
            Alert.alert('Error', 'Puzzle not loaded');
            return;
        }

        try {
            setIsStartingGame(true);
            setGameStatus('starting');

            // Save any pending moves before starting new game
            if (pendingMoves.current.length > 0) {
                await savePendingMoves();
            }

            // Reset game state
            setMoveHistory([]);
            pendingMoves.current = [];
            setCheckSquare(null);
            chessGame.current = new Chess(puzzle.fenStr);
            lastProcessedFen.current = puzzle.fenStr;
            moveCounter.current = 0;

            // Call API to start game
            console.log('[PuzzleGame] Starting puzzle game...');
            const gameResponse = await gameService.startGame({
                gameTypeCode: 'training_puzzle',
                difficulty: puzzle.difficulty || 'medium',
                puzzleId: id as string
            });

            setGameId(gameResponse.gameId);
            setGameStatus('in_progress');
            setMessage('Verifying board setup...');
            console.log('[PuzzleGame] ✓ Game started:', gameResponse);

        } catch (error: any) {
            console.error('[PuzzleGame] Failed to start game:', error);
            setGameStatus('idle');
            Alert.alert('Error', error.message || 'Failed to start game. Please try again.');
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
                Alert.alert('Error', 'Failed to connect to robot');
            }
        }
    };

    // Handle pause game
    const handlePauseGame = async () => {
        if (!gameId || gameStatus !== 'in_progress') {
            return;
        }

        Alert.alert(
            '⏸️ Pause Puzzle?',
            'Your progress will be saved and you can resume later.\nDo you want to pause this puzzle?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Pause',
                    onPress: async () => {
                        try {
                            if (pendingMoves.current.length > 0) {
                                await savePendingMoves();
                            }

                            const response = await gameService.pauseGame(gameId);
                            console.log('[PuzzleGame] ✓ Puzzle paused:', response);

                            setGameStatus('paused');
                            setMessage('Puzzle paused - Progress saved');

                            setTimeout(() => {
                                router.navigate('/puzzles');
                            }, 1500);
                        } catch (error: any) {
                            console.error('[PuzzleGame] ✗ Failed to pause puzzle:', error);
                            Alert.alert('Error', 'Failed to pause puzzle. Please try again.');
                        }
                    }
                }
            ]
        );
    };

    // Handle resume game
    const handleResumeGame = async () => {
        if (!gameId || gameStatus !== 'paused') {
            return;
        }

        try {
            const response = await gameService.resumeGame(gameId);
            console.log('[PuzzleGame] ✓ Puzzle resumed:', response);

            if (response.fenStr) {
                setFen(response.fenStr);
                chessGame.current.load(response.fenStr);
                lastProcessedFen.current = response.fenStr;

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

            setGameStatus('in_progress');
            setMessage('Puzzle resumed - Set up your board to continue');
        } catch (error: any) {
            console.error('[PuzzleGame] ✗ Failed to resume puzzle:', error);
            Alert.alert('Error', 'Failed to resume puzzle. Please try again.');
        }
    };

    // Handle resign/skip puzzle
    const handleResignPuzzle = async () => {
        if (!gameId || gameStatus !== 'in_progress') {
            return;
        }

        Alert.alert(
            '⚠️ Skip this puzzle?',
            'This will count as incomplete and you can try it again later.\nDo you want to skip this puzzle?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Skip',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            if (pendingMoves.current.length > 0) {
                                await savePendingMoves();
                            }

                            const totalMoves = moveCounter.current;
                            const currentFen = chessGame.current.fen();

                            await gameService.updateGameResult(
                                gameId,
                                'lose',
                                'completed',
                                Math.ceil(totalMoves / 2),
                                currentFen
                            );

                            console.log('[PuzzleGame] ✓ Puzzle skipped');

                            setGameStatus('ended');
                            setMessage('Puzzle skipped');

                            setGameOverModal({
                                isOpen: true,
                                result: 'lose',
                                reason: 'Skipped',
                                message: 'You skipped this puzzle'
                            });
                        } catch (error: any) {
                            console.error('[PuzzleGame] ✗ Failed to skip puzzle:', error);
                            Alert.alert('Error', 'Failed to skip puzzle. Please try again.');
                        }
                    }
                }
            ]
        );
    };

    // Handle hint/AI suggestion
    const handleHint = async () => {
        if (!gameId || gameStatus !== 'in_progress') {
            Alert.alert('Warning', 'You can only get hints while playing');
            return;
        }

        try {
            const currentFen = chessGame.current.fen();
            setIsLoadingHint(true);

            const suggestion = await gameService.getSuggestion({
                gameId: gameId,
                fenPosition: currentFen,
                depth: 15,
            });

            // Helper: Convert chess square notation to board index
            const squareToIndex = (square: string): number => {
                const file = square.charCodeAt(0) - 'a'.charCodeAt(0);
                const rank = 8 - parseInt(square[1]);
                return rank * 8 + file;
            };

            const move = chessGame.current.move(suggestion.suggestedMoveSan);

            if (move) {
                const fromIndex = squareToIndex(move.from);
                const toIndex = squareToIndex(move.to);

                chessGame.current.undo();

                setHintSquares({ from: fromIndex, to: toIndex });

                console.log(`[PuzzleGame] Hint displayed: ${suggestion.suggestedMoveSan}`);
                console.log(`[PuzzleGame] Points deducted: ${suggestion.pointsDeducted}, Remaining: ${suggestion.remainingPoints}`);
            } else {
                Alert.alert('Error', 'Could not parse suggested move');
            }

        } catch (error: any) {
            console.error('[PuzzleGame] Failed to get hint:', error);
            Alert.alert('Error', error.message || 'Could not get hint. Please try again.');
        } finally {
            setIsLoadingHint(false);
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <Stack.Screen options={{ headerShown: false }} />
                <NavigationHeader
                    title={`Puzzle #${id}`}
                    onBack={() => router.navigate('/puzzles')}
                />
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={Colors.light.primary} />
                    <Text style={{ marginTop: 16, color: Colors.light.textSecondary }}>
                        Loading puzzle...
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    if (!puzzle) {
        return null;
    }

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Game Over Modal */}
            <GameOverModal
                isOpen={gameOverModal.isOpen}
                result={gameOverModal.result}
                reason={gameOverModal.reason}
                message={gameOverModal.message}
                onClose={() => router.navigate('/puzzles')}
            />

            {/* Header */}
            <NavigationHeader
                title={puzzle.name || `Puzzle #${id}`}
                onBack={() => router.navigate('/puzzles')}
            />

            <View style={styles.contentContainer}>
                {/* Board Section */}
                <View style={styles.boardSection}>
                    {/* Collapsible Puzzle Goal */}
                    {puzzle.description && (
                        <TouchableOpacity
                            onPress={() => setIsGoalExpanded(!isGoalExpanded)}
                            style={{
                                backgroundColor: '#EFF6FF',
                                borderWidth: 2,
                                borderColor: '#3B82F6',
                                borderRadius: 12,
                                marginBottom: 16,
                                overflow: 'hidden',
                            }}
                        >
                            <View style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: 16,
                            }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
                                    <View style={{
                                        backgroundColor: '#3B82F6',
                                        borderRadius: 8,
                                        padding: 8,
                                        width: 36,
                                        height: 36,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}>
                                        <Ionicons name="bulb" size={20} color="#FFF" />
                                    </View>
                                    <Text style={{
                                        fontSize: 14,
                                        fontWeight: '600',
                                        color: '#1E40AF',
                                        textTransform: 'uppercase',
                                        letterSpacing: 0.5,
                                    }}>
                                        Puzzle Goal
                                    </Text>
                                </View>
                                <View style={{
                                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                    borderRadius: 6,
                                    padding: 4,
                                }}>
                                    <Ionicons
                                        name={isGoalExpanded ? "chevron-up" : "chevron-down"}
                                        size={18}
                                        color="#3B82F6"
                                    />
                                </View>
                            </View>

                            {isGoalExpanded && (
                                <View style={{
                                    paddingHorizontal: 20,
                                    paddingBottom: 16,
                                    paddingLeft: 68,
                                }}>
                                    <Text style={{
                                        fontSize: 15,
                                        color: '#1E3A8A',
                                        lineHeight: 24,
                                    }}>
                                        {puzzle.description}
                                    </Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    )}

                    {/* Chess Board */}
                    <ChessBoard
                        fen={fen}
                        onSquareClick={() => { }}
                        selectedSquare={selectedSquare}
                        checkSquare={checkSquare}
                        hintSquares={hintSquares}
                        styles={styles}
                        interactive={false}
                    />
                </View>

                {/* Sidebar */}
                <ScrollView style={styles.sidebar} showsVerticalScrollIndicator={false}>
                    {/* Server Status */}
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
                        onResign={handleResignPuzzle}
                        onPause={gameStatus === 'paused' ? handleResumeGame : handlePauseGame}
                        onHint={handleHint}
                    />

                    {/* Feedback Message */}
                    {message && (
                        <View style={{
                            padding: 16,
                            backgroundColor: message.includes('Correct') || message.includes('✓') ? '#D1FAE5' :
                                message.includes('Incorrect') || message.includes('✗') ? '#FEE2E2' :
                                    '#EFF6FF',
                            borderRadius: 16,
                            borderWidth: 1,
                            borderColor: message.includes('Correct') || message.includes('✓') ? '#10B981' :
                                message.includes('Incorrect') || message.includes('✗') ? '#EF4444' :
                                    '#3B82F6',
                            marginBottom: 16,
                        }}>
                            <Text style={{
                                color: message.includes('Correct') || message.includes('✓') ? '#065F46' :
                                    message.includes('Incorrect') || message.includes('✗') ? '#991B1B' :
                                        '#1E40AF',
                                fontWeight: '600',
                                textAlign: 'center',
                            }}>
                                {message}
                            </Text>
                        </View>
                    )}

                    {/* Camera View */}
                    <CameraView
                        mode="embedded"
                        isConnected={isConnected}
                        onExpand={() => setShowCamera(true)}
                        streamUrl={CAMERA_CONFIG.STREAM_URL}
                    />

                    {/* Move History */}
                    <MoveHistory moves={moveHistory} />
                </ScrollView>
            </View>

            {/* Camera Modal */}
            <CameraView
                mode="modal"
                visible={showCamera}
                onClose={() => setShowCamera(false)}
                isConnected={isConnected}
                streamUrl={CAMERA_CONFIG.STREAM_URL}
                title="Robot Camera"
            />
        </SafeAreaView>
    );
}
