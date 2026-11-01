/* Main App Component - Handles routing (using react-router-dom), query client and other providers */
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { SettingsProvider } from '@/contexts/SettingsContext'

import Layout from './components/Layout'
import Index from './pages/Index'
import Medicoes from './pages/Medicoes'
import Exames from './pages/Exames'
import Consultas from './pages/Consultas'
import Ajustes from './pages/Ajustes'
import NotFound from './pages/NotFound'

const App = () => (
  <BrowserRouter>
    <TooltipProvider>
      <SettingsProvider>
        <Toaster />
        <Sonner />
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Index />} />
            <Route path="/medicoes" element={<Medicoes />} />
            <Route path="/exames" element={<Exames />} />
            <Route path="/consultas" element={<Consultas />} />
            <Route path="/ajustes" element={<Ajustes />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </SettingsProvider>
    </TooltipProvider>
  </BrowserRouter>
)

export default App
