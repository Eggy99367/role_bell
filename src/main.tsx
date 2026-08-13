import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, useRoutes } from 'react-router-dom'
import routes from '~react-pages'
import Layout from './components/Layout.tsx'
import { AuthProvider } from './utils/AuthContext.tsx'
import './index.css'

function App() {
  return useRoutes([{ element: <Layout />, children: routes }])
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
