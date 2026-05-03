import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type SidebarView = 'sessions' | 'projects' | 'tools' | 'marketplace' | 'settings' | null

export interface UIState {
  // Sidebar
  leftSidebarVisible: boolean
  leftSidebarView: SidebarView
  leftSidebarWidth: number
  rightSidebarVisible: boolean
  rightSidebarWidth: number
  bottomPanelVisible: boolean
  bottomPanelHeight: number

  // Theme
  theme: 'dark' | 'light'

  // Active tab
  activeTabId: string | null

  // Modals
  isProjectWizardOpen: boolean
  isSettingsOpen: boolean

  // Actions
  toggleLeftSidebar: () => void
  setLeftSidebarView: (view: SidebarView) => void
  setLeftSidebarWidth: (width: number) => void
  toggleRightSidebar: () => void
  setRightSidebarWidth: (width: number) => void
  toggleBottomPanel: () => void
  setBottomPanelHeight: (height: number) => void
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
      bottomPanelVisible: false,
      bottomPanelHeight: 200,
      theme: 'dark',
      activeTabId: null,
      isProjectWizardOpen: false,
      isSettingsOpen: false,

      toggleLeftSidebar: () =>
        set((s) => ({ leftSidebarVisible: !s.leftSidebarVisible })),
      setLeftSidebarView: (view) => set({ leftSidebarView: view }),
      setLeftSidebarWidth: (width) => set({ leftSidebarWidth: width }),
      toggleRightSidebar: () =>
        set((s) => ({ rightSidebarVisible: !s.rightSidebarVisible })),
      setRightSidebarWidth: (width) => set({ rightSidebarWidth: width }),
      toggleBottomPanel: () =>
        set((s) => ({ bottomPanelVisible: !s.bottomPanelVisible })),
      setBottomPanelHeight: (height) => set({ bottomPanelHeight: height }),
      setTheme: (theme) => set({ theme }),
      setActiveTabId: (id) => set({ activeTabId: id }),
      setProjectWizardOpen: (open) => set({ isProjectWizardOpen: open }),
      setSettingsOpen: (open) => set({ isSettingsOpen: open })
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
      })
    }
  )
)
