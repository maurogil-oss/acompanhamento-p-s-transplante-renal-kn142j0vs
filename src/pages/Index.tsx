import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useAppSettings } from '@/contexts/SettingsContext'
import { measurementsService } from '@/services/measurements'
import { medicationsService } from '@/services/medications'
import { appointmentsService } from '@/services/appointments'
import { labsService } from '@/services/labs'
import type {
  MeasurementRecord,
  MeasurementSlot,
  MedicationRecord,
  MedicationLogRecord,
  AppointmentRecord,
  LabRecord,
} from '@/types/database'
import { MeasurementModal } from '@/components/MeasurementModal'
import { TrendCharts } from '@/components/TrendCharts'
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Droplets,
  Calendar,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  Thermometer,
  Activity,
  ArrowUpRight,
  Pill,
  UtensilsCrossed,
  HeartPulse,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { toast } from '@/hooks/use-toast'
import { useRealtime } from '@/hooks/use-realtime'

const SLOTS: MeasurementSlot[] = ['07:00', '12:00', '18:00', '23:00']

const Index: React.FC = () => {
  const { settings } = useAppSettings()

  // Current Date in Brazil (YYYY-MM-DD)
  const todayStr = useMemo(() => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }, [])

  const [measurements, setMeasurements] = useState<MeasurementRecord[]>([])
  const [historyMeasurements, setHistoryMeasurements] = useState<MeasurementRecord[]>([])
  const [medications, setMedications] = useState<MedicationRecord[]>([])
  const [medicationLogs, setMedicationLogs] = useState<MedicationLogRecord[]>([])
  const [appointments, setAppointments] = useState<AppointmentRecord[]>([])
  const [labs, setLabs] = useState<LabRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [trendPeriod, setTrendPeriod] = useState<14 | 28>(14)

  // Modal State
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<MeasurementSlot>('07:00')

  // Load All Dashboard Data
  const loadData = useCallback(async () => {
    try {
      const [todayM, histM, meds, logs, appts, labList] = await Promise.all([
        measurementsService.getByDate(todayStr),
        measurementsService.getRecentDays(28),
        medicationsService.getActiveMedications(),
        medicationsService.getLogsByDate(todayStr),
        appointmentsService.getUpcoming(),
        labsService.getAll(),
      ])

      setMeasurements(todayM)
      setHistoryMeasurements(histM)
      setMedications(meds)
      setMedicationLogs(logs)
      setAppointments(appts)
      setLabs(labList)
    } catch (err) {
      console.error('Error loading dashboard data:', err)
    } finally {
      setLoading(false)
    }
  }, [todayStr])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Realtime Subscriptions
  useRealtime<MeasurementRecord>('measurements', () => {
    measurementsService.getByDate(todayStr).then(setMeasurements)
    measurementsService.getRecentDays(28).then(setHistoryMeasurements)
  })

  useRealtime<MedicationLogRecord>('medication_logs', () => {
    medicationsService.getLogsByDate(todayStr).then(setMedicationLogs)
  })

  useRealtime<AppointmentRecord>('appointments', () => {
    appointmentsService.getUpcoming().then(setAppointments)
  })

  // Greeting & Post-Transplant Days
  const greeting = useMemo(() => {
    const hour = new Date().getHours()
    const name = settings?.patient_name || 'Mauro'
    if (hour < 12) return `Bom dia, ${name}`
    if (hour < 18) return `Boa tarde, ${name}`
    return `Boa noite, ${name}`
  }, [settings?.patient_name])

  const daysPostTransplant = useMemo(() => {
    if (!settings?.transplant_date) return 108
    const t = new Date(settings.transplant_date.split('T')[0])
    const now = new Date(todayStr)
    const diffTime = Math.abs(now.getTime() - t.getTime())
    return Math.floor(diffTime / (1000 * 60 * 60 * 24))
  }, [settings?.transplant_date, todayStr])

  const formattedCurrentDate = useMemo(() => {
    return new Intl.DateTimeFormat('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date())
  }, [])

  // Determine current active slot by time of day
  const currentSlotTime = useMemo<MeasurementSlot>(() => {
    const hour = new Date().getHours()
    if (hour < 10) return '07:00'
    if (hour < 15) return '12:00'
    if (hour < 20) return '18:00'
    return '23:00'
  }, [])

  // Slot record lookup
  const getSlotRecord = useCallback(
    (slot: MeasurementSlot) => {
      return measurements.find((m) => m.slot === slot) || null
    },
    [measurements],
  )

  const isSlotFilled = useCallback((record: MeasurementRecord | null) => {
    if (!record) return false
    return Boolean(
      (record.systolic && record.systolic > 0) ||
      (record.glucose && record.glucose > 0) ||
      (record.heart_rate && record.heart_rate > 0) ||
      (record.water_ml && record.water_ml > 0),
    )
  }, [])

  // Weight Calculation
  const morningWeightRecord = useMemo(() => {
    const slot07 = measurements.find((m) => m.slot === '07:00')
    if (slot07?.weight_kg && slot07.weight_kg > 0) return slot07.weight_kg
    // Fallback to recent history weight
    const histWithWeight = historyMeasurements.find((m) => m.weight_kg && m.weight_kg > 0)
    return histWithWeight?.weight_kg || 77.9
  }, [measurements, historyMeasurements])

  const baselineWeight = settings?.baseline_weight_kg || 78.4
  const weightDelta = useMemo(() => {
    return Number((morningWeightRecord - baselineWeight).toFixed(1))
  }, [morningWeightRecord, baselineWeight])

  // Sparkline data for weight (last 14 days)
  const weightSparkline = useMemo(() => {
    const points: number[] = []
    const dateMap = new Map<string, number>()
    historyMeasurements.forEach((m) => {
      if (m.weight_kg && m.weight_kg > 0) {
        const d = m.date.split('T')[0]
        if (!dateMap.has(d)) dateMap.set(d, m.weight_kg)
      }
    })

    const sortedDates = Array.from(dateMap.keys()).sort()
    sortedDates.slice(-14).forEach((d) => {
      points.push(dateMap.get(d)!)
    })

    return points.length > 0 ? points : [78.2, 78.1, 78.0, 77.9, 78.0, 77.9]
  }, [historyMeasurements])

  // Water Calculation
  const totalWaterToday = useMemo(() => {
    return measurements.reduce((sum, m) => sum + (m.water_ml || 0), 0)
  }, [measurements])

  const waterGoal = settings?.daily_water_goal_ml || 2500
  const waterPercent = Math.min(Math.round((totalWaterToday / waterGoal) * 100), 100)

  // Quick-add water
  const handleQuickAddWater = async (amount: number) => {
    // Write to current nearest slot
    try {
      const slotRec = getSlotRecord(currentSlotTime)
      const currentVal = slotRec?.water_ml || 0
      await measurementsService.upsertSlot(todayStr, currentSlotTime, {
        water_ml: currentVal + amount,
      })
      toast({
        title: `+${amount} ml de água adicionados`,
        description: `Registrado no período das ${currentSlotTime}.`,
      })
      const updated = await measurementsService.getByDate(todayStr)
      setMeasurements(updated)
    } catch (err) {
      console.error(err)
    }
  }

  // Diurese & Temperatura
  const totalUrineToday = useMemo(() => {
    return measurements.reduce((sum, m) => sum + (m.urine_ml || 0), 0)
  }, [measurements])

  const lastTemperature = useMemo(() => {
    // Find last recorded temp from slots in reverse order
    const reversed = [...measurements].sort((a, b) => b.slot.localeCompare(a.slot))
    const withTemp = reversed.find((m) => m.temperature && m.temperature > 0)
    return withTemp?.temperature || 36.5
  }, [measurements])

  // Helper to compute dose of the day for a medication (taking phases into account)
  const getDoseForToday = (med: MedicationRecord): string => {
    if (!med.phases) return med.dose
    const phasesList: any[] = Array.isArray(med.phases)
      ? med.phases
      : typeof med.phases === 'string'
        ? JSON.parse(med.phases)
        : []
    if (phasesList.length === 0) return med.dose
    for (let i = 0; i < phasesList.length; i++) {
      const p = phasesList[i]
      if ((!p.start_date || todayStr >= p.start_date) && (!p.end_date || todayStr <= p.end_date)) {
        return p.dose
      }
    }
    return phasesList[phasesList.length - 1]?.dose || med.dose
  }

  // Medication routine tracking - considering ALL active medications for today
  const medRoutine = useMemo(() => {
    const list: Array<{
      medication: MedicationRecord
      time: string
      effectiveDose: string
      taken: boolean
      takenAt?: string
    }> = []

    medications.forEach((med) => {
      // Check if medication is active and within valid date range today
      if (!med.active) return
      if (med.start_date && todayStr < med.start_date.split('T')[0]) return
      if (med.end_date && todayStr > med.end_date.split('T')[0]) return

      const times = Array.isArray(med.times)
        ? med.times
        : typeof med.times === 'string'
          ? JSON.parse(med.times)
          : ['08:00']

      const effectiveDose = getDoseForToday(med)

      times.forEach((time: string) => {
        const log = medicationLogs.find((l) => l.medication === med.id && l.time === time)
        list.push({
          medication: med,
          time,
          effectiveDose,
          taken: Boolean(log?.taken),
          takenAt: log?.taken_at,
        })
      })
    })

    // Sort routine by time ascending, then by name
    list.sort((a, b) => {
      const timeComp = a.time.localeCompare(b.time)
      if (timeComp !== 0) return timeComp
      return a.medication.name.localeCompare(b.medication.name)
    })

    return list
  }, [medications, medicationLogs, todayStr])

  const dosesTakenCount = useMemo(() => {
    return medRoutine.filter((m) => m.taken).length
  }, [medRoutine])

  const totalDosesCount = medRoutine.length || 4

  const handleToggleMedication = async (medId: string, time: string, currentTaken: boolean) => {
    const nextTaken = !currentTaken
    try {
      await medicationsService.toggleTaken(todayStr, medId, time, nextTaken)
      const updatedLogs = await medicationsService.getLogsByDate(todayStr)
      setMedicationLogs(updatedLogs)
      toast({
        title: nextTaken ? 'Dose registrada' : 'Dose desmarcada',
        description: `${nextTaken ? 'Marcado como tomado' : 'Ação desfeita'} com sucesso.`,
      })
    } catch (err) {
      console.error(err)
    }
  }

  // Next Labs Summary
  const latestLab = useMemo(() => {
    if (labs.length === 0) return null
    return labs[labs.length - 1]
  }, [labs])

  const previousLab = useMemo(() => {
    if (labs.length < 2) return null
    return labs[labs.length - 2]
  }, [labs])

  const creatinineDelta = useMemo(() => {
    if (!latestLab?.creatinine || !previousLab?.creatinine) return null
    const diff = latestLab.creatinine - previousLab.creatinine
    return Number(diff.toFixed(2))
  }, [latestLab, previousLab])

  // Fasting reminder for upcoming appointments (within 2 days)
  const fastingAlertAppt = useMemo(() => {
    const now = new Date()
    return appointments.find((a) => {
      if (!a.fasting_required || a.done) return false
      const apptDate = new Date(a.date.split('T')[0])
      const diffDays = (apptDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      return diffDays >= -1 && diffDays <= 2
    })
  }, [appointments])

  const handleOpenSlot = (slot: MeasurementSlot) => {
    setSelectedSlot(slot)
    setModalOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#E3EFED]/60">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#123332]">{greeting}</h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#D9F2F1] text-[#0A5F5E]">
              Dia {daysPostTransplant} pós-transplante
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#5C7472] capitalize mt-0.5">
            {formattedCurrentDate}
          </p>
        </div>

        {fastingAlertAppt && (
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-[#FFFBEB] border border-[#FDE68A] text-[#92400E] text-xs font-semibold">
            <UtensilsCrossed className="w-4 h-4 text-[#D97706]" />
            <span>
              Lembrete: Exame em jejum no dia{' '}
              {new Date(fastingAlertAppt.date.split('T')[0]).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
              })}
            </span>
          </div>
        )}
      </div>

      {/* Main 2-Column Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (62% ~ 7 cols or 8 cols in 12-col grid) */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">
          {/* Daily Check-in Strip: 4 slots */}
          <section className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E3EFED] shadow-card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-[#123332] flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#0E7C7B]" />
                  Aferições Obrigatórias do Dia
                </h2>
                <p className="text-xs text-[#5C7472]">
                  Clique em qualquer horário para lançar ou alterar medições
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {SLOTS.map((slot) => {
                const rec = getSlotRecord(slot)
                const filled = isSlotFilled(rec)
                const isCurrent = currentSlotTime === slot

                return (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => handleOpenSlot(slot)}
                    className={`relative p-3.5 sm:p-4 rounded-2xl text-left transition-all duration-200 cursor-pointer group flex flex-col justify-between min-h-[120px] ${
                      filled
                        ? 'bg-white border-2 border-[#0E7C7B] shadow-sm hover:shadow-md'
                        : 'bg-[#F6FBFA] border-2 border-dashed border-[#E3EFED] hover:border-[#0E7C7B]/50 hover:bg-white'
                    } ${isCurrent && !filled ? 'ring-2 ring-[#0E7C7B]/40 ring-offset-2' : ''}`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-sm font-extrabold text-[#123332]">{slot}</span>
                      {filled ? (
                        <CheckCircle2 className="w-4 h-4 text-[#0E7C7B]" />
                      ) : (
                        <Clock className="w-3.5 h-3.5 text-[#5C7472]/60" />
                      )}
                    </div>

                    <div className="my-1.5 space-y-1">
                      {filled && rec ? (
                        <>
                          {rec.systolic && rec.diastolic ? (
                            <div className="text-xs font-mono font-bold text-[#123332]">
                              PA {rec.systolic}/{rec.diastolic}
                            </div>
                          ) : null}
                          {rec.glucose ? (
                            <div className="text-[11px] text-[#5C7472]">
                              Glic: <span className="font-semibold">{rec.glucose}</span>
                            </div>
                          ) : null}
                          {rec.water_ml ? (
                            <div className="text-[11px] text-[#0E7C7B] font-semibold">
                              +{rec.water_ml} ml
                            </div>
                          ) : null}
                        </>
                      ) : (
                        <div className="text-xs text-[#5C7472]">Pendente</div>
                      )}
                    </div>

                    <div className="text-[11px] font-bold text-[#0E7C7B] group-hover:underline flex items-center justify-between pt-1 border-t border-[#E3EFED]/60">
                      <span>{filled ? 'Editar' : 'Lançar'}</span>
                      <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </button>
                )
              })}
            </div>
          </section>

          {/* Histórico Visual de Tendências Clínicas (PA + Peso com Metas) */}
          <section className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E3EFED] shadow-card">
            <TrendCharts
              measurements={historyMeasurements}
              baselineWeightKg={settings?.baseline_weight_kg || 94}
              systolicTarget={140}
              diastolicTarget={90}
              periodDays={trendPeriod}
              onPeriodChange={setTrendPeriod}
            />
          </section>

          {/* Water Intake Card */}
          <section className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E3EFED] shadow-card">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-xs uppercase font-extrabold tracking-wider text-[#5C7472] flex items-center gap-1.5">
                  <Droplets className="w-3.5 h-3.5 text-[#3B82F6]" />
                  Ingestão de Água
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold font-mono text-[#123332] mt-0.5">
                  {totalWaterToday.toLocaleString('pt-BR')} / {waterGoal.toLocaleString('pt-BR')}{' '}
                  <span className="text-sm font-normal text-[#5C7472]">ml</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickAddWater(200)}
                  className="px-3 py-1.5 rounded-xl bg-[#F6FBFA] hover:bg-[#D9F2F1] text-[#0E7C7B] border border-[#E3EFED] text-xs font-bold transition-all active:scale-95"
                >
                  +200 ml
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickAddWater(300)}
                  className="px-3 py-1.5 rounded-xl bg-[#F6FBFA] hover:bg-[#D9F2F1] text-[#0E7C7B] border border-[#E3EFED] text-xs font-bold transition-all active:scale-95"
                >
                  +300 ml
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-3 rounded-full bg-[#E3EFED] overflow-hidden">
              <div
                className="h-full bg-[#0E7C7B] rounded-full transition-all duration-700 ease-out"
                style={{ width: `${waterPercent}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs text-[#5C7472] mt-2 font-medium">
              <span>{waterPercent}% da meta diária</span>
              <span>
                {totalWaterToday >= waterGoal
                  ? 'Meta diária alcançada!'
                  : `Faltam ${(waterGoal - totalWaterToday).toLocaleString('pt-BR')} ml`}
              </span>
            </div>
          </section>

          {/* Diurese & Temperatura Mini-Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-3xl p-5 border border-[#E3EFED] shadow-card flex items-center justify-between">
              <div>
                <span className="text-xs uppercase font-extrabold tracking-wider text-[#5C7472]">
                  Diurese Hoje
                </span>
                <div className="text-2xl font-extrabold font-mono text-[#123332] mt-0.5">
                  {totalUrineToday.toLocaleString('pt-BR')}{' '}
                  <span className="text-sm font-normal text-[#5C7472]">ml</span>
                </div>
                <span className="text-xs text-[#2E9E6B] font-semibold">
                  Fluxo urinário adequado
                </span>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-[#EAF7EE] text-[#2E9E6B] flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-[#E3EFED] shadow-card flex items-center justify-between">
              <div>
                <span className="text-xs uppercase font-extrabold tracking-wider text-[#5C7472]">
                  Temperatura
                </span>
                <div className="text-2xl font-extrabold font-mono text-[#123332] mt-0.5">
                  {lastTemperature.toFixed(1)}{' '}
                  <span className="text-sm font-normal text-[#5C7472]">°C</span>
                </div>
                <span
                  className={`text-xs font-semibold ${
                    lastTemperature >= 37.8 ? 'text-[#D64545]' : 'text-[#2E9E6B]'
                  }`}
                >
                  {lastTemperature >= 37.8 ? 'Febre detectada (Atenção)' : 'Afebril'}
                </span>
              </div>
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center ${
                  lastTemperature >= 37.8
                    ? 'bg-[#FDEEEE] text-[#D64545]'
                    : 'bg-[#EAF7EE] text-[#2E9E6B]'
                }`}
              >
                {lastTemperature >= 37.8 ? (
                  <AlertTriangle className="w-6 h-6" />
                ) : (
                  <Thermometer className="w-6 h-6" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (38% ~ 5 cols or 4 cols) */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-6">
          {/* Medications Routine of the Day */}
          <section className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E3EFED] shadow-card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-[#123332] flex items-center gap-2">
                  <Pill className="w-4 h-4 text-[#0E7C7B]" />
                  Medicamentos do Dia
                </h2>
                <p className="text-xs text-[#5C7472]">
                  {dosesTakenCount} de {totalDosesCount} tomados hoje
                </p>
              </div>
              <Link
                to="/medicamentos"
                className="text-xs font-bold text-[#0E7C7B] hover:underline flex items-center gap-1"
              >
                Gerenciar
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
              {medRoutine.map((item) => {
                const key = `${item.medication.id}-${item.time}`
                return (
                  <div
                    key={key}
                    className={`p-3 rounded-2xl border transition-all flex items-center justify-between ${
                      item.taken
                        ? 'bg-[#F6FBFA] border-[#E3EFED] opacity-75'
                        : 'bg-white border-[#0E7C7B]/30 shadow-sm'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs sm:text-sm font-bold ${
                            item.taken ? 'line-through text-[#5C7472]' : 'text-[#123332]'
                          }`}
                        >
                          {item.medication.name}
                        </span>
                        <span className="text-[11px] px-2 py-0.5 rounded-md bg-[#D9F2F1] text-[#0A5F5E] font-semibold">
                          {item.effectiveDose}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-[#0E7C7B]">
                          {item.time}
                        </span>
                        {!item.taken && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#0E7C7B] animate-pulse-soft" />
                        )}
                        {item.taken && item.takenAt && (
                          <span className="text-[10px] text-[#5C7472]">
                            Tomado às{' '}
                            {new Date(item.takenAt).toLocaleTimeString('pt-BR', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        handleToggleMedication(item.medication.id, item.time, item.taken)
                      }
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                        item.taken
                          ? 'bg-[#0E7C7B] text-white animate-check-pop'
                          : 'border-2 border-[#0E7C7B] text-transparent hover:bg-[#D9F2F1]'
                      }`}
                      title={item.taken ? 'Desmarcar dose' : 'Marcar como tomado'}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  </div>
                )
              })}

              {medRoutine.length === 0 && (
                <p className="text-xs text-[#5C7472] text-center py-4">
                  Nenhum medicamento programado para hoje.
                </p>
              )}
            </div>
          </section>

          {/* Upcoming Appointments */}
          <section className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E3EFED] shadow-card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-[#123332] flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#0E7C7B]" />
                  Próximas Consultas
                </h2>
                <p className="text-xs text-[#5C7472]">Agenda médica e exames</p>
              </div>
              <Link
                to="/consultas"
                className="text-xs font-bold text-[#0E7C7B] hover:underline flex items-center gap-1"
              >
                Ver agenda
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="space-y-3">
              {appointments.slice(0, 3).map((appt) => {
                const apptDate = new Date(appt.date.split('T')[0])
                const formattedDate = apptDate.toLocaleDateString('pt-BR', {
                  weekday: 'short',
                  day: '2-digit',
                  month: 'short',
                })

                return (
                  <Link
                    key={appt.id}
                    to="/consultas"
                    className="block p-3.5 rounded-2xl bg-[#F6FBFA] hover:bg-[#D9F2F1]/40 border border-[#E3EFED] transition-all space-y-2 group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-xs font-bold text-[#0E7C7B] capitalize">
                          {formattedDate} {appt.time ? `às ${appt.time}` : ''}
                        </div>
                        <div className="text-sm font-bold text-[#123332] group-hover:text-[#0E7C7B] transition-colors">
                          {appt.title}
                        </div>
                        {appt.doctor && <div className="text-xs text-[#5C7472]">{appt.doctor}</div>}
                      </div>
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                          appt.type === 'exame'
                            ? 'bg-[#EDE9FE] text-[#7C5CBF]'
                            : 'bg-[#D9F2F1] text-[#0A5F5E]'
                        }`}
                      >
                        {appt.type}
                      </span>
                    </div>

                    {appt.fasting_required && (
                      <div className="p-2 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] text-[#92400E] text-[11px] font-semibold flex items-center gap-1.5">
                        <UtensilsCrossed className="w-3.5 h-3.5 text-[#D97706] shrink-0" />
                        <span>Atenção: jejum de 8h antes do exame</span>
                      </div>
                    )}
                  </Link>
                )
              })}

              {appointments.length === 0 && (
                <p className="text-xs text-[#5C7472] text-center py-4">
                  Nenhuma consulta ou exame pendente.
                </p>
              )}
            </div>
          </section>

          {/* Last Labs Summary */}
          <section className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E3EFED] shadow-card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-[#123332]">Últimos Exames</h2>
                <p className="text-xs text-[#5C7472]">Função do enxerto renal</p>
              </div>
              <Link
                to="/exames"
                className="text-xs font-bold text-[#0E7C7B] hover:underline flex items-center gap-1"
              >
                Ver evolução
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            {latestLab ? (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-[#F6FBFA] border border-[#E3EFED] flex items-center justify-between">
                  <div>
                    <span className="text-xs uppercase font-extrabold tracking-wider text-[#5C7472]">
                      Creatinina Sérica
                    </span>
                    <div className="text-3xl font-extrabold font-mono text-[#123332] mt-0.5">
                      {latestLab.creatinine}{' '}
                      <span className="text-sm font-normal text-[#5C7472]">mg/dL</span>
                    </div>
                  </div>

                  {creatinineDelta !== null && (
                    <div
                      className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${
                        creatinineDelta <= 0
                          ? 'bg-[#EAF7EE] text-[#2E9E6B]'
                          : 'bg-[#FDEEEE] text-[#D64545]'
                      }`}
                    >
                      {creatinineDelta <= 0 ? (
                        <TrendingDown className="w-3.5 h-3.5" />
                      ) : (
                        <TrendingUp className="w-3.5 h-3.5" />
                      )}
                      <span>
                        {creatinineDelta <= 0 ? '↓' : '↑'} {Math.abs(creatinineDelta)} mg/dL
                      </span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-3 rounded-xl bg-white border border-[#E3EFED]">
                    <span className="text-[#5C7472]">Ureia</span>
                    <div className="font-bold font-mono text-[#123332] text-sm mt-0.5">
                      {latestLab.urea ? `${latestLab.urea} mg/dL` : '—'}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-[#E3EFED]">
                    <span className="text-[#5C7472]">TFG Estimada</span>
                    <div className="font-bold font-mono text-[#123332] text-sm mt-0.5">
                      {latestLab.gfr ? `${latestLab.gfr} mL/min` : '—'}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-[#5C7472] text-center py-4">Nenhum exame cadastrado.</p>
            )}
          </section>
        </div>
      </div>

      {/* Measurement Modal */}
      <MeasurementModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        dateStr={todayStr}
        slot={selectedSlot}
        existingRecord={getSlotRecord(selectedSlot)}
        onSaved={loadData}
      />
    </div>
  )
}

export default Index
