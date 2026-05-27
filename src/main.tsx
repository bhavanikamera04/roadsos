import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { Bystander } from './pages/Bystander'

// Render either the Bystander page or the main App depending on the path
const isBystander = window.location.pathname === '/bystander'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isBystander ? <Bystander /> : <App />}
  </StrictMode>
)
