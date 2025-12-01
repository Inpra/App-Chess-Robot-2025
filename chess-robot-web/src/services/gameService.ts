/**
 * Game API Service
 * Handles all game-related API calls
 */

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
   * Resume an existing game
   */
  async resumeGame(gameId: string): Promise<StartGameResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/Games/resume`, {
        method: 'POST',
        headers: this.getHeaders(),
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
}

// Export singleton instance
const gameService = new GameService();
export default gameService;
