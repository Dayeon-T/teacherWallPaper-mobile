import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import { AuthProvider } from './context/AuthContext'
import { StyleProvider } from './context/StyleContext'
import App from './App'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <StyleProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </StyleProvider>
    </BrowserRouter>
  </StrictMode>,
)
