import '../../styles/MoveHistory.css';

export interface Move {
    moveNumber: number;
    white?: string;
    black?: string;
}

export interface MoveHistoryProps {
    moves: Move[];
    className?: string;
}

export const MoveHistory = ({ moves, className = '' }: MoveHistoryProps) => {
    return (
        <div className={`move-history-container ${className}`}>
            <div className="move-history-title">Move History</div>
            <div className="move-history-list">
                {moves.length === 0 ? (
                    <div className="move-history-empty">
                        <span>No moves yet</span>
                    </div>
                ) : (
                    moves.map((move) => (
                        <div key={move.moveNumber} className="move-history-item">
                            <span className="move-history-number">{move.moveNumber}.</span>
                            <span className="move-history-move">
                                {move.white || '...'}
                            </span>
                            <span className="move-history-move">
                                {move.black || '...'}
                            </span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default MoveHistory;
