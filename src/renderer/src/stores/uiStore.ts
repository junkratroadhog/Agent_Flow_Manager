import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { TabMetadata } from '../components/Tabs/types'

export type SidebarView = 'sessions' | 'projects' | 'tools' | 'marketplace' | 'settings' | null

export interface UIState {
  // Sidebar visibility (manual toggle from activity bar / Ctrl+B)
  leftSidebarVisible: boolean
  leftSidebarView: SidebarView
  leftSidebarWidth: number

  // Right sidebar
  rightSidebarVisible: boolean
  rightSidebarWidth: number

  // Auto-collapsed state (driven by panel drag behavior, NOT manual toggle).
  // When true, the panel slides off-screen but visibility flag is unchanged.
  rightSidebarAutoCollapsed: boolean
  leftSidebarAutoCollapsed: boolean

  // Bottom panel
  bottomPanelVisible: boolean
  bottomPanelHeight: number

  // Theme
  theme: 'dark' | 'light'

  // Tabs
  tabs: TabMetadata[]
  activeTabId: string | null

  // Modals
  isProjectWizardOpen: boolean
  isSettingsOpen: boolean

  // Manual toggle actions
  toggleLeftSidebar: () => void
  setLeftSidebarView: (view: SidebarView) => void
  setLeftSidebarWidth: (width: number) => void
  toggleRightSidebar: () => void
  setRightSidebarWidth: (width: number) => void
  toggleBottomPanel: () => void
  setBottomPanelHeight: (height: number) => void

  // Auto-collapse actions (for the new panel system)
  setRightSidebarAutoCollapsed: (collapsed: boolean) => void
  setLeftSidebarAutoCollapsed: (collapsed: boolean) => void

  // Tabs actions
  addTab: (tab: Partial<TabMetadata>) => void
  closeTab: (id: string) => void
  setActiveTabId: (id: string | null) => void
  reorderTabs: (startIndex: number, endIndex: number) => void
  updateTab: (id: string, updates: Partial<TabMetadata>) => void
  closeOtherTabs: (id: string) => void
  closeTabsToTheRight: (id: string) => void
  closeAllTabs: () => void
  nextTab: () => void
  prevTab: () => void

  // Misc
  setTheme: (theme: 'dark' | 'light') => void
  setProjectWizardOpen: (open: boolean) => void
  setSettingsOpen: (open: boolean) => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      leftSidebarVisible: true,
      leftSidebarView: 'sessions',
      leftSidebarWidth: 260,
      rightSidebarVisible: true,
      rightSidebarWidth: 320,
      rightSidebarAutoCollapsed: false,
      leftSidebarAutoCollapsed: false,
      bottomPanelVisible: false,
      bottomPanelHeight: 200,
      theme: 'dark',
      tabs: [],
      activeTabId: null,
      isProjectWizardOpen: false,
      isSettingsOpen: false,

      toggleLeftSidebar: (): void => {
        set((s) => ({ leftSidebarVisible: !s.leftSidebarVisible }))
      },
      setLeftSidebarView: (view): void => {
        set({ leftSidebarView: view })
      },
      setLeftSidebarWidth: (width): void => {
        set({ leftSidebarWidth: width })
      },
      toggleRightSidebar: (): void => {
        set((s) => ({ rightSidebarVisible: !s.rightSidebarVisible }))
      },
      setRightSidebarWidth: (width): void => {
        set({ rightSidebarWidth: width })
      },
      toggleBottomPanel: (): void => {
        set((s) => ({ bottomPanelVisible: !s.bottomPanelVisible }))
      },
      setBottomPanelHeight: (height): void => {
        set({ bottomPanelHeight: height })
      },
      setRightSidebarAutoCollapsed: (collapsed): void => {
        set({ rightSidebarAutoCollapsed: collapsed })
      },
      setLeftSidebarAutoCollapsed: (collapsed): void => {
        set({ leftSidebarAutoCollapsed: collapsed })
      },
      addTab: (tab): void => {
        set((s) => {
          const id = tab.id || Math.random().toString(36).substring(7)
          const newTab = {
            id,
            type: 'chat',
            title: 'New Chat',
            ...tab
          } as TabMetadata

          // Don't add if already exists (by ID)
          if (s.tabs.find((t) => t.id === id)) {
            return { activeTabId: id }
          }

          return {
            tabs: [...s.tabs, newTab],
            activeTabId: id
          }
        })
      },
      closeTab: (id): void => {
        set((s) => {
          const newTabs = s.tabs.filter((t) => t.id !== id)
          let newActiveTabId = s.activeTabId

          if (s.activeTabId === id) {
            newActiveTabId = newTabs.length > 0 ? newTabs[newTabs.length - 1].id : null
          }

          return {
            tabs: newTabs,
            activeTabId: newActiveTabId
          }
        })
      },
      setActiveTabId: (id): void => {
        set({ activeTabId: id })
      },
      reorderTabs: (startIndex, endIndex): void => {
        set((s) => {
          const newTabs = Array.from(s.tabs)
          const [removed] = newTabs.splice(startIndex, 1)
          newTabs.splice(endIndex, 0, removed)
          return { tabs: newTabs }
        })
      },
      updateTab: (id, updates): void => {
        set((s) => ({
          tabs: s.tabs.map((t) => (t.id === id ? { ...t, ...updates } : t))
        }))
      },
      closeOtherTabs: (id): void => {
        set((s) => {
          const newTabs = s.tabs.filter((t) => t.id === id || t.pinned)
          return {
            tabs: newTabs,
            activeTabId: id
          }
        })
      },
      closeTabsToTheRight: (id): void => {
        set((s) => {
          const index = s.tabs.findIndex((t) => t.id === id)
          if (index === -1) return {}
          const newTabs = s.tabs.filter((t, i) => i <= index || t.pinned)
          return {
            tabs: newTabs,
            activeTabId: id
          }
        })
      },
      closeAllTabs: (): void => {
        set((s) => ({
          tabs: s.tabs.filter((t) => t.pinned),
          activeTabId: s.tabs.find((t) => t.pinned)?.id || null
        }))
      },
      nextTab: (): void => {
        set((s) => {
          if (s.tabs.length <= 1) return {}
          const currentIndex = s.tabs.findIndex((t) => t.id === s.activeTabId)
          const nextIndex = (currentIndex + 1) % s.tabs.length
          return { activeTabId: s.tabs[nextIndex].id }
        })
      },
      prevTab: (): void => {
        set((s) => {
          if (s.tabs.length <= 1) return {}
          const currentIndex = s.tabs.findIndex((t) => t.id === s.activeTabId)
          const prevIndex = (currentIndex - 1 + s.tabs.length) % s.tabs.length
          return { activeTabId: s.tabs[prevIndex].id }
        })
      },
      setTheme: (theme): void => {
        set({ theme })
      },
      setProjectWizardOpen: (open): void => {
        set({ isProjectWizardOpen: open })
      },
      setSettingsOpen: (open): void => {
        set({ isSettingsOpen: open })
      }
    }),
    {
      name: 'ui-store',
      partialize: (state) => ({
        leftSidebarVisible: state.leftSidebarVisible,
        leftSidebarView: state.leftSidebarView,
        leftSidebarWidth: state.leftSidebarWidth,
        rightSidebarVisible: state.rightSidebarVisible,
        rightSidebarWidth: state.rightSidebarWidth,
        bottomPanelVisible: state.bottomPanelVisible,
        bottomPanelHeight: state.bottomPanelHeight,
        theme: state.theme,
        tabs: state.tabs,
        activeTabId: state.activeTabId
        // Note: rightSidebarAutoCollapsed and leftSidebarAutoCollapsed are NOT persisted.
        // They reset to false on each app launch.
      })
    }
  )
)
