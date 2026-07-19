import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

// Layouts
import { MainLayout } from '@components/layout/MainLayout'

// Pages (placeholders - se implementarán en fases siguientes)
import Dashboard from '@pages/Dashboard'
import Login from '@pages/Login'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Ruta pública */}
          <Route 
            path="/login" 
            element={<Login onLogin={() => setIsAuthenticated(true)} />} 
          />
          
          {/* Rutas protegidas */}
          <Route 
            path="/" 
            element={isAuthenticated ? <MainLayout /> : <Navigate to="/login" />}
          >
            <Route index element={<Dashboard />} />
            
            {/* Módulos - Se implementarán en fases siguientes */}
            <Route path="academy/*" element={<div>Módulo Academia (FASE 3-4)</div>} />
            <Route path="users/*" element={<div>Módulo Usuarios (FASE 2)</div>} />
            <Route path="access" element={<div>Control de Acceso (FASE 5)</div>} />
            <Route path="settings" element={<div>Configuración (FASE 6)</div>} />
          </Route>
          
          {/* Ruta por defecto */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
