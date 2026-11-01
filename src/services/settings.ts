import pb from '@/lib/pocketbase/client'
import type { SettingsRecord } from '@/types/database'

export const settingsService = {
  async getSettings(): Promise<SettingsRecord | null> {
    try {
      const records = await pb.collection('settings').getFullList<SettingsRecord>({
        limit: 1,
      })
      return records[0] || null
    } catch (err) {
      console.error('Error fetching settings:', err)
      return null
    }
  },

  async updateSettings(id: string, data: Partial<SettingsRecord>): Promise<SettingsRecord> {
    return await pb.collection('settings').update<SettingsRecord>(id, data)
  },
}
