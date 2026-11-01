/* Main App Component - Handles routing (using react-router-dom), query client and other providers */
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { SettingsProvider } from '@/contexts/SettingsContext'

import { useState, useMemo } from 'react'
import { LgpdConsentModal } from './components/LgpdConsentModal'
import { useAppSettings } from './contexts/SettingsContext'
import Layout from './components/Layout'
import Index from './pages/Index'
import Medicoes from './pages/Medicoes'
import Medicamentos from './pages/Medicamentos'
import Compartilhamento from './pages/Compartilhamento'
import Exames from './pages/Exames'
import Consultas from './pages/Consultas'
import Ajustes from './pages/Ajustes'
import SobreModelo from './pages/SobreModelo'
import Cuidados from './pages/Cuidados'
import PublicAccess from './pages/PublicAccess'
import NotFound from './pages/NotFound'

const AppContent: React.FC = () => {
  const { settings, loading, acceptConsent } = useAppSettings()
  const [submittingConsent, setSubmittingConsent] = useState(false)

  // O consentimento é verificado pelo banco de dados OU localStorage
  const hasAccepted = useMemo(() => {
    if (typeof window === 'undefined') return true
    const localConsent = localStorage.getItem('pos_transplante_consent_accepted_at')
    if (localConsent) return true
    if (settings?.consent_accepted_at) return true
    return false
  }, [settings?.consent_accepted_at])

  const showConsentModal = !loading && !hasAccepted

  const handleAccept = async () => {
    setSubmittingConsent(true)
    await acceptConsent()
    setSubmittingConsent(false)
  }

  return (
    <>
      <Toaster />
      <Sonner />
      <Routes>
        {/* Public read-only route without Layout menu and without LGPD modal */}
        <Route path="/acesso/:code" element={<PublicAccess />} />

        {/* Regular App Routes with Layout */}
        <Route element={<Layout />}>
          <Route path="/" element={<Index />} />
          <Route path="/sobre" element={<SobreModelo />} />
          <Route path="/cuidados" element={<Cuidados />} />
          <Route path="/medicoes" element={<Medicoes />} />
          <Route path="/medicamentos" element={<Medicamentos />} />
          <Route path="/compartilhamento" element={<Compartilhamento />} />
          <Route path="/exames" element={<Exames />} />
          <Route path="/consultas" element={<Consultas />} />
          <Route path="/ajustes" element={<Ajustes />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>

      {/* LGPD Consent Modal for the patient - shown only on normal routes if not yet accepted */}
      <LgpdConsentModal
        open={showConsentModal}
        onAccept={handleAccept}
        loading={submittingConsent}
      />
    </>
  )
}

const App = () => (
  <BrowserRouter>
    <TooltipProvider>
      <SettingsProvider>
        <AppContent />
      </SettingsProvider>
    </TooltipProvider>
  </BrowserRouter>
)

export default App
