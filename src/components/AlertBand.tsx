import React from 'react'
import { useAppSettings } from '@/contexts/SettingsContext'
import { AlertTriangle, ChevronRight } from 'lucide-react'

export const AlertBand: React.FC = () => {
  const { setEmergencyModalOpen } = useAppSettings()

  return (
    <div className="w-full bg-[#FDEEEE] border-b border-[#F9D6D6] text-[#992626] text-xs md:text-sm py-2 px-3 sm:px-6 sticky top-0 z-30 transition-all">
      <div className="max-w-[1200px] mx-auto flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5 font-medium">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <span className="flex items-center gap-1.5 font-bold text-[#D64545]">
            <AlertTriangle className="w-4 h-4 shrink-0 text-[#D64545]" />
            <span className="hidden sm:inline">SINAIS DE ALERTA:</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D64545]" />
            Febre ≥ 37,8°C
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D64545]" />
            Redução rápida de urina
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D64545]" />
            Inchaço súbito ou dor no enxerto
          </span>
        </div>

        <button
          onClick={() => setEmergencyModalOpen(true)}
          className="inline-flex items-center gap-1 font-bold text-[#D64545] hover:text-[#992626] hover:underline cursor-pointer ml-auto text-xs sm:text-sm py-0.5"
          type="button"
        >
          <span>→ contato de emergência</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}
