import { Chess } from 'chess.js';
import NavigationHeader from '@/components/common/NavigationHeader';
import { Colors } from '@/constants/theme';
import { getGameStyles } from '@/styles/game.styles';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { SafeAreaView, ScrollView, Text, TouchableOpacity, useWindowDimensions, View, Alert } from 'react-native';
import ChessBoard from './ChessBoard';
import CameraView from '../camera/CameraView';
import MoveHistory, { type Move } from './MoveHistory';
import MatchHeader from './MatchHeader';
import { GameOverModal } from './GameOverModal';
import gameService from '@/services/gameService';
import wsService from '@/services/websocketService';
import { CAMERA_CONFIG } from '@/services/apiConfig';

export default function VsBotScreen() {
    const dimensions = useWindowDimensions();
    const styles = useMemo(() => getGameStyles(dimensions), [dimensions]);
    const router = useRouter();
    const { elo, difficulty, resumeGameId, difficultyName } = useLocalSearchParams();

    // Connection State
    const [isConnected, setIsConnected] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
    const [showCamera, setShowCamera] = useState(false);

    // Game State
    const [gameId, setGameId] = useState<string | null>((resumeGameId as string) || null);
    const [gameStatus, setGameStatus] = useState<'idle' | 'starting' | 'playing' | 'paused' | 'ended'>((resumeGameId as string) ? 'paused' : 'idle');
    const [game, setGame] = useState(new Chess());
    const [fen, setFen] = useState(game.fen());
    // Note: selectedSquare and possibleMoves removed - players use physical board only
    const [checkSquare, setCheckSquare] = useState<{ row: number, col: number } | null>(null);
    const [moveHistory, setMoveHistory] = useState<Move[]>([]);
    const [gameMessage, setGameMessage] = useState<string>('Waiting to start game...');
    const [boardSetupStatus, setBoardSetupStatus] = useState<'checking' | 'correct' | 'incorrect' | null>(null);
    const [hintSquares, setHintSquares] = useState<{ from: number, to: number } | null>(null);
    const [isLoadingHint, setIsLoadingHint] = useState(false);
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

    // Refs
    const lastProcessedFen = useRef<string>('');
    const lastMessageHash = useRef<Map<string, string>>(new Map());
    const pendingMoves = useRef<Array<any>>([]);
    const saveTimerRef = useRef<number | null>(null);

    // Logic helpers
    const getSquareName = (row: number, col: number): string => {
        const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
        const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];
        return `${files[col]}${ranks[row]}`;
    };

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
            } else {
                setIsConnected(true);
                setConnectionStatus('connected');
            }
        };

        autoConnect();

        // Cleanup on unmount
        return () => {
            unsubscribeConnection();
            wsService.disconnect();
        };
    }, []);

    // Auto-resume game if resumeGameId is provided
    useEffect(() => {
        if (resumeGameId && gameStatus === 'paused' && isConnected) {
            console.log('[VsBot] Auto-resuming game:', resumeGameId);
            setGameMessage('Resuming paused game...');
            handleResumeGame();
        }
    }, [resumeGameId, isConnected]);

    // Handle game over
    const handleGameOver = useCallback(async (data: any) => {
        console.log('[handleGameOver] ========== CALLED ==========');
        if (!gameId) return;

        const { reason, winner, message } = data;

        try {
            // Save pending moves first
            console.log('[handleGameOver] Pending moves count:', pendingMoves.current.length);
            if (pendingMoves.current.length > 0) {
                console.log('[handleGameOver] Saving pending moves...');
                await savePendingMoves();
                console.log('[handleGameOver] ✓ Pending moves saved');
            }

            // Calculate total moves from moveHistory state (NOT game.history() which is empty when loaded from FEN)
            const totalMoves = moveHistory.reduce((sum, m) => sum + (m.black ? 2 : 1), 0);
            const currentFen = game.fen();

            console.log('[handleGameOver] Total moves:', totalMoves);
            console.log('[handleGameOver] Current FEN:', currentFen);

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

            console.log('[handleGameOver] Updating game result:', { gameId, result, totalMoves });
            await gameService.updateGameResult(
                gameId,
                result,
                'completed',
                totalMoves,  // Don't divide by 2 - totalMoves is already the actual move count
                currentFen
            );
            console.log('[handleGameOver] ✓ Game result updated');

            setGameStatus('ended');
            setGameMessage(notificationMessage);

            // Show game over modal instead of alert
            setGameOverModal({
                isOpen: true,
                result: result,
                reason: reason.charAt(0).toUpperCase() + reason.slice(1),
                message: notificationMessage
            });

        } catch (error) {
            console.error('[VsBot] Failed to update game over:', error);
            Alert.alert('Error', 'Failed to save game result.');
        }
    }, [gameId, game, moveHistory]);

    const computeMessageHash = (type: string, data: any): string => {
        return JSON.stringify({
            type,
            status: data.status,
            game_id: data.game_id,
            fen_str: data.fen_str,
            move: data.move
        });
    };

    // Handle incoming messages
    useEffect(() => {
        const unsubscribeMessage = wsService.on('message', (data) => {
            // Deduplicate messages
            if (data.type) {
                const messageHash = computeMessageHash(data.type, data);
                const lastHash = lastMessageHash.current.get(data.type);

                if (lastHash === messageHash) return;
                lastMessageHash.current.set(data.type, messageHash);
            }

            // Update board if FEN string is provided
            if (data.fen_str) {
                try {
                    // Load new FEN
                    const newGame = new Chess(data.fen_str);
                    setGame(newGame);
                    setFen(data.fen_str);
                    // Pass the NEW game object to update move history correctly
                    updateMoveHistoryFromFen(data.fen_str, newGame);
                    // Clear hint highlights when board updates
                    setHintSquares(null);
                } catch (error) {
                    console.error('[VsBot] Failed to parse FEN:', error);
                }
            }

            // Handle message types
            if (data.type === 'board_status') {
                const newStatus = data.status === 'correct' ? 'correct' : 'incorrect';
                if (boardSetupStatus !== newStatus) {
                    setBoardSetupStatus(newStatus);
                    if (data.status === 'correct') {
                        setGameMessage('Board verified - Game in progress');
                    } else {
                        setGameMessage('Waiting for correct board setup...');
                    }
                }
            } else if (data.type === 'ai_move_executed' || data.type === 'move_detected') {
                const move = data.move;
                if (move) {
                    const moveText = `${move.from_piece?.replace('_', ' ')} ${move.from} → ${move.to}`;
                    setGameMessage(`Robot moved: ${move.notation || moveText}`);
                }
            } else if (data.type === 'check_detected') {
                const playerInCheck = data.player_in_check;
                setGameMessage(`Check - ${playerInCheck} king in danger`);
            } else if (data.type === 'game_over') {
                handleGameOver(data);
            }
        });

        return () => {
            unsubscribeMessage();
        };
    }, [gameId, handleGameOver, boardSetupStatus]);

    // Cleanup pending moves
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

    const savePendingMoves = async () => {
        if (pendingMoves.current.length === 0) return;
        const movesToSave = [...pendingMoves.current];
        pendingMoves.current = [];

        console.log('[savePendingMoves] Saving', movesToSave.length, 'moves to database');
        console.log('[savePendingMoves] Moves:', movesToSave.map(m => `${m.notation} (${m.playerColor})`).join(', '));

        try {
            if (movesToSave.length === 1) {
                await gameService.saveMove(movesToSave[0]);
                console.log('[savePendingMoves] ✓ Single move saved');
            } else {
                await gameService.saveMovesBatch(movesToSave[0].gameId, movesToSave);
                console.log('[savePendingMoves] ✓ Batch saved', movesToSave.length, 'moves');
            }
        } catch (error) {
            console.error('[savePendingMoves] ✗ Failed to save moves:', error);
            pendingMoves.current.unshift(...movesToSave);
        }
    };

    const queueMoveForSave = useCallback((moveData: any) => {
        console.log('[queueMoveForSave] Queuing move:', moveData.notation, 'for', moveData.playerColor);
        pendingMoves.current.push(moveData);
        console.log('[queueMoveForSave] Queue size:', pendingMoves.current.length);

        if (saveTimerRef.current) clearTimeout(saveTimerRef.current);

        if (pendingMoves.current.length >= 5) {
            console.log('[queueMoveForSave] Queue full (5 moves), saving immediately');
            savePendingMoves();
        } else {
            console.log('[queueMoveForSave] Setting timer for 3 seconds');
            saveTimerRef.current = setTimeout(() => {
                console.log('[queueMoveForSave] Timer triggered, saving moves');
                savePendingMoves();
            }, 3000);
        }
    }, []);

    const updateMoveHistoryFromFen = (newFen: string, newGame: Chess) => {
        if (newFen === lastProcessedFen.current) return;

        try {
            // If this is the first FEN or a game reset, just update
            if (!lastProcessedFen.current || lastProcessedFen.current === 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1') {
                lastProcessedFen.current = newFen;

                // Check for check using the NEW game object
                if (newGame.inCheck()) {
                    const turn = newGame.turn();
                    const board = newGame.board();
                    for (let r = 0; r < 8; r++) {
                        for (let c = 0; c < 8; c++) {
                            const p = board[r][c];
                            if (p && p.type === 'k' && p.color === turn) {
                                setCheckSquare({ row: r, col: c });
                            }
                        }
                    }
                } else {
                    setCheckSquare(null);
                }
                return;
            }

            // Try to detect the move by comparing old and new positions
            const oldGame = new Chess(lastProcessedFen.current);
            const oldPosition = lastProcessedFen.current.split(' ')[0];
            const newPosition = newFen.split(' ')[0];

            if (oldPosition === newPosition) {
                lastProcessedFen.current = newFen;
                return;
            }

            // Find the move by trying all possible moves from old position
            const possibleMoves = oldGame.moves({ verbose: true });
            let detectedMove: any = null;

            for (const move of possibleMoves) {
                const testGame = new Chess(lastProcessedFen.current);
                testGame.move(move);
                const testPosition = testGame.fen().split(' ')[0];

                if (testPosition === newPosition) {
                    detectedMove = move;
                    break;
                }
            }

            if (detectedMove) {
                console.log('[VsBot] Move detected from FEN:', detectedMove.san);

                // 💾 Queue move for batch save to database (if game is active)
                if (gameId) {
                    setMoveHistory(prevHistory => {
                        const totalMoves = prevHistory.reduce((sum, m) => sum + (m.black ? 2 : 1), 0);
                        const moveNumber = Math.floor(totalMoves / 2) + 1;

                        // Queue move for save
                        queueMoveForSave({
                            gameId: gameId,
                            moveNumber: moveNumber,
                            playerColor: detectedMove.color === 'w' ? 'white' : 'black',
                            fromSquare: detectedMove.from,
                            toSquare: detectedMove.to,
                            fromPiece: `${detectedMove.color === 'w' ? 'white' : 'black'}_${detectedMove.piece}`,
                            toPiece: detectedMove.captured
                                ? `${detectedMove.color === 'w' ? 'black' : 'white'}_${detectedMove.captured}`
                                : undefined,
                            notation: detectedMove.san,
                            resultsInCheck: newGame.inCheck(),
                            fenStr: newFen
                        });

                        // Update UI move history
                        const newHistory = [...prevHistory];
                        const isWhiteMove = totalMoves % 2 === 0;

                        if (isWhiteMove) {
                            // Add new move pair with white move
                            newHistory.push({
                                moveNumber,
                                white: detectedMove.san,
                                black: undefined
                            });
                        } else {
                            // Update last move pair with black move
                            if (newHistory.length > 0) {
                                newHistory[newHistory.length - 1].black = detectedMove.san;
                            }
                        }

                        return newHistory;
                    });
                } else {
                    // No gameId - just update UI
                    setMoveHistory(prevHistory => {
                        const newHistory = [...prevHistory];
                        const totalMoves = prevHistory.reduce((sum, m) => sum + (m.black ? 2 : 1), 0);
                        const moveNumber = Math.floor(totalMoves / 2) + 1;
                        const isWhiteMove = totalMoves % 2 === 0;

                        if (isWhiteMove) {
                            newHistory.push({
                                moveNumber,
                                white: detectedMove.san,
                                black: undefined
                            });
                        } else {
                            if (newHistory.length > 0) {
                                newHistory[newHistory.length - 1].black = detectedMove.san;
                            }
                        }

                        return newHistory;
                    });
                }
            }

            lastProcessedFen.current = newFen;

            // Check for check using the NEW game object
            if (newGame.inCheck()) {
                const turn = newGame.turn();
                const board = newGame.board();
                for (let r = 0; r < 8; r++) {
                    for (let c = 0; c < 8; c++) {
                        const p = board[r][c];
                        if (p && p.type === 'k' && p.color === turn) {
                            setCheckSquare({ row: r, col: c });
                        }
                    }
                }
            } else {
                setCheckSquare(null);
            }

        } catch (error) {
            console.error('[VsBot] Error updating move history:', error);
        }
    };

    const handleStartGame = async () => {
        if (!isConnected) {
            Alert.alert('Connection Error', 'Please connect to server first');
            return;
        }

        try {
            setGameStatus('starting');
            if (pendingMoves.current.length > 0) await savePendingMoves();

            setMoveHistory([]);
            const newGame = new Chess();
            setGame(newGame);
            setFen(newGame.fen());
            lastProcessedFen.current = '';
            pendingMoves.current = [];
            setCheckSquare(null);

            const response = await gameService.startGame({
                gameTypeCode: 'normal_game',
                difficulty: (difficulty as string) || 'medium',
            });

            console.log('[VsBot] Game started:', response);
            setGameId(response.gameId);
            setGameStatus('playing');
            setBoardSetupStatus('checking');
            setGameMessage('Verifying board setup...');
            Alert.alert('Game Started', 'Please set up your board');

        } catch (error: any) {
            console.error('[VsBot] Failed to start game:', error);
            setGameStatus('idle');
            Alert.alert('Error', error.message || 'Failed to start game');
        }
    };

    const handleResignGame = async () => {
        if (!gameId || gameStatus !== 'playing') return;

        Alert.alert(
            'Resign Game',
            'Are you sure you want to resign?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Resign',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            // Save any pending moves first
                            if (pendingMoves.current.length > 0) {
                                await savePendingMoves();
                            }

                            // Get current game state from moveHistory (not game.history())
                            const totalMoves = moveHistory.reduce((sum, m) => sum + (m.black ? 2 : 1), 0);
                            const currentFen = game.fen();

                            console.log('[handleResignGame] Total moves:', totalMoves);

                            // Update game result in database (this also sends end command to AI)
                            await gameService.updateGameResult(
                                gameId,
                                'lose',
                                'completed',
                                totalMoves,  // Don't divide by 2
                                currentFen
                            );

                            console.log('[VsBot] ✓ Game resigned - Database updated and AI notified');

                            // Update UI
                            setGameStatus('ended');
                            setGameMessage('You resigned - Game Over');

                            // Show game over modal
                            setGameOverModal({
                                isOpen: true,
                                result: 'lose',
                                reason: 'Resignation',
                                message: 'You resigned the game'
                            });
                        } catch (error: any) {
                            console.error('[VsBot] ✗ Failed to resign game:', error);
                            Alert.alert('Error', error.message || 'Failed to resign game. Please try again.');
                        }
                    }
                }
            ]
        );
    };

    const handlePauseGame = async () => {
        if (!gameId || gameStatus !== 'playing') return;

        Alert.alert(
            'Pause Game',
            'Your progress will be saved and you can resume later from Match History.\n\nDo you want to pause this game?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Pause',
                    onPress: async () => {
                        try {
                            // Save any pending moves first
                            if (pendingMoves.current.length > 0) {
                                await savePendingMoves();
                            }

                            // Call API to pause game (saves state and sends end command to AI)
                            const response = await gameService.pauseGame(gameId);

                            console.log('[VsBot] ✓ Game paused:', response);

                            // Update UI
                            setGameStatus('paused');
                            setGameMessage('Game paused - Progress saved');

                            Alert.alert('Game Paused', '✓ Game paused! Check Match History to resume', [
                                {
                                    text: 'OK',
                                    onPress: () => router.navigate('/(tabs)')
                                }
                            ]);
                        } catch (error: any) {
                            console.error('[VsBot] ✗ Failed to pause game:', error);
                            Alert.alert('Error', error.message || 'Failed to pause game. Please try again.');
                        }
                    }
                }
            ]
        );
    };

    const handleResumeGame = async () => {
        if (!gameId || gameStatus !== 'paused') return;

        try {
            // Call API to resume game (sends resume command with saved FEN to AI)
            const response = await gameService.resumeGame(gameId);

            console.log('[VsBot] ✓ Game resumed:', response);

            // Load the saved FEN position
            if (response.fenStr) {
                const newGame = new Chess(response.fenStr);
                setGame(newGame);
                setFen(response.fenStr);
                lastProcessedFen.current = response.fenStr;

                // Rebuild move history from chess.js
                const history = newGame.history();
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
            setGameStatus('playing');
            setBoardSetupStatus('checking');
            setGameMessage('Game resumed - Set up your board to continue');
            Alert.alert('Game Resumed', '✓ Game resumed! Please set up your board');
        } catch (error: any) {
            console.error('[VsBot] ✗ Failed to resume game:', error);
            Alert.alert('Error', error.message || 'Failed to resume game. Please try again.');
        }
    };

    // Handle hint/AI suggestion
    const handleHint = async () => {
        if (!gameId || gameStatus !== 'playing') {
            Alert.alert('Cannot Get Hint', 'You can only get hints during an active game');
            return;
        }

        try {
            // Get current FEN position
            const currentFen = game.fen();

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
            const tempGame = new Chess(currentFen);
            const move = tempGame.move(suggestion.suggestedMoveSan);

            if (move) {
                // Convert chess.js square notation to board indices
                const fromIndex = squareToIndex(move.from);
                const toIndex = squareToIndex(move.to);

                // Set hint squares to highlight on board
                setHintSquares({ from: fromIndex, to: toIndex });

                console.log(`[VsBot] Hint displayed: ${suggestion.suggestedMoveSan} (from: ${move.from}, to: ${move.to})`);
                console.log(`[VsBot] Points deducted: ${suggestion.pointsDeducted}, Remaining: ${suggestion.remainingPoints}`);

                Alert.alert(
                    '💡 AI Suggestion',
                    `Suggested move: ${suggestion.suggestedMoveSan}\n\n` +
                    `Confidence: ${(suggestion.confidence * 100).toFixed(0)}%\n` +
                    `Points deducted: ${suggestion.pointsDeducted}\n` +
                    `Remaining points: ${suggestion.remainingPoints}`,
                    [{ text: 'OK' }]
                );
            } else {
                Alert.alert('Error', 'Cannot parse suggested move');
            }

        } catch (error: any) {
            console.error('[VsBot] Failed to get hint:', error);

            // Show specific error messages
            if (error.message.includes('đủ điểm') || error.message.includes('Insufficient points')) {
                Alert.alert('Insufficient Points', error.message);
            } else if (error.message.includes('đợi') || error.message.includes('rate limit')) {
                Alert.alert('Rate Limited', error.message);
            } else {
                Alert.alert('Error', 'Cannot get hint. Please try again.');
            }
        } finally {
            setIsLoadingHint(false);
        }
    };

    // Note: handleSquareClick removed - players interact with physical board only


    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <NavigationHeader title="Vs Robot Arm" onBack={() => router.back()} />

            <View style={styles.contentContainer}>
                {/* Board Section: Players + Board */}
                <View style={styles.boardSection}>
                    {/* Match Header Card */}
                    <MatchHeader
                        userElo={1200}
                        robotElo={parseInt(elo as string) || 800}
                        difficultyName={(difficulty as string) || 'Easy'}
                        timer={gameStatus === 'playing' ? '10:00' :
                            gameStatus === 'starting' ? 'Starting' :
                                gameStatus === 'ended' ? 'Ended' : 'Idle'}
                        styles={styles}
                    />

                    {/* Chess Board Area - Display Only (No interaction) */}
                    <ChessBoard
                        fen={fen}
                        onSquareClick={() => { }} // Disabled - players use physical board
                        selectedSquare={null}
                        possibleMoves={[]}
                        checkSquare={checkSquare}
                        highlightedSquares={
                            hintSquares
                                ? [
                                    {
                                        row: Math.floor(hintSquares.from / 8),
                                        col: hintSquares.from % 8,
                                        color: 'rgba(0, 150, 255, 0.4)' // Blue for from square
                                    },
                                    {
                                        row: Math.floor(hintSquares.to / 8),
                                        col: hintSquares.to % 8,
                                        color: 'rgba(0, 255, 150, 0.4)' // Green for to square
                                    }
                                ]
                                : []
                        }
                        styles={styles}
                    />
                </View>

                {/* Sidebar: Controls & Info */}
                <ScrollView
                    style={styles.sidebar}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ gap: 16 }}
                >
                    {/* Server Status Card */}
                    <View style={styles.statusCard}>
                        <Text style={styles.statusTitle}>Server Status</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 }}>
                            <View style={[
                                styles.statusDot,
                                {
                                    backgroundColor: connectionStatus === 'connected' ? '#10B981' :
                                        connectionStatus === 'connecting' ? '#F59E0B' :
                                            connectionStatus === 'error' ? '#EF4444' : '#6B7280'
                                }
                            ]} />
                            <Text style={[
                                styles.statusText,
                                {
                                    color: connectionStatus === 'connected' ? '#059669' :
                                        connectionStatus === 'connecting' ? '#D97706' :
                                            connectionStatus === 'error' ? '#DC2626' : '#6B7280'
                                }
                            ]}>
                                {connectionStatus === 'connected' ? 'Connected' :
                                    connectionStatus === 'connecting' ? 'Connecting...' :
                                        connectionStatus === 'error' ? 'Connection Error' : 'Disconnected'}
                            </Text>
                        </View>
                    </View>

                    {/* Robot Camera (Embedded) */}
                    <CameraView
                        mode="embedded"
                        isConnected={isConnected}
                        onExpand={() => setShowCamera(true)}
                        streamUrl={CAMERA_CONFIG.STREAM_URL}
                    />

                    {/* Game Actions */}
                    <View style={styles.actionsCard}>
                        {/* Connect to Server Button */}
                        <TouchableOpacity
                            style={[styles.actionButton, styles.primaryButton]}
                            onPress={async () => {
                                if (isConnected) {
                                    console.log('[VsBot] Disconnecting from server...');
                                    wsService.disconnect();
                                    Alert.alert('Disconnected', 'Successfully disconnected from server');
                                } else {
                                    try {
                                        console.log('[VsBot] Attempting to connect to server...');
                                        console.log('[VsBot] WebSocket URL:', 'ws://10.17.0.187:8081/');
                                        setConnectionStatus('connecting');
                                        await wsService.connect();
                                        console.log('[VsBot] ✓ Connection successful!');
                                        Alert.alert('Connected', 'Successfully connected to server!');
                                    } catch (error: any) {
                                        console.error('[VsBot] ✗ Connection failed:', error);
                                        console.error('[VsBot] Error details:', error.message);
                                        setConnectionStatus('error');
                                        Alert.alert(
                                            'Connection Error',
                                            `Failed to connect to server.\n\nError: ${error.message || 'Unknown error'}\n\nMake sure:\n• Server is running on ws://10.17.0.187:8081/\n• Your device is on the same network\n• Firewall allows WebSocket connections`
                                        );
                                    }
                                }
                            }}
                        >
                            <Ionicons name={isConnected ? "bluetooth" : "bluetooth-outline"} size={20} color="#FFF" />
                            <Text style={[styles.actionButtonText, styles.primaryButtonText]}>
                                {isConnected ? 'Disconnect Server' : 'Connect to Server'}
                            </Text>
                        </TouchableOpacity>

                        {/* Start Game Button - Always visible */}
                        <TouchableOpacity
                            style={[
                                styles.actionButton,
                                styles.primaryButton,
                                (gameStatus === 'playing' || gameStatus === 'starting') && { opacity: 0.5 }
                            ]}
                            onPress={handleStartGame}
                            disabled={gameStatus === 'playing' || gameStatus === 'starting'}
                        >
                            <Ionicons name="play" size={20} color="#FFF" />
                            <Text style={[styles.actionButtonText, styles.primaryButtonText]}>
                                Start Game
                            </Text>
                        </TouchableOpacity>

                        {/* Hint Button */}
                        {gameStatus === 'playing' && (
                            <TouchableOpacity
                                style={[styles.actionButton, isLoadingHint && { opacity: 0.5 }]}
                                onPress={handleHint}
                                disabled={isLoadingHint}
                            >
                                <Ionicons name="bulb-outline" size={20} color={Colors.light.text} />
                                <Text style={styles.actionButtonText}>
                                    {isLoadingHint ? 'Loading...' : 'Get Hint'}
                                </Text>
                            </TouchableOpacity>
                        )}

                        {/* Pause Game Button */}
                        {gameStatus === 'playing' && (
                            <TouchableOpacity
                                style={[styles.actionButton, { backgroundColor: '#F3F4F6' }]}
                                onPress={handlePauseGame}
                            >
                                <Ionicons name="pause" size={20} color="#8B5CF6" />
                                <Text style={[styles.actionButtonText, { color: '#8B5CF6' }]}>
                                    Pause Game
                                </Text>
                            </TouchableOpacity>
                        )}

                        {/* Resume Game Button */}
                        {gameStatus === 'paused' && (
                            <TouchableOpacity
                                style={[styles.actionButton, { backgroundColor: '#F0FDF4' }]}
                                onPress={handleResumeGame}
                            >
                                <Ionicons name="play" size={20} color="#10B981" />
                                <Text style={[styles.actionButtonText, { color: '#10B981' }]}>
                                    Resume Game
                                </Text>
                            </TouchableOpacity>
                        )}

                        {/* Resign Game Button */}
                        {gameStatus === 'playing' && (
                            <TouchableOpacity
                                style={[styles.actionButton, { backgroundColor: '#FEF2F2' }]}
                                onPress={handleResignGame}
                            >
                                <Ionicons name="flag" size={20} color="#EF4444" />
                                <Text style={[styles.actionButtonText, { color: '#EF4444' }]}>
                                    Resign Game
                                </Text>
                            </TouchableOpacity>
                        )}

                        {/* Status Message */}
                        <Text style={{ marginTop: 12, textAlign: 'center', color: '#6B7280', fontSize: 12 }}>
                            {gameMessage}
                        </Text>
                    </View>

                    {/* Move History - Component */}
                    <MoveHistory moves={moveHistory} />
                </ScrollView>
            </View>

            <CameraView
                mode="modal"
                visible={showCamera}
                onClose={() => setShowCamera(false)}
                isConnected={isConnected}
                streamUrl={CAMERA_CONFIG.STREAM_URL}
                title="Robot Camera"
            />

            {/* Game Over Modal */}
            <GameOverModal
                isOpen={gameOverModal.isOpen}
                result={gameOverModal.result}
                reason={gameOverModal.reason}
                message={gameOverModal.message}
                onClose={() => setGameOverModal({ ...gameOverModal, isOpen: false })}
            />
        </SafeAreaView>
    );
}
