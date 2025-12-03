import { X, Trophy, Flag, Handshake } from 'lucide-react';
import '../../styles/GameOverModal.css';

interface GameOverModalProps {
    isOpen: boolean;
    result: 'win' | 'lose' | 'draw';
    reason: string;
    message: string;
    onClose: () => void;
}

export default function GameOverModal({ isOpen, result, reason, message, onClose }: GameOverModalProps) {
    if (!isOpen) return null;

    const getResultIcon = () => {
        switch (result) {
            case 'win':
                return <Trophy size={64} color="#10B981" />;
            case 'lose':
                return <Flag size={64} color="#EF4444" />;
            case 'draw':
                return <Handshake size={64} color="#F59E0B" />;
        }
    };

    const getResultTitle = () => {
        switch (result) {
            case 'win':
                return 'Victory!';
            case 'lose':
                return 'Defeat';
            case 'draw':
                return 'Draw';
        }
    };

    const getResultColor = () => {
        switch (result) {
            case 'win':
                return '#10B981';
            case 'lose':
                return '#EF4444';
            case 'draw':
                return '#F59E0B';
        }
    };

    return (
        <div className="game-over-modal-overlay">
            <div className="game-over-modal">
                {/* Close button */}
                <button 
                    className="game-over-modal-close"
                    onClick={onClose}
                    aria-label="Close"
                >
                    <X size={24} />
                </button>

                {/* Icon */}
                <div className="game-over-modal-icon">
                    {getResultIcon()}
                </div>

                {/* Title */}
                <h2 
                    className="game-over-modal-title"
                    style={{ color: getResultColor() }}
                >
                    {getResultTitle()}
                </h2>

                {/* Reason */}
                <p className="game-over-modal-reason">{reason}</p>

                {/* Message */}
                <p className="game-over-modal-message">{message}</p>

                {/* Actions */}
                <div className="game-over-modal-actions">
                    <button 
                        className="game-over-modal-button game-over-modal-button-primary"
                        onClick={onClose}
                    >
                        Back to Menu
                    </button>
                </div>
            </div>
        </div>
    );
}
