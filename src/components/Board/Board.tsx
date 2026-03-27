import { useBoard } from '../../hooks/useBoard';
import { Column } from '../Column/Column';
import './Board.css';

export function Board() {
  const { board, addTask, deleteTask, updateTask } = useBoard();
  const sortedColumns = [...board.columns].sort((a, b) => a.order - b.order);

  return (
    <div className="board">
      <div className="board-header">
        <h1 className="board-title">{board.name}</h1>
      </div>
      <div className="board-columns">
        {sortedColumns.map((column) => (
          <Column
            key={column.id}
            column={column}
            onAddTask={addTask}
            onDeleteTask={deleteTask}
            onUpdateTask={updateTask}
          />
        ))}
      </div>
    </div>
  );
}
