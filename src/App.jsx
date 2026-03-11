import KanbanBoard from './pages/KanbanBoard'
import "./styles/App.css";

function App() {
  return (
    <div className="App">
      <header style={{ 
        padding: '20px', 
        textAlign: 'center', 
        backgroundColor: '#282c34', 
        color: 'white',
        marginBottom: '20px' 
      }}>
        <h1>Planora - Proje Takip Paneli</h1>
      </header>
      
      <main>
        {/* Hazırladığımız Kanban Board'u burada sergiliyoruz */}
        <KanbanBoard />
      </main>
    </div>
  )
}

export default App