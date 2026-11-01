import pb from '@/lib/pocketbase/client'
import type { LabRecord } from '@/types/database'

export const labsService = {
  async getAll(): Promise<LabRecord[]> {
    try {
      return await pb.collection('labs').getFullList<LabRecord>({
        sort: 'exam_date',
      })
    } catch (err) {
      console.error('Error fetching labs:', err)
      return []
    }
  },

  async create(data: Omit<LabRecord, 'id' | 'created' | 'updated'>): Promise<LabRecord> {
    return await pb.collection('labs').create<LabRecord>(data)
  },

  async update(id: string, data: Partial<LabRecord>): Promise<LabRecord> {
    return await pb.collection('labs').update<LabRecord>(id, data)
  },

  async delete(id: string): Promise<boolean> {
    return await pb.collection('labs').delete(id)
  },
}
