/**
 * Training Puzzle API Service
 * Handles all training puzzle related API calls
 */

import { API_CONFIG } from './apiConfig';

export interface TrainingPuzzle {
    id: string;
    name: string;
    description?: string;
    fenStr: string;
    solutionMove: string;
    difficulty?: string;
    createdAt?: string;
}

export interface PuzzleListResponse {
    puzzles: TrainingPuzzle[];
    total: number;
}

class PuzzleService {
    private baseUrl: string;

    constructor() {
        this.baseUrl = API_CONFIG.BASE_URL;
    }

    /**
     * Get all training puzzles
     */
    async getAllPuzzles(): Promise<TrainingPuzzle[]> {
        try {
            const response = await fetch(`${this.baseUrl}/TrainingPuzzles`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Failed to get puzzles: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('[PuzzleService] Get all puzzles error:', error);
            throw error;
        }
    }

    /**
     * Get puzzles by difficulty
     */
    async getPuzzlesByDifficulty(difficulty: string): Promise<TrainingPuzzle[]> {
        try {
            const response = await fetch(`${this.baseUrl}/TrainingPuzzles/difficulty/${difficulty}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Failed to get puzzles by difficulty: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('[PuzzleService] Get puzzles by difficulty error:', error);
            throw error;
        }
    }

    /**
     * Get a random puzzle by difficulty
     */
    async getRandomPuzzle(difficulty: string): Promise<TrainingPuzzle> {
        try {
            const response = await fetch(`${this.baseUrl}/TrainingPuzzles/random/${difficulty}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Failed to get random puzzle: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('[PuzzleService] Get random puzzle error:', error);
            throw error;
        }
    }

    /**
     * Get puzzle by ID
     */
    async getPuzzleById(id: string): Promise<TrainingPuzzle> {
        try {
            const response = await fetch(`${this.baseUrl}/TrainingPuzzles/${id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Failed to get puzzle: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('[PuzzleService] Get puzzle by ID error:', error);
            throw error;
        }
    }

    /**
     * Initialize hardcoded puzzles (development only)
     */
    async initializePuzzles(): Promise<void> {
        try {
            const response = await fetch(`${this.baseUrl}/TrainingPuzzles/initialize`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Failed to initialize puzzles: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('[PuzzleService] Initialize puzzles error:', error);
            throw error;
        }
    }
}

// Export singleton instance
const puzzleService = new PuzzleService();
export default puzzleService;
