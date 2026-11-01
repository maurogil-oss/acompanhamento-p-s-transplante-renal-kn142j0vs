import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { measurementsService } from '@/services/measurements'
import type { MeasurementRecord, MeasurementSlot } from '@/types/database'
import { MeasurementModal } from '@/components/MeasurementModal'
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Calendar,
  Activity,
  Droplets,
  Thermometer,
  Weight,
  Edit2,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react'
import { evaluateMeasurementSlot, evaluateUrineDrop } from '@/lib/clinicalTargets'
import { Button } from '@/components/ui/button'

const SLOTS: MeasurementSlot[] = ['07:00', '12:00', '18:00', '23:00']

const Medicoes: React.FC = () => {
  // Date navigator: default today
  const [currentDate, setCurrentDate] = useState<Date>(new Date())
  const [dayMeasurements, setDayMeasurements] = useState<MeasurementRecord[]>([])
  const [recentMeasurements, setRecentMeasurements] = useState<MeasurementRecord[]>([])
  const [loading, setLoading] = useState(true)

  // Modal State
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<MeasurementSlot>('07:00')

  const currentDateStr = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = String(currentDate.getMonth() + 1).padStart(2, '0')
    const day = String(currentDate.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }, [currentDate])

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const [dayM, recentM] = await Promise.all([
        measurementsService.getByDate(currentDateStr),
        measurementsService.getRecentDays(7),
      ])
      setDayMeasurements(dayM)
      setRecentMeasurements(recentM)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [currentDateStr])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handlePrevDay = () => {
    setCurrentDate((prev) => {
      const d = new Date(prev)
      d.setDate(d.getDate() - 1)
      return d
    })
  }

  const handleNextDay = () => {
    setCurrentDate((prev) => {
      const d = new Date(prev)
      d.setDate(d.getDate() + 1)
      return d
    })
  }

  const handleToday = () => {
    setCurrentDate(new Date())
  }

  const formattedDate = useMemo(() => {
    return new Intl.DateTimeFormat('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(currentDate)
  }, [currentDate])

  const getSlotRecord = (slot: MeasurementSlot) => {
    return dayMeasurements.find((m) => m.slot === slot) || null
  }

  const handleOpenSlot = (slot: MeasurementSlot) => {
    setSelectedSlot(slot)
    setModalOpen(true)
  }

  // Group 7-day history by date
  const historyDays = useMemo(() => {
    const daysMap = new Map<string, MeasurementRecord[]>()
    recentMeasurements.forEach((m) => {
      const d = m.date.split('T')[0]
      const list = daysMap.get(d) || []
      list.push(m)
      daysMap.set(d, list)
    })

    const dates = Array.from(daysMap.keys()).sort().reverse().slice(0, 7)
    return dates.map((dateStr, idx) => {
      const records = daysMap.get(dateStr) || []
      // Calculate summary for day
      const paRec = records.find((r) => r.systolic && r.diastolic)
      const maxGlic = Math.max(...records.map((r) => r.glucose || 0), 0)
      const avgFc = Math.round(
        records.reduce((acc, r) => acc + (r.heart_rate || 0), 0) /
          (records.filter((r) => r.heart_rate).length || 1),
      )
      const totalWater = records.reduce((acc, r) => acc + (r.water_ml || 0), 0)
      const totalUrine = records.reduce((acc, r) => acc + (r.urine_ml || 0), 0)
      const maxTemp = Math.max(...records.map((r) => r.temperature || 0), 0)
      const weightRec = records.find((r) => r.weight_kg && r.weight_kg > 0)

      // Queda de diurese vs dia anterior (dia posterior no array ordenado decrescente)
      const prevDateStr = dates[idx + 1]
      const prevRecords = prevDateStr ? daysMap.get(prevDateStr) || [] : []
      const prevUrine = prevRecords.reduce((acc, r) => acc + (r.urine_ml || 0), 0)
      const urineEval = evaluateUrineDrop(totalUrine, prevUrine)

      const isPaHigh = Boolean(
        paRec &&
        ((paRec.systolic && paRec.systolic >= 140) || (paRec.diastolic && paRec.diastolic >= 90)),
      )
      const isGlicOff = Boolean(maxGlic > 0 && (maxGlic > 180 || maxGlic < 70))
      const isTempHigh = Boolean(maxTemp >= 37.8)

      return {
        dateStr,
        pa: paRec ? `${paRec.systolic}/${paRec.diastolic}` : '—',
        paOff: isPaHigh,
        glucose: maxGlic > 0 ? maxGlic : '—',
        glicOff: isGlicOff,
        heartRate: avgFc > 0 ? avgFc : '—',
        water: totalWater > 0 ? totalWater : '—',
        urine: totalUrine > 0 ? totalUrine : '—',
        urineDrop: urineEval.isDrop,
        temperature: maxTemp > 0 ? maxTemp.toFixed(1) : '—',
        tempHigh: isTempHigh,
        weight: weightRec?.weight_kg ? weightRec.weight_kg.toFixed(1) : '—',
        hasAnyOff: isPaHigh || isGlicOff || isTempHigh || urineEval.isDrop,
      }
    })
  }, [recentMeasurements])

  return (
    <div className="space-y-6">
      {/* Page Title & Date Navigator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E3EFED]/60">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#123332]">Medições Diárias</h1>
          <p className="text-xs sm:text-sm text-[#5C7472] capitalize mt-0.5">{formattedDate}</p>
        </div>

        {/* Date Navigator */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevDay}
            className="rounded-xl h-9 px-2.5"
            title="Dia anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleToday}
            className="rounded-xl h-9 px-3 text-xs font-bold text-[#0E7C7B]"
          >
            Hoje
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleNextDay}
            className="rounded-xl h-9 px-2.5"
            title="Próximo dia"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Vertical Timeline of the 4 Slots */}
      <div className="space-y-4">
        {SLOTS.map((slot) => {
          const rec = getSlotRecord(slot)
          const hasData = Boolean(
            (rec?.systolic && rec.systolic > 0) ||
            (rec?.glucose && rec.glucose > 0) ||
            (rec?.water_ml && rec.water_ml > 0),
          )

          const slotEval = evaluateMeasurementSlot(rec)
          const isOff = hasData && slotEval.isOffTarget

          return (
            <div
              key={slot}
              className={`p-5 rounded-3xl border transition-all ${
                !hasData
                  ? 'bg-[#F6FBFA] border-dashed border-[#E3EFED]'
                  : isOff
                    ? slotEval.level === 'alert'
                      ? 'bg-[#FFF5F5] border-2 border-[#D64545] shadow-card'
                      : 'bg-[#FFFBEB] border-2 border-[#D97706] shadow-card'
                    : 'bg-white border-[#E3EFED] shadow-card'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E3EFED]/60">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-9 h-9 rounded-2xl flex items-center justify-center font-mono font-bold text-sm ${
                      !hasData
                        ? 'bg-white border border-[#E3EFED] text-[#5C7472]'
                        : isOff
                          ? slotEval.level === 'alert'
                            ? 'bg-[#D64545] text-white shadow-sm'
                            : 'bg-[#D97706] text-white shadow-sm'
                          : 'bg-[#0E7C7B] text-white shadow-sm'
                    }`}
                  >
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-base font-extrabold text-[#123332] flex items-center gap-2">
                      <span>Período das {slot}</span>
                      {isOff && (
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                            slotEval.level === 'alert'
                              ? 'bg-[#FDEEEE] text-[#992626] border border-[#FAD2D2]'
                              : 'bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]'
                          }`}
                        >
                          <AlertTriangle className="w-3 h-3" />
                          Fora da meta combinada — comunique sua equipe
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-[#5C7472]">
                      {hasData ? 'Medição registrada' : 'Aguardando lançamento'}
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => handleOpenSlot(slot)}
                  variant="outline"
                  size="sm"
                  className="rounded-xl h-9 px-4 text-xs font-bold text-[#0E7C7B] border-[#0E7C7B]/30 hover:bg-[#D9F2F1]/50 self-start sm:self-auto"
                >
                  <Edit2 className="w-3.5 h-3.5 mr-1.5" />
                  {hasData ? 'Editar Medição' : 'Lançar Medição'}
                </Button>
              </div>

              {hasData && rec ? (
                <div className="space-y-3 mt-4">
                  {isOff && (
                    <div
                      className={`p-3 rounded-2xl text-xs font-semibold flex items-center gap-2 ${
                        slotEval.level === 'alert'
                          ? 'bg-[#FDEEEE] text-[#992626] border border-[#FAD2D2]'
                          : 'bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]'
                      }`}
                    >
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>
                        <strong>Aviso de segurança:</strong> Fora da meta combinada — comunique sua
                        equipe.
                        {slotEval.reasons.length > 0 && ` (${slotEval.reasons.join(', ')})`}
                      </span>
                    </div>
                  )}

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-xs">
                    {/* PA */}
                    <div
                      className={`p-3 rounded-2xl border ${
                        rec.systolic &&
                        rec.diastolic &&
                        (rec.systolic >= 140 || rec.diastolic >= 90)
                          ? 'bg-[#FFF5F5] border-[#FAD2D2]'
                          : 'bg-[#F6FBFA] border-[#E3EFED]'
                      }`}
                    >
                      <span className="text-[#5C7472] block">Pressão Arterial</span>
                      <span
                        className={`font-extrabold font-mono text-sm mt-0.5 block ${
                          rec.systolic &&
                          rec.diastolic &&
                          (rec.systolic >= 140 || rec.diastolic >= 90)
                            ? 'text-[#D64545]'
                            : 'text-[#123332]'
                        }`}
                      >
                        {rec.systolic && rec.diastolic
                          ? `${rec.systolic}/${rec.diastolic} mmHg`
                          : '—'}
                      </span>
                    </div>

                    {/* Glicemia */}
                    <div
                      className={`p-3 rounded-2xl border ${
                        rec.glucose && (rec.glucose > 180 || rec.glucose < 70)
                          ? 'bg-[#FFFBEB] border-[#FDE68A]'
                          : 'bg-[#F6FBFA] border-[#E3EFED]'
                      }`}
                    >
                      <span className="text-[#5C7472] block">Glicemia</span>
                      <span
                        className={`font-extrabold font-mono text-sm mt-0.5 block ${
                          rec.glucose && (rec.glucose > 180 || rec.glucose < 70)
                            ? 'text-[#D97706]'
                            : 'text-[#123332]'
                        }`}
                      >
                        {rec.glucose ? `${rec.glucose} mg/dL` : '—'}
                      </span>
                    </div>

                    {/* FC */}
                    <div className="p-3 rounded-2xl bg-[#F6FBFA] border border-[#E3EFED]">
                      <span className="text-[#5C7472] block">Freq. Cardíaca</span>
                      <span className="font-extrabold font-mono text-[#123332] text-sm mt-0.5 block">
                        {rec.heart_rate ? `${rec.heart_rate} bpm` : '—'}
                      </span>
                    </div>

                    {/* Água */}
                    <div className="p-3 rounded-2xl bg-[#F6FBFA] border border-[#E3EFED]">
                      <span className="text-[#5C7472] block">Água</span>
                      <span className="font-extrabold font-mono text-[#0E7C7B] text-sm mt-0.5 block">
                        {rec.water_ml ? `${rec.water_ml} ml` : '—'}
                      </span>
                    </div>

                    {/* Diurese */}
                    <div className="p-3 rounded-2xl bg-[#F6FBFA] border border-[#E3EFED]">
                      <span className="text-[#5C7472] block">Diurese</span>
                      <span className="font-extrabold font-mono text-[#123332] text-sm mt-0.5 block">
                        {rec.urine_ml ? `${rec.urine_ml} ml` : '—'}
                      </span>
                    </div>

                    {/* Temp / Peso */}
                    <div
                      className={`p-3 rounded-2xl border ${
                        rec.temperature && rec.temperature >= 37.8
                          ? 'bg-[#FFF5F5] border-[#FAD2D2]'
                          : 'bg-[#F6FBFA] border-[#E3EFED]'
                      }`}
                    >
                      <span className="text-[#5C7472] block">
                        {slot === '07:00' ? 'Peso / Temp' : 'Temperatura'}
                      </span>
                      <span
                        className={`font-extrabold font-mono text-sm mt-0.5 block ${
                          rec.temperature && rec.temperature >= 37.8
                            ? 'text-[#D64545]'
                            : 'text-[#123332]'
                        }`}
                      >
                        {slot === '07:00' && rec.weight_kg ? `${rec.weight_kg} kg | ` : ''}
                        {rec.temperature ? `${rec.temperature}°C` : '—'}
                      </span>
                    </div>

                    {rec.notes && (
                      <div className="col-span-2 sm:col-span-3 md:col-span-6 p-3 rounded-2xl bg-[#F6FBFA] border border-[#E3EFED] text-[#5C7472] italic">
                        "{rec.notes}"
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-xs text-[#5C7472] py-4 text-center">
                  Nenhum dado lançado para o período das {slot}. Clique no botão acima para
                  adicionar.
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* 7-Day History Table */}
      <section className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E3EFED] shadow-card space-y-4">
        <div>
          <h2 className="text-base font-bold text-[#123332]">Histórico dos Últimos 7 Dias</h2>
          <p className="text-xs text-[#5C7472]">
            Visão consolidada por dia. Toque em qualquer linha para navegar.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E3EFED] text-[#5C7472] font-extrabold uppercase tracking-wider text-[11px]">
                <th className="pb-3 pr-3">Data</th>
                <th className="pb-3 px-3">PA (mmHg)</th>
                <th className="pb-3 px-3">Glicemia</th>
                <th className="pb-3 px-3">FC (bpm)</th>
                <th className="pb-3 px-3">Água (ml)</th>
                <th className="pb-3 px-3">Diurese (ml)</th>
                <th className="pb-3 px-3">Temp (°C)</th>
                <th className="pb-3 pl-3">Peso (kg)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E3EFED]/60">
              {historyDays.map((row) => {
                const rowDate = new Date(row.dateStr + 'T00:00:00')
                const rowDateFormatted = rowDate.toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                  weekday: 'short',
                })

                return (
                  <tr
                    key={row.dateStr}
                    onClick={() => setCurrentDate(rowDate)}
                    className={`hover:bg-[#F6FBFA] cursor-pointer transition-colors ${
                      row.hasAnyOff ? 'bg-[#FFFBEB]/40' : ''
                    }`}
                  >
                    <td className="py-3 pr-3 font-bold text-[#123332] whitespace-nowrap capitalize flex items-center gap-1.5">
                      {row.hasAnyOff && (
                        <span
                          title="Valor fora da meta registrada neste dia"
                          className="inline-flex"
                        >
                          <AlertTriangle className="w-3.5 h-3.5 text-[#D97706] shrink-0" />
                        </span>
                      )}
                      <span>{rowDateFormatted}</span>
                    </td>
                    <td
                      className={`py-3 px-3 font-mono ${row.paOff ? 'text-[#D64545] font-bold' : ''}`}
                    >
                      {row.pa}
                    </td>
                    <td
                      className={`py-3 px-3 font-mono ${row.glicOff ? 'text-[#D97706] font-bold' : ''}`}
                    >
                      {row.glucose}
                    </td>
                    <td className="py-3 px-3 font-mono">{row.heartRate}</td>
                    <td className="py-3 px-3 font-mono text-[#0E7C7B] font-bold">{row.water}</td>
                    <td
                      className={`py-3 px-3 font-mono ${row.urineDrop ? 'text-[#D97706] font-bold' : ''}`}
                    >
                      {row.urine}
                      {row.urineDrop && ' (queda)'}
                    </td>
                    <td
                      className={`py-3 px-3 font-mono ${row.tempHigh ? 'text-[#D64545] font-bold' : ''}`}
                    >
                      {row.temperature}
                    </td>
                    <td className="py-3 pl-3 font-mono font-bold text-[#123332]">{row.weight}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Modal */}
      <MeasurementModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        dateStr={currentDateStr}
        slot={selectedSlot}
        existingRecord={getSlotRecord(selectedSlot)}
        onSaved={loadData}
      />
    </div>
  )
}

export default Medicoes
