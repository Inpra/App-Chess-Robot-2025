import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface GameHeaderProps {
    onBack: () => void;
    title?: string;
}

export const GameHeader: React.FC<GameHeaderProps> = ({ onBack, title = "Vs Robot Arm" }) => {
    return (
        <div className="vs-bot-header">
            <div onClick={onBack} style={{ cursor: 'pointer', padding: '8px', borderRadius: '12px', backgroundColor: '#F3F4F6' }}>
                <ArrowLeft size={24} color="var(--color-text)" />
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>{title}</h2>
            <div style={{ width: 40 }}></div>
        </div>
    );
};
