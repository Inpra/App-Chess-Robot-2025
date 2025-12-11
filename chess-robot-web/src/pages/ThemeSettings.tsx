import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../styles/ThemeSettings.css';
import chessboardBrown from '../assets/chessboard.png';
import chessboardBlue from '../assets/chessboard _blue.png';
import chessboardGray from '../assets/chessboard_gray.png';
import chessboardGreen from '../assets/chessboard_green.png';

export type BoardThemeId = 'green' | 'brown' | 'blue' | 'gray';
export type PieceStyleId = 'classic' | 'silhouette';

export interface BoardTheme {
    id: BoardThemeId;
    name: string;
    image: string;
}

export const BOARD_THEMES: Record<BoardThemeId, BoardTheme> = {
    green: { id: 'green', name: 'Green', image: chessboardGreen },
    brown: { id: 'brown', name: 'Brown', image: chessboardBrown },
    blue: { id: 'blue', name: 'Blue', image: chessboardBlue },
    gray: { id: 'gray', name: 'Gray', image: chessboardGray },
};

export default function ThemeSettings() {
    const navigate = useNavigate();
    const [boardThemeId, setBoardThemeId] = useState<BoardThemeId>('green');
    const [pieceStyleId, setPieceStyleId] = useState<PieceStyleId>('classic');

    // Load saved theme on mount
    useEffect(() => {
        try {
            const savedTheme = localStorage.getItem('game_theme');
            if (savedTheme) {
                const { boardThemeId: savedBoardTheme, pieceStyleId: savedPieceStyle } = JSON.parse(savedTheme);
                if (savedBoardTheme) setBoardThemeId(savedBoardTheme);
                if (savedPieceStyle) setPieceStyleId(savedPieceStyle);
            }
        } catch (error) {
            console.error('Failed to load saved theme:', error);
        }
    }, []);

    const handleSave = () => {
        // Save to localStorage
        localStorage.setItem('game_theme', JSON.stringify({ boardThemeId, pieceStyleId }));
        // Trigger a storage event to notify other components
        window.dispatchEvent(new Event('storage'));
        
        // Show success message
        alert('✓ Theme saved successfully!');
        
        // Navigate back
        setTimeout(() => {
            navigate('/');
        }, 500);
    };

    const renderBoardPreview = (themeId: BoardThemeId) => {
        const theme = BOARD_THEMES[themeId];
        return (
            <div className="board-preview-image">
                <img 
                    src={theme.image} 
                    alt={theme.name}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        borderRadius: '8px'
                    }}
                />
            </div>
        );
    };

    return (
        <div className="theme-settings-container">
            {/* Header */}
            <div className="theme-settings-header">
                <div onClick={() => navigate('/')} style={{ cursor: 'pointer', padding: '8px', borderRadius: '12px', backgroundColor: '#F3F4F6' }}>
                    <ArrowLeft size={24} color="var(--color-text)" />
                </div>
                <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>Game Theme</h2>
                <div style={{ width: 40 }}></div>
            </div>

            <div className="theme-settings-content">
                {/* Board Theme Section */}
                <div className="theme-section">
                    <h3 className="section-title">Board Color</h3>
                    <div className="options-grid">
                        {(Object.keys(BOARD_THEMES) as BoardThemeId[]).map((themeId) => (
                            <div
                                key={themeId}
                                className={`option-card ${boardThemeId === themeId ? 'selected-option' : ''}`}
                                onClick={() => setBoardThemeId(themeId)}
                            >
                                {renderBoardPreview(themeId)}
                                <div className={`option-label ${boardThemeId === themeId ? 'selected-label' : ''}`}>
                                    {BOARD_THEMES[themeId].name}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Piece Style Section */}
                <div className="theme-section">
                    <h3 className="section-title">Piece Style</h3>
                    <div className="options-grid">
                        <div
                            className={`option-card ${pieceStyleId === 'classic' ? 'selected-option' : ''}`}
                            onClick={() => setPieceStyleId('classic')}
                        >
                            <div className="piece-preview">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="black">
                                    <path d="M12 2C10.9 2 10 2.9 10 4C10 4.7 10.4 5.4 11 5.7V7H8C7.4 7 7 7.4 7 8V10C7 10.6 7.4 11 8 11H11V13H9C8.4 13 8 13.4 8 14V16C8 16.6 8.4 17 9 17H15C15.6 17 16 16.6 16 16V14C16 13.4 15.6 13 15 13H13V11H16C16.6 11 17 10.6 17 10V8C17 7.4 16.6 7 16 7H13V5.7C13.6 5.4 14 4.7 14 4C14 2.9 13.1 2 12 2M6 18C5.4 18 5 18.4 5 19V21C5 21.6 5.4 22 6 22H18C18.6 22 19 21.6 19 21V19C19 18.4 18.6 18 18 18H6Z" />
                                </svg>
                            </div>
                            <div className={`option-label ${pieceStyleId === 'classic' ? 'selected-label' : ''}`}>
                                Classic
                            </div>
                        </div>

                        <div
                            className={`option-card ${pieceStyleId === 'silhouette' ? 'selected-option' : ''}`}
                            onClick={() => setPieceStyleId('silhouette')}
                        >
                            <div className="piece-preview">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="black" style={{ filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.5))' }}>
                                    <path d="M12 2C10.9 2 10 2.9 10 4C10 4.7 10.4 5.4 11 5.7V7H8C7.4 7 7 7.4 7 8V10C7 10.6 7.4 11 8 11H11V13H9C8.4 13 8 13.4 8 14V16C8 16.6 8.4 17 9 17H15C15.6 17 16 16.6 16 16V14C16 13.4 15.6 13 15 13H13V11H16C16.6 11 17 10.6 17 10V8C17 7.4 16.6 7 16 7H13V5.7C13.6 5.4 14 4.7 14 4C14 2.9 13.1 2 12 2M6 18C5.4 18 5 18.4 5 19V21C5 21.6 5.4 22 6 22H18C18.6 22 19 21.6 19 21V19C19 18.4 18.6 18 18 18H6Z" />
                                </svg>
                            </div>
                            <div className={`option-label ${pieceStyleId === 'silhouette' ? 'selected-label' : ''}`}>
                                Silhouette
                            </div>
                        </div>
                    </div>
                </div>

                {/* Save Button */}
                <button className="save-button" onClick={handleSave}>
                    Save Changes
                </button>
            </div>
        </div>
    );
}
