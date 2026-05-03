import { create } from 'zustand'

export type ExecutionMode = 'parallel' | 'serial'
export type BrainMode = 'fast' | 'plan' | 'deepThink' | 'deepResearch' | 'advanced'

export interface BrainModeConfig {
  model: string
  systemPrompt?: string
  temperature?: number
  maxTokens?: number
}

export interface SettingsState {
  // Models
  primaryModel: string
  brainModes: Record<BrainMode, BrainModeConfig>
  currentBrainMode: BrainMode
  executionMode: ExecutionMode

  // Provider statuses
  providerStatus: Record<string, 'unknown' | 'online' | 'offline' | 'error'>

  // General preferences
  fontSize: number
  language: string
  telemetryEnabled: boolean
  autoUpdate: boolean

  setPrimaryModel: (model: string) => void
  setBrainModeConfig: (mode: BrainMode, config: BrainModeConfig) => void
  setCurrentBrainMode: (mode: BrainMode) => void
  setExecutionMode: (mode: ExecutionMode) => void
  setProviderStatus: (provider: string, status: SettingsState['providerStatus'][string]) => void
  setFontSize: (size: number) => void
  setLanguage: (lang: string) => void
  setTelemetryEnabled: (enabled: boolean) => void
  setAutoUpdate: (enabled: boolean) => void
}

const DEFAULT_BRAIN_MODES: Record<BrainMode, BrainModeConfig> = {
  fast: { model: 'gemini-flash', temperature: 0.5 },
  plan: { model: 'claude-sonnet', temperature: 0.7 },
  deepThink: { model: 'claude-opus', temperature: 0.7 },
  deepResearch: { model: 'gpt-4o', temperature: 0.5 },
  advanced: { model: 'claude-opus', temperature: 0.7 }
}

export const useSettingsStore = create<SettingsState>((set) => ({
  primaryModel: 'claude-opus',
  brainModes: DEFAULT_BRAIN_MODES,
  currentBrainMode: 'deepThink',
  executionMode: 'serial',
  providerStatus: {},
  fontSize: 13,
  language: 'en',
  telemetryEnabled: false,
  autoUpdate: true,

  setPrimaryModel: (model): void => set({ primaryModel: model }),
  setBrainModeConfig: (mode, config): void =>
    set((s) => ({ brainModes: { ...s.brainModes, [mode]: config } })),
  setCurrentBrainMode: (mode): void => set({ currentBrainMode: mode }),
  setExecutionMode: (mode): void => set({ executionMode: mode }),
  setProviderStatus: (provider, status): void =>
    set((s) => ({ providerStatus: { ...s.providerStatus, [provider]: status } })),
  setFontSize: (size): void => set({ fontSize: size }),
  setLanguage: (lang): void => set({ language: lang }),
  setTelemetryEnabled: (enabled): void => set({ telemetryEnabled: enabled }),
  setAutoUpdate: (enabled): void => set({ autoUpdate: enabled })
}))
