import { ArrowLeft, CheckCircle, Puzzle, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../styles/Puzzles.css';

const puzzles = [
    { id: '1', title: 'Mate in 1', rating: 800, solved: true, theme: 'Checkmate' },
    { id: '2', title: 'Fork the Queen', rating: 1000, solved: false, theme: 'Tactics' },
    { id: '3', title: 'Back Rank Mate', rating: 1200, solved: false, theme: 'Checkmate' },
    { id: '4', title: 'Pin to Win', rating: 1400, solved: false, theme: 'Tactics' },
    { id: '5', title: 'Discovered Attack', rating: 1600, solved: false, theme: 'Tactics' },
    { id: '6', title: 'Endgame Magic', rating: 1800, solved: false, theme: 'Endgame' },
    { id: '7', title: 'Queen Sacrifice', rating: 2000, solved: false, theme: 'Sacrifice' },
    { id: '8', title: 'Complex Mate in 3', rating: 2200, solved: false, theme: 'Checkmate' },
];

export default function Puzzles() {
    const navigate = useNavigate();

    return (
        <div className="puzzles-container">
            <div className="puzzles-header">
                <div onClick={() => navigate('/')} style={{ cursor: 'pointer', padding: '8px' }}>
                    <ArrowLeft size={24} color="var(--color-text)" />
                </div>
                <h2 className="header-title" style={{ fontSize: '18px', margin: 0 }}>Chess Puzzles</h2>
                <div style={{ width: 40 }}></div>
            </div>

            <div className="puzzles-list-content">
                {puzzles.map((item) => (
                    <div key={item.id} className="puzzle-card">
                        <div className={`puzzle-icon-container ${item.solved ? 'solved' : ''}`}>
                            {item.solved ? (
                                <CheckCircle size={24} />
                            ) : (
                                <Puzzle size={24} />
                            )}
                        </div>
                        <div className="puzzle-info">
                            <div className="puzzle-title">{item.title}</div>
                            <div className="puzzle-meta">
                                <span className="puzzle-rating">Rating: {item.rating}</span>
                                <div className="dot" />
                                <span className="puzzle-theme">{item.theme}</span>
                            </div>
                        </div>
                        <ChevronRight size={20} color="#9CA3AF" />
                    </div>
                ))}
            </div>
        </div>
    );
}
