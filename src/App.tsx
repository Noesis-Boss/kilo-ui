import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom'
import SessionsPage from './pages/SessionsPage'
import AgentsPage from './pages/AgentsPage'
import TaskRunnerPage from './pages/TaskRunnerPage'

function App() {
  return (
    <Router>
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: 20 }}>
        <nav style={{ marginBottom: 20, borderBottom: '1px solid #ccc', paddingBottom: 10 }}>
          <NavLink 
            to="/" 
            end
            style={({ isActive }) => ({ 
              marginRight: 15, 
              textDecoration: isActive ? 'underline' : 'none',
              fontWeight: isActive ? 'bold' : 'normal'
            })}
          >
            Sessions
          </NavLink>
          <NavLink 
            to="/agents" 
            style={({ isActive }) => ({ 
              marginRight: 15, 
              textDecoration: isActive ? 'underline' : 'none',
              fontWeight: isActive ? 'bold' : 'normal'
            })}
          >
            Agents
          </NavLink>
          <NavLink 
            to="/tasks" 
            style={({ isActive }) => ({ 
              textDecoration: isActive ? 'underline' : 'none',
              fontWeight: isActive ? 'bold' : 'normal'
            })}
          >
            Task Runner
          </NavLink>
        </nav>

        <Routes>
          <Route path="/" element={<SessionsPage />} />
          <Route path="/agents" element={<AgentsPage />} />
          <Route path="/tasks" element={<TaskRunnerPage />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App