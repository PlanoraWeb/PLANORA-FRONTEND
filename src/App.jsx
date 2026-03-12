import KanbanBoard from './pages/KanbanBoard'
import LoginPage from './pages/LoginPage';
import "./styles/App.css";

function App() {
  return (
    <div className="App">
      
      <main>
        {/* Hazırladığımız Kanban Board'u burada sergiliyoruz */}
        <LoginPage />
      </main>
    </div>
  )
}

export default App