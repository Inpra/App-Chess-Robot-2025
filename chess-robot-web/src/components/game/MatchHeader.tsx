import React from 'react';
import { User, Cpu } from 'lucide-react';

interface MatchHeaderProps {
    userElo?: number;
    robotElo?: number;
    difficultyName?: string;
    timer?: string;
}

export const MatchHeader: React.FC<MatchHeaderProps> = ({
    userElo = 1200,
    robotElo = 1500,
    difficultyName = 'Medium',
    timer = '10:00'
}) => {
    return (
        <div className="vs-bot-match-header">
            {/* You (Left) */}
            <div className="vs-bot-player-side">
                <div className="avatar-container">
                    <User size={20} color="#6B7280" />
                </div>
                <div className="vs-bot-player-details">
                    <div className="vs-bot-player-name">You</div>
                    <div className="vs-bot-player-elo">{userElo}</div>
                </div>
            </div>

            {/* Score/Status (Center) */}
            <div className="vs-bot-score-container">
                <div className="vs-bot-timer-pill">
                    <div className="vs-bot-timer-text">{timer}</div>
                </div>
            </div>

            {/* Robot (Right) */}
            <div className="vs-bot-player-side-right">
                <div className="avatar-container">
                    <Cpu size={16} color="#6B7280" />
                </div>
                <div className="vs-bot-player-details-right">
                    <div className="vs-bot-player-name">Robot ({difficultyName})</div>
                    <div className="vs-bot-player-elo">{robotElo}</div>
                </div>
            </div>
        </div>
    );
};
