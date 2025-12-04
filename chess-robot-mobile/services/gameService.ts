/**
 * Game API Service
 * Handles all game-related API calls
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG, GAME_ENDPOINTS } from './apiConfig';

export interface StartGameRequest {
    gameTypeCode: string;
    difficulty: string;
    puzzleId?: string;
}

export interface StartGameResponse {
    gameId: string;
    requestId: string;
    gameTypeCode: string;
    difficulty: string;
    status: string;
    message: string;
}

export interface VerifyBoardSetupRequest {
    gameId: string;
}

export interface BoardSetupStatusResponse {
    status: string;
    gameId: string;
    expected?: string;
    detected?: string;
    message: string;
}

export interface SaveMoveRequest {
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
}

export interface GameMoveResponse {
    id: string;
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
    createdAt: string;
}

export interface GameStatistics {
    totalMoves: number;
    whiteMoves: number;
    blackMoves: number;
    captures: number;
    checks: number;
    averageMoveTimeSeconds: number;
    longestThinkingMove?: string;
    longestThinkingTimeSeconds: number;
}

export interface GameReplayResponse {
    gameId: string;
    playerId?: string;
    playerName?: string;
    status: string;
    result?: string;
    difficulty?: string;
    startedAt?: string;
    endedAt?: string;
    durationSeconds?: number;
    fenStart?: string;
    fenCurrent?: string;
    totalMoves?: number;
    playerRatingBefore?: number;
    playerRatingAfter?: number;
    ratingChange?: number;
    gameType?: {
        code: string;
        name: string;
        description?: string;
    };
    moves: GameMoveResponse[];
    statistics?: GameStatistics;
}

class GameService {
    private baseUrl: string;

    constructor() {
        this.baseUrl = API_CONFIG.BASE_URL;
    }

    /**
     * Get auth token from AsyncStorage
     */
    private async getAuthToken(): Promise<string | null> {
        try {
            return await AsyncStorage.getItem('auth_token');
        } catch {
            return null;
        }
    }

    /**
     * Get auth headers
     */
    private async getHeaders(includeAuth: boolean = true): Promise<HeadersInit> {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        if (includeAuth) {
            const token = await this.getAuthToken();
            if (token) {
                // @ts-ignore
                headers['Authorization'] = `Bearer ${token}`;
            }
        }

        return headers;
    }

    /**
     * Start a new game
     */
    async startGame(request: StartGameRequest): Promise<StartGameResponse> {
        try {
            const headers = await this.getHeaders();
            const response = await fetch(`${this.baseUrl}${GAME_ENDPOINTS.START}`, {
                method: 'POST',
                headers,
                body: JSON.stringify(request),
            });

            const contentType = response.headers.get('content-type');

            if (!response.ok) {
                // Try to parse error message
                if (contentType && contentType.includes('application/json')) {
                    const error = await response.json();
                    throw new Error(error.message || `Request failed with status ${response.status}`);
                } else {
                    const text = await response.text();
                    throw new Error(`Request failed with status ${response.status}: ${text.substring(0, 100)}`);
                }
            }

            // Parse successful response
            if (contentType && contentType.includes('application/json')) {
                return await response.json();
            } else {
                throw new Error('Response is not JSON format');
            }
        } catch (error) {
            console.error('[GameService] Start game error:', error);
            throw error;
        }
    }

    /**
     * Resume an existing game
     */
    async resumeGame(gameId: string): Promise<StartGameResponse> {
        try {
            const headers = await this.getHeaders();
            const response = await fetch(`${this.baseUrl}/Games/resume`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ gameId }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to resume game');
            }

            return await response.json();
        } catch (error) {
            console.error('[GameService] Resume game error:', error);
            throw error;
        }
    }

    /**
     * Verify board setup
     */
    async verifyBoardSetup(request: VerifyBoardSetupRequest): Promise<BoardSetupStatusResponse> {
        try {
            const headers = await this.getHeaders();
            const response = await fetch(`${this.baseUrl}/Games/verify-board-setup`, {
                method: 'POST',
                headers,
                body: JSON.stringify(request),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to verify board setup');
            }

            return await response.json();
        } catch (error) {
            console.error('[GameService] Verify board setup error:', error);
            throw error;
        }
    }

    /**
     * Test puzzle (no auth required)
     */
    async testPuzzle(): Promise<any> {
        try {
            const response = await fetch(`${this.baseUrl}/Games/test-puzzle`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to test puzzle');
            }

            return await response.json();
        } catch (error) {
            console.error('[GameService] Test puzzle error:', error);
            throw error;
        }
    }

    /**
     * Get game by ID
     */
    async getGame(gameId: string): Promise<any> {
        try {
            const headers = await this.getHeaders();
            const response = await fetch(`${this.baseUrl}/Games/${gameId}`, {
                method: 'GET',
                headers,
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to get game');
            }

            return await response.json();
        } catch (error) {
            console.error('[GameService] Get game error:', error);
            throw error;
        }
    }

    /**
     * Save a single move to database
     */
    async saveMove(moveData: SaveMoveRequest): Promise<GameMoveResponse> {
        try {
            const headers = await this.getHeaders();
            const response = await fetch(`${this.baseUrl}/Games/moves`, {
                method: 'POST',
                headers,
                body: JSON.stringify(moveData),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to save move');
            }

            return await response.json();
        } catch (error) {
            console.error('[GameService] Save move error:', error);
            throw error;
        }
    }

    /**
     * Get all moves for a game
     */
    async getGameMoves(gameId: string): Promise<GameMoveResponse[]> {
        try {
            const response = await fetch(`${this.baseUrl}/Games/${gameId}/moves`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to get game moves');
            }

            return await response.json();
        } catch (error) {
            console.error('[GameService] Get game moves error:', error);
            throw error;
        }
    }

    /**
     * Save multiple moves in batch
     */
    async saveMovesBatch(gameId: string, moves: SaveMoveRequest[]): Promise<GameMoveResponse[]> {
        try {
            // Ensure each move has gameId (API expects it in each move object)
            const movesWithGameId = moves.map(move => ({
                ...move,
                gameId: gameId
            }));

            const headers = await this.getHeaders();
            const response = await fetch(`${this.baseUrl}/Games/moves/batch`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    gameId: gameId,
                    moves: movesWithGameId
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to save moves');
            }

            return await response.json();
        } catch (error) {
            console.error('[GameService] Save moves batch error:', error);
            throw error;
        }
    }

    /**
     * Update game result (resign, win, lose, draw)
     * This will also send end command to AI
     */
    async updateGameResult(
        gameId: string,
        result: 'win' | 'lose' | 'draw',
        status: string = 'completed',
        totalMoves?: number,
        fenCurrent?: string
    ): Promise<any> {
        try {
            const headers = await this.getHeaders();
            const response = await fetch(`${this.baseUrl}/Games/${gameId}/result`, {
                method: 'PUT',
                headers,
                body: JSON.stringify({
                    gameId,
                    result,
                    status,
                    totalMoves,
                    fenCurrent
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to update game result');
            }

            return await response.json();
        } catch (error) {
            console.error('[GameService] Update game result error:', error);
            throw error;
        }
    }

    /**
     * End game and notify AI to reset (used when resigning or abandoning)
     */
    async endGame(gameId: string, reason: string = 'user_ended'): Promise<any> {
        try {
            const headers = await this.getHeaders();
            const response = await fetch(`${this.baseUrl}/Games/${gameId}/end`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ gameId, reason }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to end game');
            }

            return await response.json();
        } catch (error) {
            console.error('[GameService] End game error:', error);
            throw error;
        }
    }

    /**
     * Get complete game replay data (optimized for replay feature)
     */
    async getGameReplay(gameId: string): Promise<GameReplayResponse> {
        try {
            const response = await fetch(`${this.baseUrl}/Games/${gameId}/replay`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to get game replay');
            }

            return await response.json();
        } catch (error) {
            console.error('[GameService] Get game replay error:', error);
            throw error;
        }
    }

    /**
     * Get player games (match history)
     */
    async getPlayerGames(playerId: string): Promise<any[]> {
        try {
            const headers = await this.getHeaders();
            const response = await fetch(`${this.baseUrl}/Games/player/${playerId}`, {
                method: 'GET',
                headers,
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to get player games');
            }

            return await response.json();
        } catch (error) {
            console.error('[GameService] Get player games error:', error);
            throw error;
        }
    }
}

// Export singleton instance
const gameService = new GameService();
export default gameService;
