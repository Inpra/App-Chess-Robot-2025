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
import gameService from '@/services/gameService';
import wsService from '@/services/websocketService';
import { CAMERA_CONFIG } from '@/services/apiConfig';

interface Move {
    moveNumber: number;
    white: string;
    black?: string;
}

export default function VsBotScreen() {
    const dimensions = useWindowDimensions();
    const styles = useMemo(() => getGameStyles(dimensions), [dimensions]);
    const router = useRouter();
    const { elo, difficulty } = useLocalSearchParams();

    // Connection State
    const [isConnected, setIsConnected] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
    const [showCamera, setShowCamera] = useState(false);

    // Game State
    const [gameId, setGameId] = useState<string | null>(null);
    const [gameStatus, setGameStatus] = useState<'idle' | 'starting' | 'playing' | 'paused' | 'ended'>('idle');
    const [game, setGame] = useState(new Chess());
    const [fen, setFen] = useState(game.fen());
    const [selectedSquare, setSelectedSquare] = useState<{ row: number, col: number } | null>(null);
    const [possibleMoves, setPossibleMoves] = useState<{ row: number, col: number }[]>([]);
    const [checkSquare, setCheckSquare] = useState<{ row: number, col: number } | null>(null);
    const [moveHistory, setMoveHistory] = useState<Move[]>([]);
    const [gameMessage, setGameMessage] = useState<string>('Waiting to start game...');
    const [boardSetupStatus, setBoardSetupStatus] = useState<'checking' | 'correct' | 'incorrect' | null>(null);

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

    // Handle game over
    const handleGameOver = useCallback(async (data: any) => {
        console.log('[handleGameOver] ========== CALLED ==========');
        if (!gameId) return;

        const { reason, winner, message } = data;

        try {
            // Save pending moves
            if (pendingMoves.current.length > 0) {
                await savePendingMoves();
            }

            const totalMoves = game.history().length;
            const currentFen = game.fen();

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

            await gameService.updateGameResult(
                gameId,
                result,
                'completed',
                Math.ceil(totalMoves / 2),
                currentFen
            );

            setGameStatus('ended');
            setGameMessage(notificationMessage);
            Alert.alert('Game Over', notificationMessage);

        } catch (error) {
            console.error('[VsBot] Failed to update game over:', error);
            Alert.alert('Error', 'Failed to save game result.');
        }
    }, [gameId, game]);

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
                    updateMoveHistoryFromFen(data.fen_str);
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

        try {
            if (movesToSave.length === 1) {
                await gameService.saveMove(movesToSave[0]);
            } else {
                await gameService.saveMovesBatch(movesToSave[0].gameId, movesToSave);
            }
        } catch (error) {
            console.error('[VsBot] Failed to save moves:', error);
            pendingMoves.current.unshift(...movesToSave);
        }
    };

    const queueMoveForSave = useCallback((moveData: any) => {
        pendingMoves.current.push(moveData);
        if (saveTimerRef.current) clearTimeout(saveTimerRef.current);

        if (pendingMoves.current.length >= 5) {
            savePendingMoves();
        } else {
            saveTimerRef.current = setTimeout(() => {
                savePendingMoves();
            }, 3000);
        }
    }, []);

    const updateMoveHistoryFromFen = (newFen: string) => {
        if (newFen === lastProcessedFen.current) return;

        try {
            const newPosition = newFen.split(' ')[0];
            const currentPosition = game.fen().split(' ')[0];

            if (newPosition === currentPosition) return;

            // Logic to find move and update history (simplified for now)
            // In a real scenario, we'd need to diff the boards or use chess.js history if we are maintaining it correctly

            // Since we are setting game from FEN, we might lose history if we don't be careful.
            // But here we just want to update the UI list.

            // Re-calculate history from the current game object
            const history = game.history();
            const moves: Move[] = [];
            for (let i = 0; i < history.length; i += 2) {
                moves.push({
                    moveNumber: Math.floor(i / 2) + 1,
                    white: history[i],
                    black: history[i + 1]
                });
            }
            setMoveHistory(moves);
            lastProcessedFen.current = newFen;

            // Check for check
            if (game.inCheck()) {
                // Update check square
                const turn = game.turn();
                const board = game.board();
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
                            if (pendingMoves.current.length > 0) await savePendingMoves();

                            const totalMoves = game.history().length;
                            const currentFen = game.fen();

                            await gameService.updateGameResult(
                                gameId,
                                'lose',
                                'completed',
                                Math.ceil(totalMoves / 2),
                                currentFen
                            );

                            setGameStatus('ended');
                            setGameMessage('You resigned - Game Over');
                            Alert.alert('Game Over', 'You resigned the game');
                        } catch (error) {
                            console.error('[VsBot] Failed to resign:', error);
                            Alert.alert('Error', 'Failed to resign game');
                        }
                    }
                }
            ]
        );
    };

    const handleSquareClick = (row: number, col: number) => {
        // Only allow moves if game is playing
        if (gameStatus !== 'playing' && gameStatus !== 'idle') return; // Allow moving in idle for testing? Maybe not.

        // If game is idle, maybe auto-start? No, explicit start is better.
        // But for testing without robot, we might want to allow it.
        // Let's stick to strict mode: must start game first.
        if (gameStatus !== 'playing') {
            // Optional: Alert.alert('Game not started', 'Please start a new game first.');
            // But maybe we want to allow analysis?
            // For now, let's allow it but not save moves if no gameId
        }

        const squareName = getSquareName(row, col);
        const piece = game.get(squareName as any);

        if (selectedSquare) {
            const sourceSquare = getSquareName(selectedSquare.row, selectedSquare.col);

            if (selectedSquare.row === row && selectedSquare.col === col) {
                setSelectedSquare(null);
                setPossibleMoves([]);
                return;
            }

            try {
                const move = game.move({
                    from: sourceSquare,
                    to: squareName,
                    promotion: 'q'
                });

                if (move) {
                    setFen(game.fen());
                    setSelectedSquare(null);
                    setPossibleMoves([]);

                    // Queue move for save if game is active
                    if (gameId) {
                        const totalMoves = game.history().length;
                        const moveNumber = Math.ceil(totalMoves / 2);

                        queueMoveForSave({
                            gameId: gameId,
                            moveNumber: moveNumber,
                            playerColor: move.color === 'w' ? 'white' : 'black',
                            fromSquare: move.from,
                            toSquare: move.to,
                            fromPiece: `${move.color === 'w' ? 'white' : 'black'}_${move.piece}`,
                            toPiece: move.captured ? `${move.color === 'w' ? 'black' : 'white'}_${move.captured}` : undefined,
                            notation: move.san,
                            resultsInCheck: game.inCheck(),
                            fenStr: game.fen()
                        });
                    }

                    // Update history UI
                    const history = game.history();
                    const moves: Move[] = [];
                    for (let i = 0; i < history.length; i += 2) {
                        moves.push({
                            moveNumber: Math.floor(i / 2) + 1,
                            white: history[i],
                            black: history[i + 1]
                        });
                    }
                    setMoveHistory(moves);

                    // Check for check
                    if (game.inCheck()) {
                        const turn = game.turn();
                        const board = game.board();
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

                } else {
                    // Invalid move, maybe select new piece
                    if (piece && piece.color === game.turn()) {
                        setSelectedSquare({ row, col });
                        const moves = game.moves({ square: squareName as any, verbose: true });
                        setPossibleMoves(moves.map(m => {
                            const file = m.to.charCodeAt(0) - 'a'.charCodeAt(0);
                            const rank = 8 - parseInt(m.to[1]);
                            return { row: rank, col: file };
                        }));
                    } else {
                        setSelectedSquare(null);
                        setPossibleMoves([]);
                    }
                }
            } catch (e) {
                // Invalid move
                if (piece && piece.color === game.turn()) {
                    setSelectedSquare({ row, col });
                    const moves = game.moves({ square: squareName as any, verbose: true });
                    setPossibleMoves(moves.map(m => {
                        const file = m.to.charCodeAt(0) - 'a'.charCodeAt(0);
                        const rank = 8 - parseInt(m.to[1]);
                        return { row: rank, col: file };
                    }));
                } else {
                    setSelectedSquare(null);
                    setPossibleMoves([]);
                }
            }
        } else {
            if (piece && piece.color === game.turn()) {
                setSelectedSquare({ row, col });
                const moves = game.moves({ square: squareName as any, verbose: true });
                setPossibleMoves(moves.map(m => {
                    const file = m.to.charCodeAt(0) - 'a'.charCodeAt(0);
                    const rank = 8 - parseInt(m.to[1]);
                    return { row: rank, col: file };
                }));
            }
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <NavigationHeader title="Vs Robot Arm" onBack={() => router.back()} />

            <View style={styles.contentContainer}>
                {/* Board Section: Players + Board */}
                <View style={styles.boardSection}>
                    {/* Match Header Card */}
                    <View style={styles.matchHeader}>
                        {/* You (Left) */}
                        <View style={styles.playerSide}>
                            <View style={styles.avatarContainer}>
                                <Ionicons name="person" size={20} color="#6B7280" />
                            </View>
                            <View style={styles.playerDetails}>
                                <Text style={styles.playerName}>You</Text>
                                <Text style={styles.playerElo}>1200</Text>
                            </View>
                        </View>

                        {/* Score/Status (Center) */}
                        <View style={styles.scoreContainer}>
                            <View style={styles.timerPill}>
                                <Text style={styles.timerText}>
                                    {gameStatus === 'playing' ? 'Playing' :
                                        gameStatus === 'starting' ? 'Starting' :
                                            gameStatus === 'ended' ? 'Ended' : 'Idle'}
                                </Text>
                            </View>
                        </View>

                        {/* Robot (Right) */}
                        <View style={styles.playerSideRight}>
                            <View style={styles.avatarContainer}>
                                <Ionicons name="hardware-chip" size={16} color="#6B7280" />
                            </View>
                            <View style={styles.playerDetailsRight}>
                                <Text style={styles.playerName}>Robot</Text>
                                <Text style={styles.playerElo}>{elo || '1500'}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Chess Board Area */}
                    <ChessBoard
                        fen={fen}
                        onSquareClick={handleSquareClick}
                        selectedSquare={selectedSquare}
                        possibleMoves={possibleMoves}
                        checkSquare={checkSquare}
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

                        {/* Action Buttons Row: Undo, Pause, Hint */}
                        {gameStatus === 'playing' && (
                            <View style={{ flexDirection: 'row', gap: 12 }}>
                                <TouchableOpacity style={[styles.actionButton, { flex: 1 }]}>
                                    <Ionicons name="arrow-undo" size={20} color={Colors.light.text} />
                                    <Text style={styles.actionButtonText}>Undo</Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={[styles.actionButton, { flex: 1 }]}>
                                    <Ionicons name="pause" size={20} color={Colors.light.text} />
                                    <Text style={styles.actionButtonText}>Pause</Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={[styles.actionButton, { flex: 1 }]}>
                                    <Ionicons name="bulb-outline" size={20} color={Colors.light.text} />
                                    <Text style={styles.actionButtonText}>Hint</Text>
                                </TouchableOpacity>
                            </View>
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

                    {/* Move History - Always visible */}
                    <View style={styles.historyContainer}>
                        <Text style={styles.historyTitle}>Move History</Text>
                        <ScrollView
                            style={styles.historyList}
                            nestedScrollEnabled={true}
                        >
                            {moveHistory.length > 0 ? (
                                moveHistory.map((move) => (
                                    <View key={move.moveNumber} style={styles.historyItem}>
                                        <Text style={styles.historyMove}>{move.moveNumber}.</Text>
                                        <Text style={styles.historyMove}>{move.white}</Text>
                                        <Text style={styles.historyMove}>{move.black || ''}</Text>
                                    </View>
                                ))
                            ) : (
                                <Text style={{ textAlign: 'center', color: '#9CA3AF', marginTop: 20 }}>
                                    No moves yet
                                </Text>
                            )}
                        </ScrollView>
                    </View>
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
        </SafeAreaView>
    );
}
