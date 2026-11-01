import React, { useState, useMemo } from 'react'
import type { MeasurementRecord } from '@/types/database'
import {
  Activity,
  Weight,
  TrendingDown,
  TrendingUp,
  Info,
  Calendar,
  ChevronRight,
} from 'lucide-react'

export interface TrendChartsProps {
  measurements: MeasurementRecord[]
  baselineWeightKg?: number
  systolicTarget?: number // padrão: 140
  diastolicTarget?: number // padrão: 90
  periodDays?: 14 | 28
  onPeriodChange?: (days: 14 | 28) => void
  readOnly?: boolean
}

interface DailyPoint {
  date: string // YYYY-MM-DD
  displayDate: string // DD/MM
  fullDate: string // DD/MM/YYYY
  weekday: string
  systolic?: number
  diastolic?: number
  heartRate?: number
  weight?: number
  hasBP: boolean
  hasWeight: boolean
}

export const TrendCharts: React.FC<TrendChartsProps> = ({
  measurements,
  baselineWeightKg = 94,
  systolicTarget = 140,
  diastolicTarget = 90,
  periodDays = 14,
  onPeriodChange,
}) => {
  const [activeTab, setActiveTab] = useState<'both' | 'bp' | 'weight'>('both')
  const [hoveredBpIdx, setHoveredBpIdx] = useState<number | null>(null)
  const [hoveredWeightIdx, setHoveredWeightIdx] = useState<number | null>(null)

  // 1. Process daily points in chronological order
  const dailyData = useMemo<DailyPoint[]>(() => {
    const map = new Map<
      string,
      {
        systolics: number[]
        diastolics: number[]
        heartRates: number[]
        weights: number[]
      }
    >()

    measurements.forEach((m) => {
      const d = m.date.split('T')[0]
      if (!map.has(d)) {
        map.set(d, {
          systolics: [],
          diastolics: [],
          heartRates: [],
          weights: [],
        })
      }
      const entry = map.get(d)!
      if (m.systolic && m.systolic > 0) entry.systolics.push(m.systolic)
      if (m.diastolic && m.diastolic > 0) entry.diastolics.push(m.diastolic)
      if (m.heart_rate && m.heart_rate > 0) entry.heartRates.push(m.heart_rate)
      if (m.weight_kg && m.weight_kg > 0) entry.weights.push(m.weight_kg)
    })

    const sortedDates = Array.from(map.keys()).sort()
    // Slice according to periodDays
    const targetDates = sortedDates.slice(-periodDays)

    return targetDates.map((dateStr) => {
      const entry = map.get(dateStr)!
      const dObj = new Date(dateStr + 'T00:00:00')
      const displayDate = dObj.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
      })
      const fullDate = dObj.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
      const weekday = dObj.toLocaleDateString('pt-BR', { weekday: 'short' })

      // Average BP of day or first available
      const systolic =
        entry.systolics.length > 0
          ? Math.round(entry.systolics.reduce((a, b) => a + b, 0) / entry.systolics.length)
          : undefined

      const diastolic =
        entry.diastolics.length > 0
          ? Math.round(entry.diastolics.reduce((a, b) => a + b, 0) / entry.diastolics.length)
          : undefined

      const heartRate =
        entry.heartRates.length > 0
          ? Math.round(entry.heartRates.reduce((a, b) => a + b, 0) / entry.heartRates.length)
          : undefined

      // Weight (prefer morning 07:00 or last recorded)
      const weight = entry.weights.length > 0 ? entry.weights[entry.weights.length - 1] : undefined

      return {
        date: dateStr,
        displayDate,
        fullDate,
        weekday,
        systolic,
        diastolic,
        heartRate,
        weight,
        hasBP: Boolean(systolic && diastolic),
        hasWeight: Boolean(weight && weight > 0),
      }
    })
  }, [measurements, periodDays])

  // Filter specific data arrays
  const bpData = useMemo(() => dailyData.filter((d) => d.hasBP), [dailyData])
  const weightData = useMemo(() => dailyData.filter((d) => d.hasWeight), [dailyData])

  // Weight statistics: latest, previous, delta vs yesterday, delta vs baseline
  const weightStats = useMemo(() => {
    if (weightData.length === 0) {
      return {
        latest: baselineWeightKg,
        previous: undefined,
        deltaYesterday: 0,
        deltaBaseline: 0,
        latestDate: 'Hoje',
      }
    }
    const latestRec = weightData[weightData.length - 1]
    const latest = latestRec.weight || baselineWeightKg
    const prevRec = weightData.length >= 2 ? weightData[weightData.length - 2] : null
    const deltaYesterday = prevRec?.weight ? Number((latest - prevRec.weight).toFixed(1)) : 0
    const deltaBaseline = Number((latest - baselineWeightKg).toFixed(1))

    return {
      latest,
      previous: prevRec?.weight,
      deltaYesterday,
      deltaBaseline,
      latestDate: latestRec.displayDate,
    }
  }, [weightData, baselineWeightKg])

  // BP statistics: latest and average
  const bpStats = useMemo(() => {
    if (bpData.length === 0) return null
    const latest = bpData[bpData.length - 1]
    const avgSys = Math.round(bpData.reduce((acc, d) => acc + (d.systolic || 0), 0) / bpData.length)
    const avgDia = Math.round(
      bpData.reduce((acc, d) => acc + (d.diastolic || 0), 0) / bpData.length,
    )

    const isLatestControlled =
      latest.systolic! <= systolicTarget && latest.diastolic! <= diastolicTarget

    return {
      latestSys: latest.systolic,
      latestDia: latest.diastolic,
      latestDate: latest.displayDate,
      avgSys,
      avgDia,
      isLatestControlled,
    }
  }, [bpData, systolicTarget, diastolicTarget])

  return (
    <div className="space-y-4">
      {/* Header with Title and Period Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#E3EFED]/60">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-[#123332] flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#0E7C7B]" />
            Tendências Clínicas
          </h2>
          <p className="text-xs text-[#5C7472]">
            Evolução de pressão arterial e peso matinal com linhas de meta e variação diária
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Period selector */}
          {onPeriodChange && (
            <div className="inline-flex rounded-xl bg-[#F6FBFA] p-0.5 border border-[#E3EFED]">
              <button
                type="button"
                onClick={() => onPeriodChange(14)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  periodDays === 14
                    ? 'bg-white text-[#0E7C7B] shadow-sm'
                    : 'text-[#5C7472] hover:text-[#123332]'
                }`}
              >
                2 semanas
              </button>
              <button
                type="button"
                onClick={() => onPeriodChange(28)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  periodDays === 28
                    ? 'bg-white text-[#0E7C7B] shadow-sm'
                    : 'text-[#5C7472] hover:text-[#123332]'
                }`}
              >
                4 semanas
              </button>
            </div>
          )}

          {/* View Filter */}
          <div className="inline-flex rounded-xl bg-[#F6FBFA] p-0.5 border border-[#E3EFED]">
            <button
              type="button"
              onClick={() => setActiveTab('both')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'both'
                  ? 'bg-[#0E7C7B] text-white shadow-sm'
                  : 'text-[#5C7472] hover:text-[#123332]'
              }`}
            >
              Todos
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('bp')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'bp'
                  ? 'bg-[#0E7C7B] text-white shadow-sm'
                  : 'text-[#5C7472] hover:text-[#123332]'
              }`}
            >
              PA
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('weight')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'weight'
                  ? 'bg-[#0E7C7B] text-white shadow-sm'
                  : 'text-[#5C7472] hover:text-[#123332]'
              }`}
            >
              Peso
            </button>
          </div>
        </div>
      </div>

      {/* Highlights summary strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* BP Summary */}
        <div className="p-3.5 rounded-2xl bg-[#F6FBFA] border border-[#E3EFED] flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#5C7472] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#E05252]" />
              Pressão Arterial Recente
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-extrabold font-mono text-[#123332]">
                {bpStats ? `${bpStats.latestSys}/${bpStats.latestDia}` : '—'}
                <span className="text-xs font-normal text-[#5C7472] ml-1">mmHg</span>
              </span>
              {bpStats && (
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                    bpStats.isLatestControlled
                      ? 'bg-[#EAF7EE] text-[#2E9E6B]'
                      : 'bg-[#FFFBEB] text-[#D97706]'
                  }`}
                >
                  {bpStats.isLatestControlled ? 'Dentro da meta' : 'Acima da meta'}
                </span>
              )}
            </div>
            <p className="text-[11px] text-[#5C7472]">
              Meta clínica: ≤ {systolicTarget}/{diastolicTarget} mmHg{' '}
              {bpStats && `(média: ${bpStats.avgSys}/${bpStats.avgDia})`}
            </p>
          </div>
        </div>

        {/* Weight Summary with Delta Highlight */}
        <div className="p-3.5 rounded-2xl bg-[#F6FBFA] border border-[#E3EFED] flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#5C7472] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#0E7C7B]" />
              Peso Matinal & Variação
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-extrabold font-mono text-[#123332]">
                {weightStats.latest.toFixed(1)}
                <span className="text-xs font-normal text-[#5C7472] ml-1">kg</span>
              </span>

              {/* Delta from previous day / measurement */}
              {weightStats.previous !== undefined && (
                <span
                  className={`inline-flex items-center gap-0.5 text-xs font-extrabold px-2 py-0.5 rounded-md ${
                    Math.abs(weightStats.deltaYesterday) <= 0.5
                      ? 'bg-[#EAF7EE] text-[#2E9E6B]'
                      : 'bg-[#FFFBEB] text-[#D97706]'
                  }`}
                  title={`Variação em relação ao registro anterior (${weightStats.previous.toFixed(1)} kg)`}
                >
                  {weightStats.deltaYesterday > 0 ? (
                    <TrendingUp className="w-3.5 h-3.5" />
                  ) : weightStats.deltaYesterday < 0 ? (
                    <TrendingDown className="w-3.5 h-3.5" />
                  ) : null}
                  <span>
                    {weightStats.deltaYesterday > 0
                      ? `+${weightStats.deltaYesterday}`
                      : weightStats.deltaYesterday}{' '}
                    kg desde ontem
                  </span>
                </span>
              )}
            </div>
            <p className="text-[11px] text-[#5C7472]">
              Peso basal de alta:{' '}
              <strong className="text-[#123332]">{baselineWeightKg.toFixed(1)} kg</strong> (
              {weightStats.deltaBaseline >= 0
                ? `+${weightStats.deltaBaseline}`
                : weightStats.deltaBaseline}{' '}
              kg vs alta)
            </p>
          </div>
        </div>
      </div>

      {/* Grid of Charts */}
      <div
        className={`grid gap-4 ${
          activeTab === 'both' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'
        }`}
      >
        {/* CHART 1: Blood Pressure */}
        {(activeTab === 'both' || activeTab === 'bp') && (
          <div className="p-4 sm:p-5 rounded-3xl bg-white border border-[#E3EFED] shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs sm:text-sm font-extrabold text-[#123332] flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#E05252]" />
                  Curva de Pressão Arterial (Sistólica / Diastólica)
                </h3>
                <p className="text-[11px] text-[#5C7472]">
                  Linha tracejada indica o teto da meta ({systolicTarget}/{diastolicTarget} mmHg)
                </p>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-2.5 text-[10px] font-bold text-[#5C7472]">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#E05252]" /> Sistólica
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#4A72B2]" /> Diastólica
                </span>
              </div>
            </div>

            <BpSvgChart
              data={bpData}
              systolicTarget={systolicTarget}
              diastolicTarget={diastolicTarget}
              hoveredIdx={hoveredBpIdx}
              setHoveredIdx={setHoveredBpIdx}
            />
          </div>
        )}

        {/* CHART 2: Weight */}
        {(activeTab === 'both' || activeTab === 'weight') && (
          <div className="p-4 sm:p-5 rounded-3xl bg-white border border-[#E3EFED] shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs sm:text-sm font-extrabold text-[#123332] flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#0E7C7B]" />
                  Evolução do Peso Matinal (kg)
                </h3>
                <p className="text-[11px] text-[#5C7472]">
                  Linha tracejada verde indica o peso basal de alta ({baselineWeightKg.toFixed(1)}{' '}
                  kg)
                </p>
              </div>

              <div className="flex items-center gap-2 text-[10px] font-bold text-[#5C7472]">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#0E7C7B]" /> Medido
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-0.5 bg-[#2E9E6B] border-dashed" /> Basal
                </span>
              </div>
            </div>

            <WeightSvgChart
              data={weightData}
              baselineWeight={baselineWeightKg}
              hoveredIdx={hoveredWeightIdx}
              setHoveredIdx={setHoveredWeightIdx}
            />
          </div>
        )}
      </div>
    </div>
  )
}

// -------------------------------------------------------------
// Sub-component: Blood Pressure SVG Chart with Targets and Tooltips
// -------------------------------------------------------------
interface BpSvgChartProps {
  data: DailyPoint[]
  systolicTarget: number
  diastolicTarget: number
  hoveredIdx: number | null
  setHoveredIdx: (idx: number | null) => void
}

const BpSvgChart: React.FC<BpSvgChartProps> = ({
  data,
  systolicTarget,
  diastolicTarget,
  hoveredIdx,
  setHoveredIdx,
}) => {
  if (data.length === 0) {
    return (
      <div className="h-52 flex flex-col items-center justify-center text-xs text-[#5C7472] border border-dashed border-[#E3EFED] rounded-2xl bg-[#F6FBFA] p-4 text-center">
        <Activity className="w-8 h-8 text-[#5C7472]/40 mb-2" />
        <p className="font-bold text-[#123332]">Sem aferições de pressão no período</p>
        <p className="text-[11px] mt-1">
          Lance suas medições de PA para ver a linha de tendência com a meta de {systolicTarget}/
          {diastolicTarget} mmHg.
        </p>
      </div>
    )
  }

  // Dimensions
  const width = 540
  const height = 210
  const padding = { top: 25, right: 25, bottom: 35, left: 45 }
  const chartW = width - padding.left - padding.right
  const chartH = height - padding.top - padding.bottom

  // Scales
  const allValues = [
    ...data.map((d) => d.systolic || 0),
    ...data.map((d) => d.diastolic || 0),
    systolicTarget,
    diastolicTarget,
  ].filter((v) => v > 0)

  const minVal = Math.max(40, Math.floor(Math.min(...allValues) / 10) * 10 - 10)
  const maxVal = Math.ceil(Math.max(...allValues) / 10) * 10 + 10
  const range = maxVal - minVal || 1

  const getY = (val: number) => padding.top + chartH - ((val - minVal) / range) * chartH
  const getX = (idx: number) =>
    padding.left + (data.length === 1 ? chartW / 2 : (idx / (data.length - 1)) * chartW)

  const sysTargetY = getY(systolicTarget)
  const diaTargetY = getY(diastolicTarget)

  // Points
  const points = data.map((d, idx) => {
    const x = getX(idx)
    const sysY = d.systolic ? getY(d.systolic) : undefined
    const diaY = d.diastolic ? getY(d.diastolic) : undefined
    return { ...d, x, sysY, diaY }
  })

  // Paths
  const sysPath = points.reduce((acc, p, idx) => {
    if (p.sysY === undefined) return acc
    return idx === 0 || acc === '' ? `M ${p.x} ${p.sysY}` : `${acc} L ${p.x} ${p.sysY}`
  }, '')

  const diaPath = points.reduce((acc, p, idx) => {
    if (p.diaY === undefined) return acc
    return idx === 0 || acc === '' ? `M ${p.x} ${p.diaY}` : `${acc} L ${p.x} ${p.diaY}`
  }, '')

  // Y-axis ticks
  const yTicks = [minVal, diastolicTarget, systolicTarget, maxVal].sort((a, b) => a - b)

  const activePoint = hoveredIdx !== null && points[hoveredIdx] ? points[hoveredIdx] : null

  return (
    <div className="relative w-full">
      <div className="relative w-full aspect-[2.4/1] bg-[#F6FBFA] rounded-2xl border border-[#E3EFED] p-2 overflow-hidden select-none">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full overflow-visible"
          preserveAspectRatio="none"
        >
          {/* Horizontal Grid lines */}
          {yTicks.map((val, i) => {
            const y = getY(val)
            const isTarget = val === systolicTarget || val === diastolicTarget
            return (
              <g key={i}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke={isTarget ? '#F59E0B' : '#E3EFED'}
                  strokeWidth={isTarget ? '1.5' : '1'}
                  strokeDasharray={isTarget ? '4 4' : '2 2'}
                  opacity={isTarget ? '0.85' : '0.7'}
                />
                <text
                  x={padding.left - 6}
                  y={y + 3.5}
                  textAnchor="end"
                  fontSize="9"
                  fill={isTarget ? '#D97706' : '#5C7472'}
                  fontWeight={isTarget ? 'bold' : 'normal'}
                >
                  {val}
                </text>
              </g>
            )
          })}

          {/* Meta Labels on right side */}
          <text
            x={width - padding.right}
            y={sysTargetY - 4}
            textAnchor="end"
            fontSize="8"
            fill="#D97706"
            fontWeight="bold"
          >
            Meta Sistólica ({systolicTarget})
          </text>
          <text
            x={width - padding.right}
            y={diaTargetY - 4}
            textAnchor="end"
            fontSize="8"
            fill="#D97706"
            fontWeight="bold"
          >
            Meta Diastólica ({diastolicTarget})
          </text>

          {/* Systolic Line */}
          {sysPath && (
            <path
              d={sysPath}
              fill="none"
              stroke="#E05252"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Diastolic Line */}
          {diaPath && (
            <path
              d={diaPath}
              fill="none"
              stroke="#4A72B2"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Hover indicator vertical line */}
          {activePoint && (
            <line
              x1={activePoint.x}
              y1={padding.top}
              x2={activePoint.x}
              y2={padding.top + chartH}
              stroke="#123332"
              strokeWidth="1"
              strokeDasharray="2 2"
              opacity="0.4"
            />
          )}

          {/* Points & Interactive Touch Zones */}
          {points.map((p, idx) => {
            const isHovered = hoveredIdx === idx
            return (
              <g
                key={idx}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                onClick={() => setHoveredIdx(isHovered ? null : idx)}
              >
                {/* Touch/click enlarged hit area */}
                <rect x={p.x - 14} y={padding.top} width="28" height={chartH} fill="transparent" />

                {/* Systolic dot */}
                {p.sysY !== undefined && (
                  <circle
                    cx={p.x}
                    cy={p.sysY}
                    r={isHovered ? '6' : '4'}
                    fill="#FFFFFF"
                    stroke="#E05252"
                    strokeWidth="2.5"
                    className="transition-all"
                  />
                )}

                {/* Diastolic dot */}
                {p.diaY !== undefined && (
                  <circle
                    cx={p.x}
                    cy={p.diaY}
                    r={isHovered ? '6' : '4'}
                    fill="#FFFFFF"
                    stroke="#4A72B2"
                    strokeWidth="2.5"
                    className="transition-all"
                  />
                )}

                {/* Date label on X-axis (only show subset if many points) */}
                {(data.length <= 10 || idx % 2 === 0 || idx === data.length - 1) && (
                  <text
                    x={p.x}
                    y={padding.top + chartH + 16}
                    textAnchor="middle"
                    fontSize="9"
                    fontWeight={isHovered ? 'bold' : 'normal'}
                    fill={isHovered ? '#123332' : '#5C7472'}
                  >
                    {p.displayDate}
                  </text>
                )}
              </g>
            )
          })}
        </svg>

        {/* Floating Tooltip Box */}
        {activePoint && (
          <div
            className="absolute z-20 pointer-events-none bg-[#123332] text-white p-2.5 rounded-xl text-xs shadow-lg space-y-1 transform -translate-x-1/2 -translate-y-full transition-all duration-150"
            style={{
              left: `${(activePoint.x / width) * 100}%`,
              top: `${Math.min(70, Math.max(25, (activePoint.sysY || 50) - 15))}px`,
            }}
          >
            <div className="font-bold border-b border-white/20 pb-0.5 text-[11px] text-[#A6E1DE]">
              {activePoint.fullDate} ({activePoint.weekday})
            </div>
            <div className="flex items-center gap-2 font-mono">
              <span className="text-[#FF8A8A]">Sistólica: {activePoint.systolic}</span>
              <span>/</span>
              <span className="text-[#A2C2F8]">Diastólica: {activePoint.diastolic}</span>
            </div>
            {activePoint.heartRate && (
              <div className="text-[10px] text-white/80">Pulso: {activePoint.heartRate} bpm</div>
            )}
            <div className="text-[9px] text-white/60">
              {activePoint.systolic! <= systolicTarget && activePoint.diastolic! <= diastolicTarget
                ? '✓ Dentro da meta'
                : '⚠ Acima da meta recomendada'}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-[11px] text-[#5C7472] px-1 pt-1">
        <span>Toque ou passe o mouse nos pontos para ver detalhes</span>
        <span>{data.length} dia(s) com dados</span>
      </div>
    </div>
  )
}

// -------------------------------------------------------------
// Sub-component: Weight SVG Chart with Baseline and Tooltips
// -------------------------------------------------------------
interface WeightSvgChartProps {
  data: DailyPoint[]
  baselineWeight: number
  hoveredIdx: number | null
  setHoveredIdx: (idx: number | null) => void
}

const WeightSvgChart: React.FC<WeightSvgChartProps> = ({
  data,
  baselineWeight,
  hoveredIdx,
  setHoveredIdx,
}) => {
  if (data.length === 0) {
    return (
      <div className="h-52 flex flex-col items-center justify-center text-xs text-[#5C7472] border border-dashed border-[#E3EFED] rounded-2xl bg-[#F6FBFA] p-4 text-center">
        <Weight className="w-8 h-8 text-[#5C7472]/40 mb-2" />
        <p className="font-bold text-[#123332]">Sem registros de peso no período</p>
        <p className="text-[11px] mt-1">
          Lançamentos de peso matinal são comparados com a meta basal de {baselineWeight.toFixed(1)}{' '}
          kg.
        </p>
      </div>
    )
  }

  // Dimensions
  const width = 540
  const height = 210
  const padding = { top: 25, right: 25, bottom: 35, left: 45 }
  const chartW = width - padding.left - padding.right
  const chartH = height - padding.top - padding.bottom

  // Scales
  const allWeights = [...data.map((d) => d.weight || baselineWeight), baselineWeight]
  const minVal = Math.floor(Math.min(...allWeights) - 1.5)
  const maxVal = Math.ceil(Math.max(...allWeights) + 1.5)
  const range = maxVal - minVal || 1

  const getY = (val: number) => padding.top + chartH - ((val - minVal) / range) * chartH
  const getX = (idx: number) =>
    padding.left + (data.length === 1 ? chartW / 2 : (idx / (data.length - 1)) * chartW)

  const baselineY = getY(baselineWeight)

  const points = data.map((d, idx) => {
    const x = getX(idx)
    const y = d.weight ? getY(d.weight) : getY(baselineWeight)
    return { ...d, x, y }
  })

  // Path
  const linePath = points.reduce((acc, p, idx) => {
    return idx === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`
  }, '')

  // Area under path
  const areaPath =
    points.length > 1
      ? `${linePath} L ${points[points.length - 1].x} ${padding.top + chartH} L ${
          points[0].x
        } ${padding.top + chartH} Z`
      : ''

  // Y-axis ticks
  const midVal = Number(((minVal + maxVal) / 2).toFixed(1))
  const yTicks = [minVal, baselineWeight, midVal, maxVal].sort((a, b) => a - b)

  const activePoint = hoveredIdx !== null && points[hoveredIdx] ? points[hoveredIdx] : null

  return (
    <div className="relative w-full">
      <div className="relative w-full aspect-[2.4/1] bg-[#F6FBFA] rounded-2xl border border-[#E3EFED] p-2 overflow-hidden select-none">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="weight-trend-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0E7C7B" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#0E7C7B" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {yTicks.map((val, i) => {
            const y = getY(val)
            const isBase = Math.abs(val - baselineWeight) < 0.05
            return (
              <g key={i}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke={isBase ? '#2E9E6B' : '#E3EFED'}
                  strokeWidth={isBase ? '1.5' : '1'}
                  strokeDasharray={isBase ? '4 4' : '2 2'}
                  opacity={isBase ? '0.9' : '0.7'}
                />
                <text
                  x={padding.left - 6}
                  y={y + 3.5}
                  textAnchor="end"
                  fontSize="9"
                  fill={isBase ? '#2E9E6B' : '#5C7472'}
                  fontWeight={isBase ? 'bold' : 'normal'}
                >
                  {val.toFixed(1)}
                </text>
              </g>
            )
          })}

          {/* Baseline Label */}
          <text
            x={width - padding.right}
            y={baselineY - 4}
            textAnchor="end"
            fontSize="8"
            fill="#2E9E6B"
            fontWeight="bold"
          >
            Basal de Alta ({baselineWeight.toFixed(1)} kg)
          </text>

          {/* Area under curve */}
          {areaPath && <path d={areaPath} fill="url(#weight-trend-grad)" />}

          {/* Weight Line */}
          {linePath && (
            <path
              d={linePath}
              fill="none"
              stroke="#0E7C7B"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Hover indicator vertical line */}
          {activePoint && (
            <line
              x1={activePoint.x}
              y1={padding.top}
              x2={activePoint.x}
              y2={padding.top + chartH}
              stroke="#123332"
              strokeWidth="1"
              strokeDasharray="2 2"
              opacity="0.4"
            />
          )}

          {/* Points & Interactive Zones */}
          {points.map((p, idx) => {
            const isHovered = hoveredIdx === idx
            return (
              <g
                key={idx}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                onClick={() => setHoveredIdx(isHovered ? null : idx)}
              >
                <rect x={p.x - 14} y={padding.top} width="28" height={chartH} fill="transparent" />

                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isHovered ? '6.5' : '4.5'}
                  fill="#FFFFFF"
                  stroke="#0E7C7B"
                  strokeWidth="2.5"
                  className="transition-all"
                />

                {(data.length <= 10 || idx % 2 === 0 || idx === data.length - 1) && (
                  <text
                    x={p.x}
                    y={padding.top + chartH + 16}
                    textAnchor="middle"
                    fontSize="9"
                    fontWeight={isHovered ? 'bold' : 'normal'}
                    fill={isHovered ? '#123332' : '#5C7472'}
                  >
                    {p.displayDate}
                  </text>
                )}
              </g>
            )
          })}
        </svg>

        {/* Floating Tooltip Box */}
        {activePoint && (
          <div
            className="absolute z-20 pointer-events-none bg-[#123332] text-white p-2.5 rounded-xl text-xs shadow-lg space-y-1 transform -translate-x-1/2 -translate-y-full transition-all duration-150"
            style={{
              left: `${(activePoint.x / width) * 100}%`,
              top: `${Math.min(75, Math.max(25, activePoint.y - 15))}px`,
            }}
          >
            <div className="font-bold border-b border-white/20 pb-0.5 text-[11px] text-[#A6E1DE]">
              {activePoint.fullDate} ({activePoint.weekday})
            </div>
            <div className="text-sm font-bold font-mono">
              {activePoint.weight?.toFixed(1)}{' '}
              <span className="text-[10px] font-normal text-white/80">kg</span>
            </div>
            {activePoint.weight && (
              <div className="text-[10px] text-white/80">
                Diferença vs Alta:{' '}
                <span
                  className={
                    activePoint.weight - baselineWeight > 0 ? 'text-[#FFD166]' : 'text-[#06D6A0]'
                  }
                >
                  {activePoint.weight - baselineWeight >= 0 ? '+' : ''}
                  {(activePoint.weight - baselineWeight).toFixed(1)} kg
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-[11px] text-[#5C7472] px-1 pt-1">
        <span>Toque ou passe o mouse para ver peso exato e data</span>
        <span>{data.length} dia(s) com dados</span>
      </div>
    </div>
  )
}
