import { create } from 'zustand'
import { persist } from 'zustand/middleware'

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

  // Active tab
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

  // Misc
  setTheme: (theme: 'dark' | 'light') => void
  setActiveTabId: (id: string | null) => void
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
      setTheme: (theme): void => {
        set({ theme })
      },
      setActiveTabId: (id): void => {
        set({ activeTabId: id })
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
        theme: state.theme
        // Note: rightSidebarAutoCollapsed and leftSidebarAutoCollapsed are NOT persisted.
        // They reset to false on each app launch.
      })
    }
  )
)
