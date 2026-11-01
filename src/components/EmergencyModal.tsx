import React from 'react'
import { useAppSettings } from '@/contexts/SettingsContext'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Phone, AlertCircle, ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'

export const EmergencyModal: React.FC = () => {
  const { settings, emergencyModalOpen, setEmergencyModalOpen } = useAppSettings()

  const c1Name = settings?.emergency_contact_1_name
  const c1Phone = settings?.emergency_contact_1_phone
  const c2Name = settings?.emergency_contact_2_name
  const c2Phone = settings?.emergency_contact_2_phone

  return (
    <Dialog open={emergencyModalOpen} onOpenChange={setEmergencyModalOpen}>
      <DialogContent className="sm:max-w-[460px] p-6 rounded-3xl bg-white border border-[#E3EFED] shadow-2xl">
        <DialogHeader className="space-y-2 text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FDEEEE] flex items-center justify-center text-[#D64545]">
              <Phone className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-[#123332]">
                Contato de emergência
              </DialogTitle>
              <p className="text-xs text-[#5C7472] font-medium">
                Plantão e equipe de transplante renal
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-3 mt-4">
          {/* Contato 1 */}
          {c1Phone ? (
            <a
              href={`tel:${c1Phone.replace(/\D/g, '')}`}
              className="flex items-center justify-between p-4 rounded-2xl border border-[#E3EFED] bg-[#F6FBFA] hover:bg-[#D9F2F1]/50 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white border border-[#E3EFED] flex items-center justify-center text-[#0E7C7B] group-hover:bg-[#0E7C7B] group-hover:text-white transition-colors">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-sm text-[#123332]">
                    {c1Name || 'Contato Principal'}
                  </div>
                  <div className="text-sm font-mono font-bold text-[#0E7C7B]">{c1Phone}</div>
                </div>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#0E7C7B] text-white">
                Ligar
              </span>
            </a>
          ) : (
            <div className="p-4 rounded-2xl border border-dashed border-[#E3EFED] text-center text-xs text-[#5C7472]">
              Cadastre o contato 1 em{' '}
              <Link
                to="/ajustes"
                onClick={() => setEmergencyModalOpen(false)}
                className="text-[#0E7C7B] font-bold underline"
              >
                Ajustes
              </Link>
            </div>
          )}

          {/* Contato 2 */}
          {c2Phone ? (
            <a
              href={`tel:${c2Phone.replace(/\D/g, '')}`}
              className="flex items-center justify-between p-4 rounded-2xl border border-[#E3EFED] bg-[#F6FBFA] hover:bg-[#D9F2F1]/50 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white border border-[#E3EFED] flex items-center justify-center text-[#0E7C7B] group-hover:bg-[#0E7C7B] group-hover:text-white transition-colors">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-sm text-[#123332]">
                    {c2Name || 'Contato Secundário'}
                  </div>
                  <div className="text-sm font-mono font-bold text-[#0E7C7B]">{c2Phone}</div>
                </div>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#0E7C7B] text-white">
                Ligar
              </span>
            </a>
          ) : (
            <div className="p-4 rounded-2xl border border-dashed border-[#E3EFED] text-center text-xs text-[#5C7472]">
              Cadastre o contato 2 em{' '}
              <Link
                to="/ajustes"
                onClick={() => setEmergencyModalOpen(false)}
                className="text-[#0E7C7B] font-bold underline"
              >
                Ajustes
              </Link>
            </div>
          )}
        </div>

        <div className="mt-4 p-3.5 rounded-2xl bg-[#FDEEEE] border border-[#FAD2D2] flex items-start gap-2.5 text-xs text-[#992626]">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#D64545]" />
          <p className="leading-relaxed">
            Em caso de sintomas de alerta (febre ≥ 37,8°C, parada súbita de urina, inchaço brusco ou
            dor no local do rim transplantado), procure o plantão imediatamente.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
