import { Board } from './components/Board/Board';
import { mockBoard } from './stores/mockData';
import './App.css';

function App() {
  return <Board board={mockBoard} />;
}

export default App;
