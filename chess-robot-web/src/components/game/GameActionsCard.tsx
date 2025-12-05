import React from 'react';
import { Bluetooth, Play, Pause, Lightbulb, Flag } from 'lucide-react';

interface GameActionsCardProps {
    connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error';
    isConnected: boolean;
    isStartingGame: boolean;
    gameStatus: 'idle' | 'starting' | 'playing' | 'paused' | 'ended';
    onConnect: () => void;
    onStartGame: () => void;
    onResign: () => void;
    onPause?: () => void;
    onHint?: () => void;
}

export const GameActionsCard: React.FC<GameActionsCardProps> = ({
    connectionStatus,
    isConnected,
    isStartingGame,
    gameStatus,
    onConnect,
    onStartGame,
    onResign,
    onPause,
    onHint
}) => {
    return (
        <div className="vs-bot-actions-card">
            <button
                className="vs-bot-action-button vs-bot-primary-button"
                onClick={onConnect}
                disabled={connectionStatus === 'connecting'}
            >
                <Bluetooth size={20} color="#FFF" />
                <span className="vs-bot-action-button-text vs-bot-primary-button-text">
                    {connectionStatus === 'connecting' ? 'Connecting...' :
                        isConnected ? 'Disconnect Server' : 'Connect to Server'}
                </span>
            </button>

            {/* Start Game Button */}
            <button
                className="vs-bot-action-button"
                onClick={onStartGame}
                disabled={!isConnected || isStartingGame || gameStatus === 'playing'}
                style={{
                    backgroundColor: gameStatus === 'playing' ? '#10B981' : '#3B82F6',
                    color: 'white'
                }}
            >
                <Play size={20} color="#FFF" />
                <span className="vs-bot-action-button-text" style={{ color: 'white' }}>
                    {isStartingGame ? 'Starting...' :
                        gameStatus === 'playing' ? 'Game Active' : 'Start Game'}
                </span>
            </button>

            <div className="vs-bot-action-row">
                <button 
                    className="vs-bot-action-button" 
                    style={{ flex: 1 }} 
                    onClick={onPause}
                    disabled={gameStatus !== 'playing' && gameStatus !== 'paused'}
                >
                    {gameStatus === 'paused' ? (
                        <>
                            <Play size={20} color="var(--color-text)" />
                            <span className="vs-bot-action-button-text">Resume</span>
                        </>
                    ) : (
                        <>
                            <Pause size={20} color="var(--color-text)" />
                            <span className="vs-bot-action-button-text">Pause</span>
                        </>
                    )}
                </button>

                <button className="vs-bot-action-button" style={{ flex: 1 }} onClick={onHint}>
                    <Lightbulb size={20} color="var(--color-text)" />
                    <span className="vs-bot-action-button-text">Hint</span>
                </button>
            </div>

            <button
                className="vs-bot-action-button"
                style={{ backgroundColor: '#FEF2F2' }}
                onClick={onResign}
                disabled={gameStatus !== 'playing'}
            >
                <Flag size={20} color="#EF4444" />
                <span className="vs-bot-action-button-text" style={{ color: '#EF4444' }}>Resign Game</span>
            </button>
        </div>
    );
};
