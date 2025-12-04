import { ChessBoard } from '../chess';
import type { BoardState } from '../chess';

interface TutorialBoardProps {
    board: BoardState;
    validMoves?: number[];
}

export const TutorialBoard = ({ board, validMoves = [] }: TutorialBoardProps) => {
    return (
        <div className="board-container">
            <div className="board-wrapper">
                <ChessBoard
                    board={board}
                    validMoves={validMoves}
                    interactive={false}
                    size="full"
                />
            </div>
        </div>
    );
};
