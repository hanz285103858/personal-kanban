import type { Board as BoardType } from '../../types';
import { Column } from '../Column/Column';
import './Board.css';

interface BoardProps {
  board: BoardType;
}

export function Board({ board }: BoardProps) {
  const sortedColumns = [...board.columns].sort((a, b) => a.order - b.order);

  return (
    <div className="board">
      <div className="board-header">
        <h1 className="board-title">{board.name}</h1>
      </div>
      <div className="board-columns">
        {sortedColumns.map((column) => (
          <Column key={column.id} column={column} />
        ))}
      </div>
    </div>
  );
}
