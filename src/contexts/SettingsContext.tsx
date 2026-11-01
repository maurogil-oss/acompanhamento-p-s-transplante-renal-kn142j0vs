import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { settingsService } from '@/services/settings'
import type { SettingsRecord } from '@/types/database'
import { useRealtime } from '@/hooks/use-realtime'

interface SettingsContextType {
  settings: SettingsRecord | null
  loading: boolean
  refreshSettings: () => Promise<void>
  updateSettings: (data: Partial<SettingsRecord>) => Promise<SettingsRecord | null>
  emergencyModalOpen: boolean
  setEmergencyModalOpen: (open: boolean) => void
}

const SettingsContext = createContext<SettingsContextType>({
  settings: null,
  loading: true,
  refreshSettings: async () => {},
  updateSettings: async () => null,
  emergencyModalOpen: false,
  setEmergencyModalOpen: () => {},
})

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SettingsRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [emergencyModalOpen, setEmergencyModalOpen] = useState(false)

  const refreshSettings = useCallback(async () => {
    try {
      const s = await settingsService.getSettings()
      setSettings(s)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshSettings()
  }, [refreshSettings])

  useRealtime<SettingsRecord>('settings', () => {
    refreshSettings()
  })

  const updateSettings = async (data: Partial<SettingsRecord>) => {
    if (!settings) return null
    const updated = await settingsService.updateSettings(settings.id, data)
    setSettings(updated)
    return updated
  }

  return (
    <SettingsContext.Provider
      value={{
        settings,
        loading,
        refreshSettings,
        updateSettings,
        emergencyModalOpen,
        setEmergencyModalOpen,
      }}
    >
      {children}
    </SettingsContext.Provider>
  )
}

export const useAppSettings = () => useContext(SettingsContext)
