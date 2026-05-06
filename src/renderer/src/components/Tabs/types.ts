export type TabType = 'chat' | 'editor' | 'diff' | 'flow' | 'terminal' | 'plan' | 'settings'

export interface TabMetadata {
  id: string
  type: TabType
  title: string
  icon?: string
  pinned?: boolean
  modified?: boolean
  data?: any // Specific data for the tab type (e.g. session ID, file path)
}
