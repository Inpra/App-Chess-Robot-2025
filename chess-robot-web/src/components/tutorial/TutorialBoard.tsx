import { getPieceImageSource } from '../../constants/lessonData';
import chessboardImg from '../../assets/chessboard.png';



interface TutorialBoardProps {
    board: any[];
    validMoves?: number[];
}

export const TutorialBoard = ({ board, validMoves = [] }: TutorialBoardProps) => {
    return (
        <div className="board-container">
            <div className="board-wrapper">
                {/* Board Background */}
                <div
                    style={{
                        width: '100%',
                        height: '100%',
                        backgroundImage: `url(${chessboardImg})`,
                        backgroundSize: 'cover',
                        position: 'relative'
                    }}
                >

                    {/* Grid Overlay */}
                    <div className="grid-overlay">
                        {Array.from({ length: 8 }).map((_, rowIndex) => (
                            Array.from({ length: 8 }).map((_, colIndex) => {
                                const index = rowIndex * 8 + colIndex;
                                const piece = board[index];
                                const isValidMove = validMoves.includes(index);

                                return (
                                    <div key={`${rowIndex}-${colIndex}`} className="square">
                                        {/* Possible Move Dot */}
                                        {isValidMove && (
                                            <div className="possible-move-dot" />
                                        )}

                                        {/* Piece */}
                                        {piece && (
                                            <img
                                                src={getPieceImageSource(piece.type, piece.color)}
                                                alt={`${piece.color}${piece.type}`}
                                                className="piece-image"
                                            />
                                        )}
                                    </div>
                                );
                            })
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
