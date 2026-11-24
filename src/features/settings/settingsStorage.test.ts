import { describe, expect, it } from 'vitest'
import type { GameSettings } from '../../types'
import { loadSettings, normalizeTurnSeconds, saveSettings } from './settingsStorage'

type MemoryStorage = {
  getItem: (key: string) => string | null
  setItem: (key: string, value: string) => void
}

function createMemoryStorage(initial: Record<string, string> = {}): MemoryStorage {
  const values = new Map(Object.entries(initial))
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  }
}

describe('settings storage', () => {
  it('uses 60 seconds when no value is saved', () => {
    expect(loadSettings(createMemoryStorage())).toEqual({ turnSeconds: 60 })
  })

  it('clamps low values to 15 seconds', () => {
    expect(normalizeTurnSeconds(10)).toBe(15)
  })

  it('clamps high values to 300 seconds', () => {
    expect(normalizeTurnSeconds(305)).toBe(300)
  })

  it('rounds values to the nearest five seconds', () => {
    expect(normalizeTurnSeconds(62)).toBe(60)
    expect(normalizeTurnSeconds(63)).toBe(65)
  })

  it('uses 60 seconds for non-numeric and non-finite input', () => {
    expect(normalizeTurnSeconds('90')).toBe(60)
    expect(normalizeTurnSeconds(Number.NaN)).toBe(60)
    expect(normalizeTurnSeconds(Number.POSITIVE_INFINITY)).toBe(60)
  })

  it('uses 60 seconds when saved JSON is corrupt', () => {
    const storage = createMemoryStorage({ 'charadas.settings': '{invalid' })
    expect(loadSettings(storage)).toEqual({ turnSeconds: 60 })
  })

  it('uses 60 seconds when saved settings have an invalid shape', () => {
    const storage = createMemoryStorage({ 'charadas.settings': '{"turnSeconds":"90"}' })
    expect(loadSettings(storage)).toEqual({ turnSeconds: 60 })
  })

  it('saves normalized settings to the provided storage', () => {
    const storage = createMemoryStorage()
    const settings: GameSettings = { turnSeconds: 63 }
    saveSettings(settings, storage)
    expect(loadSettings(storage)).toEqual({ turnSeconds: 65 })
  })

  it('handles storage read and write errors', () => {
    const failingStorage: MemoryStorage = {
      getItem: () => {
        throw new Error('unavailable')
      },
      setItem: () => {
        throw new Error('unavailable')
      },
    }
    expect(loadSettings(failingStorage)).toEqual({ turnSeconds: 60 })
    expect(() => saveSettings({ turnSeconds: 60 }, failingStorage)).not.toThrow()
  })
})
