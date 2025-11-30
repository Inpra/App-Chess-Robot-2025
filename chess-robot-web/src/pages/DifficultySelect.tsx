import { X, Leaf, Flame, Skull, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../styles/GameModeModal.css';

interface DifficultySelectProps {
    onClose: () => void;
}

const difficulties = [
    {
        id: 'easy',
        title: 'Easy',
        subtitle: 'Beginner Friendly',
        elo: 800,
        color: '#10B981', // Green
        icon: Leaf,
        description: 'Perfect for learning the basics. The AI will make occasional mistakes.',
    },
    {
        id: 'medium',
        title: 'Medium',
        subtitle: 'Casual Player',
        elo: 1500,
        color: '#F59E0B', // Amber/Orange
        icon: Flame,
        description: 'A balanced challenge. Good for practicing tactics and strategy.',
    },
    {
        id: 'hard',
        title: 'Hard',
        subtitle: 'Grandmaster Challenge',
        elo: 2400,
        color: '#EF4444', // Red
        icon: Skull,
        description: 'Test your skills against a powerful engine. Expect no mercy.',
    },
];

export default function DifficultySelect({ onClose }: DifficultySelectProps) {
    const navigate = useNavigate();

    return (
        <div className="game-modal-overlay" onClick={onClose}>
            <div className="game-modal-container" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="game-modal-header">
                    <h2 className="game-modal-title">Choose Your Opponent</h2>
                    <button onClick={onClose} className="game-modal-close-button">
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="game-modal-content">
                    <p className="game-modal-subtitle">Select a difficulty level to start the match.</p>

                    <div className="game-cards-container">
                        {difficulties.map((level) => {
                            const IconComponent = level.icon;
                            return (
                                <div
                                    key={level.id}
                                    className="game-difficulty-card"
                                    onClick={() => {
                                        navigate('/game/vs-bot', {
                                            state: {
                                                difficulty: level.id,
                                                elo: level.elo
                                            }
                                        });
                                    }}
                                >
                                    <div className="game-icon-container" style={{ backgroundColor: level.color }}>
                                        <IconComponent size={32} />
                                    </div>
                                    <div className="game-card-content">
                                        <div className="game-card-header">
                                            <h3 className="game-card-title">{level.title}</h3>
                                            <div className="game-elo-tag" style={{ backgroundColor: level.color + '20' }}>
                                                <span className="game-elo-text" style={{ color: level.color }}>
                                                    ELO {level.elo}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="game-card-subtitle">{level.subtitle}</div>
                                        <div className="game-card-description">{level.description}</div>
                                    </div>
                                    <ChevronRight size={24} className="game-card-chevron" />
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
