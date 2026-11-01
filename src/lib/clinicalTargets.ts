import type { MeasurementRecord } from '@/types/database'

export interface TargetEvaluation {
  isOffTarget: boolean
  level: 'normal' | 'warning' | 'alert' // warning = amarelo (#D97706 / #FEF3C7), alert = vermelho (#D64545 / #FDEEEE)
  reasons: string[]
  message: string
}

/**
 * Avalia se medições de PA, glicemia e temperatura estão fora das metas clínicas combinadas:
 * - PA: sistólica ≥ 140 OU diastólica ≥ 90
 * - Glicemia: > 180 mg/dL ou < 70 mg/dL
 * - Febre: temperatura ≥ 37.8°C
 */
export function evaluateMeasurementSlot(m?: Partial<MeasurementRecord> | null): TargetEvaluation {
  if (!m) {
    return { isOffTarget: false, level: 'normal', reasons: [], message: '' }
  }

  const reasons: string[] = []
  let hasAlert = false
  let hasWarning = false

  // PA: ≥ 140 / 90
  if (m.systolic !== undefined && m.systolic !== null && m.systolic > 0) {
    if (m.systolic >= 160 || (m.diastolic !== undefined && m.diastolic >= 100)) {
      reasons.push(`PA elevada (${m.systolic}/${m.diastolic || 0} mmHg)`)
      hasAlert = true
    } else if (m.systolic >= 140 || (m.diastolic !== undefined && m.diastolic >= 90)) {
      reasons.push(`PA acima da meta (${m.systolic}/${m.diastolic || 0} mmHg)`)
      hasWarning = true
    }
  }

  // Glicemia: > 180 ou < 70
  if (m.glucose !== undefined && m.glucose !== null && m.glucose > 0) {
    if (m.glucose < 70) {
      reasons.push(`Glicemia baixa (${m.glucose} mg/dL)`)
      hasAlert = true
    } else if (m.glucose > 240) {
      reasons.push(`Glicemia muito alta (${m.glucose} mg/dL)`)
      hasAlert = true
    } else if (m.glucose > 180) {
      reasons.push(`Glicemia acima da meta (${m.glucose} mg/dL)`)
      hasWarning = true
    }
  }

  // Temperatura: ≥ 37.8°C
  if (m.temperature !== undefined && m.temperature !== null && m.temperature > 0) {
    if (m.temperature >= 37.8) {
      reasons.push(`Temperatura febril (${m.temperature.toFixed(1)}°C)`)
      hasAlert = true
    }
  }

  const isOffTarget = hasAlert || hasWarning
  const level: 'normal' | 'warning' | 'alert' = hasAlert
    ? 'alert'
    : hasWarning
      ? 'warning'
      : 'normal'
  const message = isOffTarget ? 'Fora da meta combinada — comunique sua equipe' : ''

  return { isOffTarget, level, reasons, message }
}

/**
 * Avalia a diurese de hoje comparada à diurese de ontem:
 * Queda de diurese > 30% em relação ao dia anterior (quando ambos têm registro significativo)
 */
export function evaluateUrineDrop(
  todayUrineMl: number,
  yesterdayUrineMl: number,
): { isDrop: boolean; percentDrop: number; message: string } {
  if (yesterdayUrineMl >= 500 && todayUrineMl > 0) {
    const drop = (yesterdayUrineMl - todayUrineMl) / yesterdayUrineMl
    if (drop >= 0.3) {
      const pct = Math.round(drop * 100)
      return {
        isDrop: true,
        percentDrop: pct,
        message: 'Fora da meta combinada — comunique sua equipe',
      }
    }
  }
  return { isDrop: false, percentDrop: 0, message: '' }
}
