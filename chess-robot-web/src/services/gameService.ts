  /**
   * Game API Service
   * Handles all game-related API calls
   */

  import { API_CONFIG, GAME_ENDPOINTS, AI_SUGGESTION_ENDPOINTS } from './apiConfig';

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

  export interface PauseGameResponse {
    gameId: string;
    status: string;
    message: string;
    savedStateId: string;
  }

  export interface ResumeGameResponse {
    gameId: string;
    requestId: string;
    status: string;
    fenStr: string;
    lastMoveId?: string;
    message: string;
    savedAt: string;
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

  export interface GetSuggestionRequest {
    gameId: string;
    fenPosition: string;
    depth?: number;
  }

  export interface SuggestionResponse {
    suggestionId: string;
    suggestedMove: string;
    suggestedMoveSan: string;
    evaluation?: number;
    confidence: number;
    bestLine: string[];
    pointsDeducted: number;
    remainingPoints: number;
    createdAt: string;
  }

  export interface SuggestionCostResponse {
    cost: number;
    description: string;
    rateLimitSeconds: number;
  }

  class GameService {
    private baseUrl: string;

    constructor() {
      this.baseUrl = API_CONFIG.BASE_URL;
    }

    /**
     * Get auth token from localStorage
     */
    private getAuthToken(): string | null {
      return localStorage.getItem('auth_token');
    }

    /**
     * Get auth headers
     */
    private getHeaders(includeAuth: boolean = true): HeadersInit {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (includeAuth) {
        const token = this.getAuthToken();
        if (token) {
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
        const response = await fetch(`${this.baseUrl}${GAME_ENDPOINTS.START}`, {
          method: 'POST',
          headers: this.getHeaders(),
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
     * Start a training puzzle game
     */
    async startPuzzleGame(puzzleId: string, difficulty: string = 'medium'): Promise<StartGameResponse> {
      try {
        const request: StartGameRequest = {
          gameTypeCode: 'training_puzzle',
          difficulty: difficulty,
          puzzleId: puzzleId
        };

        return await this.startGame(request);
      } catch (error) {
        console.error('[GameService] Start puzzle game error:', error);
        throw error;
      }
    }

    /**
     * Verify board setup
     */
    async verifyBoardSetup(request: VerifyBoardSetupRequest): Promise<BoardSetupStatusResponse> {
      try {
        const response = await fetch(`${this.baseUrl}/Games/verify-board-setup`, {
          method: 'POST',
          headers: this.getHeaders(),
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
        const response = await fetch(`${this.baseUrl}/Games/${gameId}`, {
          method: 'GET',
          headers: this.getHeaders(),
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
        const response = await fetch(`${this.baseUrl}/Games/moves`, {
          method: 'POST',
          headers: this.getHeaders(),
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
        
        const response = await fetch(`${this.baseUrl}/Games/moves/batch`, {
          method: 'POST',
          headers: this.getHeaders(),
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
        const response = await fetch(`${this.baseUrl}/Games/${gameId}/result`, {
          method: 'PUT',
          headers: this.getHeaders(),
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
        const response = await fetch(`${this.baseUrl}/Games/${gameId}/end`, {
          method: 'POST',
          headers: this.getHeaders(),
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
     * Pause the current game and save state
     */
    async pauseGame(gameId: string): Promise<PauseGameResponse> {
      try {
        const response = await fetch(`${this.baseUrl}/Games/${gameId}/pause`, {
          method: 'POST',
          headers: this.getHeaders(),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Failed to pause game');
        }

        return await response.json();
      } catch (error) {
        console.error('[GameService] Pause game error:', error);
        throw error;
      }
    }

    /**
     * Resume a paused game from saved state
     */
    async resumeGame(gameId: string): Promise<ResumeGameResponse> {
      try {
        const response = await fetch(`${this.baseUrl}/Games/${gameId}/resume`, {
          method: 'POST',
          headers: this.getHeaders(),
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
    async getPlayerGames(
      playerId: string, 
      filters?: {
        status?: string;
        result?: string;
        fromDate?: string;
        toDate?: string;
      }
    ): Promise<any[]> {
      try {
        const queryParams = new URLSearchParams();
        if (filters?.status) queryParams.append('status', filters.status);
        if (filters?.result) queryParams.append('result', filters.result);
        if (filters?.fromDate) queryParams.append('fromDate', filters.fromDate);
        if (filters?.toDate) queryParams.append('toDate', filters.toDate);
        
        const queryString = queryParams.toString();
        const url = `${this.baseUrl}/Games/player/${playerId}${queryString ? `?${queryString}` : ''}`;
        
        const response = await fetch(url, {
          method: 'GET',
          headers: this.getHeaders(),
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

    /**
     * Get AI chess move suggestion
     * Costs 5 points per suggestion
     * Rate limited: 1 request per 3 seconds
     */
    async getSuggestion(request: GetSuggestionRequest): Promise<SuggestionResponse> {
      try {
        const response = await fetch(`${this.baseUrl}${AI_SUGGESTION_ENDPOINTS.GET_SUGGESTION}`, {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify(request),
        });

        if (!response.ok) {
          const error = await response.json();
          
          // Handle specific error codes
          if (error.errorCode === 'INSUFFICIENT_POINTS') {
            throw new Error('Không đủ điểm để nhận gợi ý. Vui lòng mua thêm điểm.');
          }
          
          if (error.errorCode === 'RATE_LIMITED') {
            throw new Error('Vui lòng đợi 3 giây trước khi yêu cầu gợi ý tiếp theo.');
          }

          throw new Error(error.message || 'Failed to get AI suggestion');
        }

        return await response.json();
      } catch (error) {
        console.error('[GameService] Get suggestion error:', error);
        throw error;
      }
    }

    /**
     * Get the cost in points for AI suggestions
     */
    async getSuggestionCost(): Promise<SuggestionCostResponse> {
      try {
        const response = await fetch(`${this.baseUrl}${AI_SUGGESTION_ENDPOINTS.GET_COST}`, {
          method: 'GET',
          headers: this.getHeaders(false), // No auth required
        });

        if (!response.ok) {
          throw new Error('Failed to get suggestion cost');
        }

        return await response.json();
      } catch (error) {
        console.error('[GameService] Get suggestion cost error:', error);
        throw error;
      }
    }
  }

  // Export singleton instance
  const gameService = new GameService();
  export default gameService;
