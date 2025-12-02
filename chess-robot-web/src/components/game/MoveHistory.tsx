import { useEffect, useRef } from 'react';
import '../../styles/MoveHistory.css';

export interface Move {
    moveNumber: number;
    white?: string;
    black?: string;
}

export interface MoveHistoryProps {
    moves: Move[];
    className?: string;
    currentMoveIndex?: number;
    onMoveClick?: (index: number) => void;
}

export const MoveHistory = ({ moves, className = '', currentMoveIndex = -1, onMoveClick }: MoveHistoryProps) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to active move
    useEffect(() => {
        if (currentMoveIndex > 0 && scrollRef.current) {
            const activeElement = scrollRef.current.querySelector('.move-history-move.active');
            if (activeElement) {
                activeElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }
    }, [currentMoveIndex]);

    return (
        <div className={`move-history-container ${className}`}>
            <div className="move-history-title">Move History</div>
            <div className="move-history-list" ref={scrollRef}>
                {moves.length === 0 ? (
                    <div className="move-history-empty">
                        <span>No moves yet</span>
                    </div>
                ) : (
                    moves.map((move) => {
                        const whiteIndex = (move.moveNumber - 1) * 2 + 1;
                        const blackIndex = (move.moveNumber - 1) * 2 + 2;

                        return (
                            <div key={move.moveNumber} className="move-history-item">
                                <span className="move-history-number">{move.moveNumber}.</span>
                                <span 
                                    className={`move-history-move ${currentMoveIndex === whiteIndex ? 'active' : ''} ${onMoveClick ? 'clickable' : ''}`}
                                    onClick={() => onMoveClick && move.white && onMoveClick(whiteIndex)}
                                >
                                    {move.white || '...'}
                                </span>
                                <span 
                                    className={`move-history-move ${currentMoveIndex === blackIndex ? 'active' : ''} ${onMoveClick ? 'clickable' : ''}`}
                                    onClick={() => onMoveClick && move.black && onMoveClick(blackIndex)}
                                >
                                    {move.black || '...'}
                                </span>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default MoveHistory;
