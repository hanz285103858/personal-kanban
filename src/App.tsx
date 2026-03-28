import { Board } from './components/Board/Board';
import { ThemeProvider } from './contexts/ThemeContext';
import './App.css';

function App() {
  return (
    <ThemeProvider>
      <Board />
    </ThemeProvider>
  );
}

export default App;
