import type { GameSettings } from '../../types'

const SETTINGS_KEY = 'charadas.settings'
const DEFAULT_SETTINGS: GameSettings = { turnSeconds: 60 }
type SettingsStorage = Pick<Storage, 'getItem' | 'setItem'>

export function normalizeTurnSeconds(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return DEFAULT_SETTINGS.turnSeconds
  }
  const clampedValue = Math.min(300, Math.max(15, value))
  return Math.round(clampedValue / 5) * 5
}

export function loadSettings(
  storage: SettingsStorage = window.localStorage,
): GameSettings {
  try {
    const savedSettings = storage.getItem(SETTINGS_KEY)
    if (savedSettings === null) return { ...DEFAULT_SETTINGS }
    const parsed: unknown = JSON.parse(savedSettings)
    if (!isSettings(parsed)) return { ...DEFAULT_SETTINGS }
    return { turnSeconds: normalizeTurnSeconds(parsed.turnSeconds) }
  } catch {
    return { ...DEFAULT_SETTINGS }
  }
}

export function saveSettings(
  settings: GameSettings,
  storage: SettingsStorage = window.localStorage,
): void {
  try {
    storage.setItem(
      SETTINGS_KEY,
      JSON.stringify({ turnSeconds: normalizeTurnSeconds(settings.turnSeconds) }),
    )
  } catch {
    // Storage may be unavailable or full.
  }
}

function isSettings(value: unknown): value is GameSettings {
  return (
    typeof value === 'object' &&
    value !== null &&
    'turnSeconds' in value &&
    typeof value.turnSeconds === 'number'
  )
}
