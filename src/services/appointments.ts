import pb from '@/lib/pocketbase/client'
import type { AppointmentRecord } from '@/types/database'

export const appointmentsService = {
  async getAll(): Promise<AppointmentRecord[]> {
    try {
      return await pb.collection('appointments').getFullList<AppointmentRecord>({
        sort: 'date,time',
      })
    } catch (err) {
      console.error('Error fetching appointments:', err)
      return []
    }
  },

  async getUpcoming(): Promise<AppointmentRecord[]> {
    try {
      return await pb.collection('appointments').getFullList<AppointmentRecord>({
        filter: 'done = false',
        sort: 'date,time',
      })
    } catch (err) {
      console.error('Error fetching upcoming appointments:', err)
      return []
    }
  },

  async create(
    data: Omit<AppointmentRecord, 'id' | 'created' | 'updated'>,
  ): Promise<AppointmentRecord> {
    return await pb.collection('appointments').create<AppointmentRecord>(data)
  },

  async update(id: string, data: Partial<AppointmentRecord>): Promise<AppointmentRecord> {
    return await pb.collection('appointments').update<AppointmentRecord>(id, data)
  },

  async toggleDone(id: string, done: boolean): Promise<AppointmentRecord> {
    return await pb.collection('appointments').update<AppointmentRecord>(id, { done })
  },

  async delete(id: string): Promise<boolean> {
    return await pb.collection('appointments').delete(id)
  },
}
