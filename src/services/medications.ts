import pb from '@/lib/pocketbase/client'
import type { MedicationRecord, MedicationLogRecord } from '@/types/database'

export const medicationsService = {
  async getActiveMedications(): Promise<MedicationRecord[]> {
    try {
      const records = await pb.collection('medications').getFullList<MedicationRecord>({
        filter: 'active = true',
        sort: 'created',
      })
      return records.map((m) => ({
        ...m,
        times: typeof m.times === 'string' ? JSON.parse(m.times) : m.times,
      }))
    } catch (err) {
      console.error('Error fetching medications:', err)
      return []
    }
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
