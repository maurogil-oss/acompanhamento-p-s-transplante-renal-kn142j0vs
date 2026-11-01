import React from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Activity,
  Pill,
  Share2,
  FileText,
  Calendar,
  Settings,
  PhoneCall,
  HeartPulse,
  Sparkles,
  BookOpen,
} from 'lucide-react'
import { AlertBand } from './AlertBand'
import { EmergencyModal } from './EmergencyModal'
import { useAppSettings } from '@/contexts/SettingsContext'

const NAV_ITEMS = [
  { path: '/', label: 'Painel', icon: LayoutDashboard },
  { path: '/sobre', label: 'Sobre o Modelo', icon: Sparkles },
  { path: '/cuidados', label: 'Cuidados', icon: BookOpen },
  { path: '/medicoes', label: 'Medições', icon: Activity },
  { path: '/medicamentos', label: 'Medicamentos', icon: Pill },
  { path: '/compartilhamento', label: 'Compartilhamento', icon: Share2 },
  { path: '/exames', label: 'Exames', icon: FileText },
  { path: '/consultas', label: 'Consultas', icon: Calendar },
  { path: '/ajustes', label: 'Ajustes', icon: Settings },
]

const Layout: React.FC = () => {
  const { setEmergencyModalOpen } = useAppSettings()
  const location = useLocation()

  return (
    <div className="min-h-screen bg-[#F6FBFA] text-[#123332] flex flex-col antialiased">
      {/* Fixed Sticky Alert Band on Top of every page */}
      <AlertBand />

      {/* Mobile Top Bar (0 - 1024px) */}
      <header className="lg:hidden sticky top-[37px] z-20 bg-white/95 backdrop-blur-md border-b border-[#E3EFED] px-4 py-3 flex items-center justify-between">
        <NavLink to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#0E7C7B] flex items-center justify-center text-white shadow-sm">
            <HeartPulse className="w-5 h-5" />
          </div>
          <div className="leading-tight">
            <div className="text-[13px] font-extrabold text-[#123332]">Acompanhamento</div>
            <div className="text-[10px] uppercase font-bold tracking-wider text-[#0E7C7B]">
              Pós-Transplante Renal
            </div>
          </div>
        </NavLink>

        <button
          type="button"
          onClick={() => setEmergencyModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FDEEEE] text-[#D64545] border border-[#FAD2D2] text-xs font-bold hover:bg-[#FAD2D2] active:scale-95 transition-all"
        >
          <PhoneCall className="w-3.5 h-3.5" />
          <span>Emergência</span>
        </button>
      </header>

      {/* Main container with desktop sidebar */}
      <div className="flex-1 flex max-w-full">
        {/* Desktop Sidebar (>= 1025px) */}
        <aside className="hidden lg:flex w-[260px] flex-col fixed top-[37px] bottom-0 left-0 bg-white border-r border-[#E3EFED] z-20 px-4 py-6 justify-between">
          <div className="space-y-6">
            {/* App Mark */}
            <NavLink to="/" className="flex items-center gap-3 px-2">
              <div className="w-10 h-10 rounded-2xl bg-[#0E7C7B] flex items-center justify-center text-white shadow-md shadow-[#0E7C7B]/20">
                <HeartPulse className="w-6 h-6" />
              </div>
              <div className="leading-tight">
                <div className="text-base font-extrabold text-[#123332]">Acompanhamento</div>
                <div className="text-[11px] uppercase font-bold tracking-wider text-[#0E7C7B]">
                  Pós-Transplante Renal
                </div>
              </div>
            </NavLink>

            {/* Navigation links */}
            <nav className="space-y-1.5">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.path
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-200 ${
                      isActive
                        ? 'bg-[#0E7C7B] text-white shadow-sm shadow-[#0E7C7B]/25 font-bold'
                        : 'text-[#5C7472] hover:text-[#123332] hover:bg-[#F6FBFA]'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#5C7472]'}`} />
                    <span>{item.label}</span>
                  </NavLink>
                )
              })}
            </nav>
          </div>

          {/* Bottom Emergency Button */}
          <div className="pt-4 border-t border-[#E3EFED]">
            <button
              type="button"
              onClick={() => setEmergencyModalOpen(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-[#FDEEEE] text-[#D64545] border border-[#FAD2D2] hover:bg-[#FAD2D2] font-bold text-sm shadow-sm transition-all active:scale-[0.98]"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Emergência</span>
            </button>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 lg:pl-[260px] pb-24 lg:pb-12 w-full">
          <div className="max-w-[1200px] mx-auto p-4 sm:p-6 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile Bottom Tab Bar (fixed) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-[#E3EFED] px-2 py-2 flex items-center justify-around pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
                isActive ? 'text-[#0E7C7B] font-bold' : 'text-[#5C7472] hover:text-[#123332]'
              }`}
            >
              <div className={`p-1 rounded-xl transition-all ${isActive ? 'bg-[#D9F2F1]' : ''}`}>
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-[10px] mt-0.5">{item.label}</span>
            </NavLink>
          )
        })}
      </nav>

      {/* Emergency Modal attached to layout */}
      <EmergencyModal />
    </div>
  )
}

export default Layout
