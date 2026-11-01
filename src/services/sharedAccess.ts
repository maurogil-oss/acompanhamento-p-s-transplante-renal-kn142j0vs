import pb from '@/lib/pocketbase/client'
import type { SharedAccessRecord, SharedAccessRole } from '@/types/database'

export const sharedAccessService = {
  async getAll(): Promise<SharedAccessRecord[]> {
    try {
      return await pb.collection('shared_access').getFullList<SharedAccessRecord>({
        sort: '-created',
      })
    } catch (err) {
      console.error('Error fetching shared access list:', err)
      return []
    }
  },

  async getByCode(code: string): Promise<SharedAccessRecord | null> {
    try {
      const cleanCode = code.trim()
      return await pb
        .collection('shared_access')
        .getFirstListItem<SharedAccessRecord>(`code = '${cleanCode}' && active = true`)
    } catch (err) {
      return null
    }
  },

  async create(data: {
    name: string
    role: SharedAccessRole
    notes?: string
  }): Promise<SharedAccessRecord> {
    // Generate an easy-to-type code: e.g. MED-8392 or FAM-4721
    const prefix = data.role === 'medico' ? 'MED' : data.role === 'familiar' ? 'FAM' : 'AUT'
    const randomSuffix = Math.floor(1000 + Math.random() * 9000)
    const code = `${prefix}-${randomSuffix}`

    return await pb.collection('shared_access').create<SharedAccessRecord>({
      name: data.name.trim(),
      role: data.role,
      code,
      active: true,
      notes: data.notes?.trim() || '',
    })
  },

  async toggleActive(id: string, active: boolean): Promise<SharedAccessRecord> {
    return await pb.collection('shared_access').update<SharedAccessRecord>(id, {
      active,
    })
  },

  async delete(id: string): Promise<boolean> {
    await pb.collection('shared_access').delete(id)
    return true
  },
}
