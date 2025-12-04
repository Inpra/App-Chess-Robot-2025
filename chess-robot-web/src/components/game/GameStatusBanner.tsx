import React from 'react';

interface GameStatusBannerProps {
    gameStatus: 'idle' | 'starting' | 'playing' | 'paused' | 'ended';
    boardSetupStatus: 'checking' | 'correct' | 'incorrect' | null;
    gameMessage: string;
}

export const GameStatusBanner: React.FC<GameStatusBannerProps> = () => {
    // Since we are using toasts for notifications, we don't need to display the banner anymore.
    return null;
};
