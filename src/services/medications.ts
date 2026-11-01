import pb from '@/lib/pocketbase/client'
import type { MedicationRecord, MedicationLogRecord } from '@/types/database'

function normalizeMedication(m: MedicationRecord): MedicationRecord {
  let times: string[] = []
  if (Array.isArray(m.times)) {
    times = m.times
  } else if (typeof m.times === 'string') {
    try {
      times = JSON.parse(m.times)
    } catch {
      times = [m.times]
    }
  }

  let phases: any = undefined
  if (m.phases) {
    if (typeof m.phases === 'string') {
      try {
        phases = JSON.parse(m.phases)
      } catch {
        phases = []
      }
    } else {
      phases = m.phases
    }
  }

  return {
    ...m,
    times,
    phases,
  }
}

export const medicationsService = {
  async getAll(): Promise<MedicationRecord[]> {
    try {
      const records = await pb.collection('medications').getFullList<MedicationRecord>({
        sort: 'name',
      })
      return records.map(normalizeMedication)
    } catch (err) {
      console.error('Error fetching all medications:', err)
      return []
    }
  },

  async getActiveMedications(): Promise<MedicationRecord[]> {
    try {
      const records = await pb.collection('medications').getFullList<MedicationRecord>({
        filter: 'active = true',
        sort: 'name',
      })
      return records.map(normalizeMedication)
    } catch (err) {
      console.error('Error fetching medications:', err)
      return []
    }
  },

  async create(data: Partial<MedicationRecord>): Promise<MedicationRecord> {
    const payload = {
      ...data,
      times: Array.isArray(data.times) ? JSON.stringify(data.times) : data.times,
      phases: data.phases
        ? typeof data.phases === 'string'
          ? data.phases
          : JSON.stringify(data.phases)
        : null,
    }
    const rec = await pb.collection('medications').create<MedicationRecord>(payload)
    return normalizeMedication(rec)
  },

  async update(id: string, data: Partial<MedicationRecord>): Promise<MedicationRecord> {
    const payload: any = { ...data }
    if (data.times !== undefined) {
      payload.times = Array.isArray(data.times) ? JSON.stringify(data.times) : data.times
    }
    if (data.phases !== undefined) {
      payload.phases = data.phases
        ? typeof data.phases === 'string'
          ? data.phases
          : JSON.stringify(data.phases)
        : null
    }
    const rec = await pb.collection('medications').update<MedicationRecord>(id, payload)
    return normalizeMedication(rec)
  },

  async delete(id: string): Promise<boolean> {
    await pb.collection('medications').delete(id)
    return true
  },

  async getLogsByDate(dateStr: string): Promise<MedicationLogRecord[]> {
    try {
      const cleanDate = dateStr.split('T')[0]
      return await pb.collection('medication_logs').getFullList<MedicationLogRecord>({
        filter: `date ~ '${cleanDate}'`,
        expand: 'medication',
        sort: 'time',
      })
    } catch (err) {
      console.error('Error fetching medication logs:', err)
      return []
    }
  },

  async toggleTaken(
    dateStr: string,
    medicationId: string,
    time: string,
    taken: boolean,
  ): Promise<MedicationLogRecord> {
    const cleanDate = dateStr.split('T')[0]
    const takenAt = taken ? new Date().toISOString() : null

    try {
      const existing = await pb
        .collection('medication_logs')
        .getFirstListItem<MedicationLogRecord>(
          `date ~ '${cleanDate}' && medication = '${medicationId}' && time = '${time}'`,
        )
      return await pb.collection('medication_logs').update<MedicationLogRecord>(existing.id, {
        taken,
        taken_at: takenAt,
      })
    } catch {
      return await pb.collection('medication_logs').create<MedicationLogRecord>({
        date: cleanDate,
        medication: medicationId,
        time,
        taken,
        taken_at: takenAt,
      })
    }
  },
}
