import pb from '@/lib/pocketbase/client'
import type { MeasurementRecord, MeasurementSlot } from '@/types/database'

export const measurementsService = {
  async getByDate(dateStr: string): Promise<MeasurementRecord[]> {
    try {
      // Normalize date string (YYYY-MM-DD)
      const cleanDate = dateStr.split('T')[0]
      return await pb.collection('measurements').getFullList<MeasurementRecord>({
        filter: `date ~ '${cleanDate}'`,
        sort: 'slot',
      })
    } catch (err) {
      console.error('Error fetching measurements by date:', err)
      return []
    }
  },

  async getRecentDays(days: number = 28): Promise<MeasurementRecord[]> {
    try {
      // Para apoiar acompanhamento mesmo com datas simuladas ou reais futuras,
      // buscamos a lista ordenada por data decrescente e limitamos pelo número de registros
      // ou data mínima calculada a partir do registro mais recente
      const all = await pb.collection('measurements').getFullList<MeasurementRecord>({
        sort: '-date,slot',
      })
      if (all.length === 0) return []

      const newestDateStr = all[0].date.split('T')[0]
      const newestDate = new Date(newestDateStr + 'T00:00:00')
      const cutoff = new Date(newestDate)
      cutoff.setDate(cutoff.getDate() - days)
      const cutoffStr = cutoff.toISOString().split('T')[0]

      return all.filter((m) => m.date.split('T')[0] >= cutoffStr)
    } catch (err) {
      console.error('Error fetching recent measurements:', err)
      return []
    }
  },

  async getAll(): Promise<MeasurementRecord[]> {
    try {
      return await pb.collection('measurements').getFullList<MeasurementRecord>({
        sort: 'date,slot',
      })
    } catch (err) {
      console.error('Error fetching all measurements:', err)
      return []
    }
  },

  async upsertSlot(
    dateStr: string,
    slot: MeasurementSlot,
    data: Partial<Omit<MeasurementRecord, 'id' | 'created' | 'updated' | 'date' | 'slot'>>,
  ): Promise<MeasurementRecord> {
    const cleanDate = dateStr.split('T')[0]
    // Check if slot exists
    try {
      const existing = await pb
        .collection('measurements')
        .getFirstListItem<MeasurementRecord>(`date ~ '${cleanDate}' && slot = '${slot}'`)
      return await pb.collection('measurements').update<MeasurementRecord>(existing.id, {
        ...data,
      })
    } catch {
      // Doesn't exist, create it
      return await pb.collection('measurements').create<MeasurementRecord>({
        date: cleanDate,
        slot,
        ...data,
      })
    }
  },

  async update(id: string, data: Partial<MeasurementRecord>): Promise<MeasurementRecord> {
    return await pb.collection('measurements').update<MeasurementRecord>(id, data)
  },

  async delete(id: string): Promise<boolean> {
    await pb.collection('measurements').delete(id)
    return true
  },
}
