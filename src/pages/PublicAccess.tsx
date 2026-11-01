import React, { useEffect, useState, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { sharedAccessService } from '@/services/sharedAccess'
import { measurementsService } from '@/services/measurements'
import { medicationsService } from '@/services/medications'
import { appointmentsService } from '@/services/appointments'
import { labsService } from '@/services/labs'
import { settingsService } from '@/services/settings'
import type {
  SharedAccessRecord,
  MeasurementRecord,
  MedicationRecord,
  AppointmentRecord,
  LabRecord,
  SettingsRecord,
  MedicationPhase,
} from '@/types/database'
import {
  HeartPulse,
  Clock,
  Pill,
  Calendar,
  Activity,
  Droplets,
  Thermometer,
  ShieldCheck,
  AlertTriangle,
  Stethoscope,
  Users,
  CheckCircle2,
  Lock,
} from 'lucide-react'

export const PublicAccess: React.FC = () => {
  const { code } = useParams<{ code: string }>()
  const [loading, setLoading] = useState(true)
  const [access, setAccess] = useState<SharedAccessRecord | null>(null)
  const [notFound, setNotFound] = useState(false)

  // Clinical data
  const [settings, setSettings] = useState<SettingsRecord | null>(null)
  const [recentMeasurements, setRecentMeasurements] = useState<MeasurementRecord[]>([])
  const [medications, setMedications] = useState<MedicationRecord[]>([])
  const [appointments, setAppointments] = useState<AppointmentRecord[]>([])
  const [labs, setLabs] = useState<LabRecord[]>([])

  useEffect(() => {
    async function init() {
      if (!code) {
        setNotFound(true)
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const rec = await sharedAccessService.getByCode(code)
        if (!rec || !rec.active) {
          setNotFound(true)
          setLoading(false)
          return
        }

        setAccess(rec)

        // Load clinical read-only records
        const [sett, meas, meds, appts, labList] = await Promise.all([
          settingsService.getSettings(),
          measurementsService.getRecentDays(7),
          medicationsService.getActiveMedications(),
          appointmentsService.getUpcoming(),
          labsService.getAll(),
        ])

        setSettings(sett)
        setRecentMeasurements(meas)
        setMedications(meds)
        setAppointments(appts)
        setLabs(labList)
      } catch (err) {
        console.error(err)
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    }

    init()
  }, [code])

  const daysPostTransplant = useMemo(() => {
    if (!settings?.transplant_date) return null
    const t = new Date(settings.transplant_date.split('T')[0])
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - t.getTime())
    return Math.floor(diffTime / (1000 * 60 * 60 * 24))
  }, [settings?.transplant_date])

  const getTodayDose = (med: MedicationRecord): string => {
    if (!med.phases) return med.dose
    const phasesList: MedicationPhase[] = Array.isArray(med.phases)
      ? med.phases
      : typeof med.phases === 'string'
        ? JSON.parse(med.phases)
        : []
    if (phasesList.length === 0) return med.dose
    const todayStr = new Date().toISOString().split('T')[0]
    for (let i = 0; i < phasesList.length; i++) {
      const p = phasesList[i]
      if ((!p.start_date || todayStr >= p.start_date) && (!p.end_date || todayStr <= p.end_date)) {
        return p.dose
      }
    }
    return phasesList[phasesList.length - 1]?.dose || med.dose
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F6FBFA] flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <HeartPulse className="w-10 h-10 text-[#0E7C7B] animate-pulse mx-auto" />
          <p className="text-sm font-bold text-[#123332]">Carregando prontuário compartilhado...</p>
        </div>
      </div>
    )
  }

  if (notFound || !access) {
    return (
      <div className="min-h-screen bg-[#F6FBFA] flex items-center justify-center p-4">
        <div className="bg-white max-w-md w-full p-8 rounded-3xl border border-[#E3EFED] shadow-card text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#FDEEEE] text-[#D64545] flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-[#123332]">Acesso Não Encontrado ou Revogado</h1>
          <p className="text-xs text-[#5C7472]">
            O código de acesso informado ({code}) é inválido, expirou ou foi revogado pelo paciente.
          </p>
          <Link
            to="/"
            className="inline-block mt-2 px-5 py-2.5 rounded-xl bg-[#0E7C7B] text-white font-bold text-xs"
          >
            Ir para página principal
          </Link>
        </div>
      </div>
    )
  }

  const isDoctor = access.role === 'medico'

  return (
    <div className="min-h-screen bg-[#F6FBFA] text-[#123332] flex flex-col antialiased">
      {/* Top Banner indicating Shared View */}
      <div className="sticky top-0 z-30 bg-[#0E7C7B] text-white px-4 py-2.5 text-xs flex flex-col sm:flex-row items-center justify-between gap-2 shadow-sm">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 shrink-0" />
          <span className="font-semibold">
            Visualização Compartilhada — Somente Leitura (Concedido a: {access.name})
          </span>
        </div>
        <div className="flex items-center gap-2 text-[11px] opacity-90">
          <span>
            Perfil: <strong className="uppercase">{access.role}</strong>
          </span>
          <span>• Código: {access.code}</span>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1100px] w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Patient Header Card */}
        <div className="bg-white p-6 rounded-3xl border border-[#E3EFED] shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-extrabold tracking-wider text-[#0E7C7B]">
                Prontuário de Acompanhamento
              </span>
              {daysPostTransplant !== null && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#D9F2F1] text-[#0A5F5E]">
                  Dia {daysPostTransplant} pós-transplante
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#123332]">
              {settings?.patient_name || 'Mauro Gil Meger'}
            </h1>
            <p className="text-xs text-[#5C7472]">
              Hospital São Vicente • Data Tx:{' '}
              {settings?.transplant_date
                ? new Date(settings.transplant_date.split('T')[0]).toLocaleDateString('pt-BR')
                : '17/10/2026'}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#F6FBFA] border border-[#E3EFED] text-xs space-y-1 sm:text-right">
            <span className="text-[11px] text-[#5C7472] block">Telefone de Emergência</span>
            <span className="font-bold text-[#D64545] font-mono text-sm block">
              {settings?.emergency_contact_1_phone || '(41) 3111-2000'}
            </span>
            <span className="text-[10px] text-gray-500 block">
              {settings?.emergency_contact_1_name || 'Plantão de Transplante'}
            </span>
          </div>
        </div>

        {/* Section 1: Rotina do Dia de Medicamentos */}
        <section className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E3EFED] shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#123332] flex items-center gap-2">
                <Pill className="w-4 h-4 text-[#0E7C7B]" />
                Rotina de Medicamentos Vigente
              </h2>
              <p className="text-xs text-[#5C7472]">
                Lista de todos os medicamentos ativos e horários prescritos
              </p>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-[#D9F2F1] text-[#0A5F5E]">
              {medications.length} medicamentos
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {medications.map((m) => {
              const times = Array.isArray(m.times)
                ? m.times
                : typeof m.times === 'string'
                  ? JSON.parse(m.times)
                  : []
              const todayDose = getTodayDose(m)

              return (
                <div
                  key={m.id}
                  className="p-3.5 rounded-2xl bg-[#F6FBFA] border border-[#E3EFED] space-y-2 flex flex-col justify-between"
                >
                  <div>
                    <div className="font-bold text-xs text-[#123332]">{m.name}</div>
                    <div className="text-xs font-mono font-bold text-[#0E7C7B] mt-0.5">
                      Dose: {todayDose}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#E3EFED]/60 flex items-center justify-between text-[11px]">
                    <span className="text-[#5C7472]">Horários:</span>
                    <span className="font-mono font-bold text-[#123332]">{times.join(', ')}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* Section 2: Medições Clínicas Recentes */}
        <section className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E3EFED] shadow-card space-y-4">
          <div>
            <h2 className="text-base font-bold text-[#123332] flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#0E7C7B]" />
              Medições Clínicas Recentes
            </h2>
            <p className="text-xs text-[#5C7472]">
              Aferições diárias em 4 horários (PA, Pulso, Glicemia, Temperatura, Peso e Diurese)
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E3EFED] text-[#5C7472] font-extrabold uppercase tracking-wider text-[11px]">
                  <th className="pb-3 pr-2">Data</th>
                  <th className="pb-3 px-2">Horário</th>
                  <th className="pb-3 px-2">PA (mmHg)</th>
                  <th className="pb-3 px-2">FC (bpm)</th>
                  <th className="pb-3 px-2">Glicemia</th>
                  <th className="pb-3 px-2">Temp (°C)</th>
                  <th className="pb-3 px-2">Diurese (ml)</th>
                  <th className="pb-3 pl-2">Peso (kg)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E3EFED]/60">
                {recentMeasurements.slice(0, 16).map((m) => {
                  const d = new Date(m.date.split('T')[0] + 'T00:00:00')
                  const formattedD = d.toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                  })

                  return (
                    <tr key={m.id} className="hover:bg-[#F6FBFA]">
                      <td className="py-2.5 pr-2 font-bold text-[#123332] whitespace-nowrap">
                        {formattedD}
                      </td>
                      <td className="py-2.5 px-2 font-mono font-bold text-[#0E7C7B]">{m.slot}</td>
                      <td className="py-2.5 px-2 font-mono">
                        {m.systolic && m.diastolic ? `${m.systolic}/${m.diastolic}` : '—'}
                      </td>
                      <td className="py-2.5 px-2 font-mono">{m.heart_rate || '—'}</td>
                      <td className="py-2.5 px-2 font-mono">{m.glucose || '—'}</td>
                      <td className="py-2.5 px-2 font-mono">
                        {m.temperature ? m.temperature.toFixed(1) : '—'}
                      </td>
                      <td className="py-2.5 px-2 font-mono">{m.urine_ml || '—'}</td>
                      <td className="py-2.5 pl-2 font-mono font-bold">
                        {m.weight_kg ? m.weight_kg.toFixed(1) : '—'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 3: Exames Laboratoriais (Exibição Completa para Médico, Resumo para outros) */}
        {isDoctor ? (
          <section className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E3EFED] shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-[#123332] flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-[#7C5CBF]" />
                  Exames Laboratoriais — Visão Médica Detalhada
                </h2>
                <p className="text-xs text-[#5C7472]">
                  Histórico de creatinina, ureia, eletrólitos e TFG estimada
                </p>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-[#EDE9FE] text-[#7C5CBF]">
                Acesso Clínico Total
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E3EFED] text-[#5C7472] font-extrabold uppercase tracking-wider text-[11px]">
                    <th className="pb-3 pr-2">Data Exame</th>
                    <th className="pb-3 px-2">Creatinina</th>
                    <th className="pb-3 px-2">Ureia</th>
                    <th className="pb-3 px-2">Potássio</th>
                    <th className="pb-3 px-2">Sódio</th>
                    <th className="pb-3 px-2">Hb</th>
                    <th className="pb-3 px-2">TFG (mL/min)</th>
                    <th className="pb-3 pl-2">Observações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E3EFED]/60">
                  {labs.map((l) => (
                    <tr key={l.id} className="hover:bg-[#F6FBFA]">
                      <td className="py-2.5 pr-2 font-bold text-[#123332] whitespace-nowrap">
                        {new Date(l.exam_date.split('T')[0] + 'T00:00:00').toLocaleDateString(
                          'pt-BR',
                        )}
                      </td>
                      <td className="py-2.5 px-2 font-mono font-bold text-[#0E7C7B]">
                        {l.creatinine ? `${l.creatinine} mg/dL` : '—'}
                      </td>
                      <td className="py-2.5 px-2 font-mono">{l.urea || '—'}</td>
                      <td className="py-2.5 px-2 font-mono">{l.potassium || '—'}</td>
                      <td className="py-2.5 px-2 font-mono">{l.sodium || '—'}</td>
                      <td className="py-2.5 px-2 font-mono">{l.hemoglobin || '—'}</td>
                      <td className="py-2.5 px-2 font-mono font-bold">{l.gfr || '—'}</td>
                      <td className="py-2.5 pl-2 text-[#5C7472] italic truncate max-w-[200px]">
                        {l.notes || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : (
          <section className="bg-white rounded-3xl p-5 border border-[#E3EFED] shadow-card flex items-center justify-between">
            <div>
              <span className="text-xs uppercase font-extrabold tracking-wider text-[#5C7472]">
                Última Creatinina Sérica
              </span>
              <div className="text-2xl font-extrabold font-mono text-[#123332] mt-0.5">
                {labs[labs.length - 1]?.creatinine || '1.38'}{' '}
                <span className="text-sm font-normal text-[#5C7472]">mg/dL</span>
              </div>
              <span className="text-xs text-[#2E9E6B] font-semibold">
                Função do enxerto renal estável
              </span>
            </div>
            <div className="text-right text-xs text-[#5C7472]">
              <span>Visão de exames detalhados restrita a profissionais autorizados.</span>
            </div>
          </section>
        )}

        {/* Section 4: Próximas Consultas */}
        <section className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E3EFED] shadow-card space-y-4">
          <div>
            <h2 className="text-base font-bold text-[#123332] flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#0E7C7B]" />
              Próximas Consultas e Retornos
            </h2>
            <p className="text-xs text-[#5C7472]">Agendamentos médicos cadastrados</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {appointments.map((a) => (
              <div
                key={a.id}
                className="p-3.5 rounded-2xl bg-[#F6FBFA] border border-[#E3EFED] space-y-1.5"
              >
                <div className="text-xs font-bold text-[#0E7C7B]">
                  {new Date(a.date.split('T')[0] + 'T00:00:00').toLocaleDateString('pt-BR')}
                  {a.time ? ` às ${a.time}` : ''}
                </div>
                <div className="text-sm font-bold text-[#123332]">{a.title}</div>
                {a.doctor && <div className="text-xs text-[#5C7472]">{a.doctor}</div>}
                {a.location && (
                  <div className="text-[11px] text-gray-500 truncate">{a.location}</div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Read-Only Footer Note */}
        <footer className="text-center py-6 border-t border-[#E3EFED] space-y-1 text-xs text-[#5C7472]">
          <div className="flex items-center justify-center gap-1.5 font-bold text-[#123332]">
            <ShieldCheck className="w-4 h-4 text-[#0E7C7B]" />
            <span>Visualização compartilhada — somente leitura</span>
          </div>
          <p>
            Os dados apresentados são mantidos sob consentimento do paciente no prontuário digital
            pós-transplante renal.
          </p>
        </footer>
      </main>
    </div>
  )
}

export default PublicAccess
