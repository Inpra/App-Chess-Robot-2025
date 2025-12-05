import apiClient from './apiClient';

export interface RankingUser {
    rank: number;
    userId: string;
    username: string;
    fullName?: string;
    avatarUrl?: string;
    eloRating: number;
    wins: number;
    losses: number;
    draws: number;
    totalGames: number;
    winRate: number;
}

export interface UserRankingResponse {
    success: boolean;
    userRanking: RankingUser;
    nearbyPlayers: RankingUser[];
}

export interface GlobalRankingResponse {
    success: boolean;
    rankings: RankingUser[];
}

class RankingService {
    /**
     * Get global leaderboard
     */
    async getGlobalRanking(limit: number = 100): Promise<RankingUser[]> {
        try {
            const response = await apiClient.get<GlobalRankingResponse>(
                `/Ranking/global?limit=${limit}`
            );
            return response.rankings || [];
        } catch (error) {
            console.error('Get global ranking error:', error);
            throw error;
        }
    }

    /**
     * Get current user's ranking and nearby players
     */
    async getMyRanking(): Promise<UserRankingResponse> {
        try {
            const response = await apiClient.get<UserRankingResponse>(
                '/Ranking/me'
            );
            return response;
        } catch (error) {
            console.error('Get my ranking error:', error);
            throw error;
        }
    }

    /**
     * Get specific user's ranking
     */
    async getUserRanking(userId: string, context: number = 5): Promise<UserRankingResponse> {
        try {
            const response = await apiClient.get<UserRankingResponse>(
                `/Ranking/user/${userId}?context=${context}`
            );
            return response;
        } catch (error) {
            console.error('Get user ranking error:', error);
            throw error;
        }
    }
}

const rankingService = new RankingService();
export default rankingService;
