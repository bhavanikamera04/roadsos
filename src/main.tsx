import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
import { Bystander } from './pages/Bystander'

// Add route detection before rendering App
const isBystander = window.location.pathname === '/bystander'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isBystander ? <Bystander /> : <App />}
  </StrictMode>
)
