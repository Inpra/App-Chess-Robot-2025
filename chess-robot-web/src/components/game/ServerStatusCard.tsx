import React from 'react';

interface ServerStatusCardProps {
    connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error';
}

export const ServerStatusCard: React.FC<ServerStatusCardProps> = ({ connectionStatus }) => {
    return (
        <div className="vs-bot-status-card">
            <div className="vs-bot-status-text">Server Status</div>
            <div className="vs-bot-status-indicator">
                <div className="vs-bot-dot" style={{
                    backgroundColor: connectionStatus === 'connected' ? '#10B981' :
                        connectionStatus === 'connecting' ? '#F59E0B' :
                            connectionStatus === 'error' ? '#EF4444' : '#6B7280'
                }}></div>
                <span style={{ color: 'var(--color-icon)' }}>
                    {connectionStatus === 'connected' ? 'Connected' :
                        connectionStatus === 'connecting' ? 'Connecting...' :
                            connectionStatus === 'error' ? 'Connection Error' : 'Disconnected'}
                </span>
            </div>
        </div>
    );
};
