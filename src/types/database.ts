import type { RecordModel } from 'pocketbase'

export type MeasurementSlot = '07:00' | '12:00' | '18:00' | '23:00'

export interface MeasurementRecord extends RecordModel {
  id: string
  date: string // YYYY-MM-DD
  slot: MeasurementSlot
  systolic?: number
  diastolic?: number
  glucose?: number
  heart_rate?: number
  water_ml?: number
  temperature?: number
  urine_ml?: number
  weight_kg?: number
  notes?: string
  created: string
  updated: string
}

export interface MedicationRecord extends RecordModel {
  id: string
  name: string
  dose: string
  times: string[] | string // ["07:00", "19:00"]
  active: boolean
  created: string
  updated: string
}

export interface MedicationLogRecord extends RecordModel {
  id: string
  date: string // YYYY-MM-DD
  medication: string
  time: string
  taken: boolean
  taken_at?: string
  created: string
  updated: string
  expand?: {
    medication?: MedicationRecord
  }
}

export interface LabRecord extends RecordModel {
  id: string
  exam_date: string // YYYY-MM-DD
  creatinine?: number
  urea?: number
  potassium?: number
  sodium?: number
  hemoglobin?: number
  gfr?: number
  notes?: string
  created: string
  updated: string
}

export type AppointmentType = 'consulta' | 'exame'

export interface AppointmentRecord extends RecordModel {
  id: string
  date: string // YYYY-MM-DD
  time?: string // HH:mm
  title: string
  doctor?: string
  location?: string
  type: AppointmentType
  fasting_required: boolean
  notes?: string
  done: boolean
  created: string
  updated: string
}

export interface SettingsRecord extends RecordModel {
  id: string
  patient_name: string
  transplant_date: string // YYYY-MM-DD
  discharge_date: string // YYYY-MM-DD
  baseline_weight_kg: number
  daily_water_goal_ml: number
  emergency_contact_1_name: string
  emergency_contact_1_phone: string
  emergency_contact_2_name: string
  emergency_contact_2_phone: string
  created: string
  updated: string
}
