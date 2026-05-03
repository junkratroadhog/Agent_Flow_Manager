import { create } from 'zustand'
import type { Project } from '@shared/db-types'

export interface ProjectState {
  projects: Project[]
  activeProjectId: string | null
  loading: boolean

  setProjects: (projects: Project[]) => void
  addProject: (project: Project) => void
  updateProject: (id: string, updates: Partial<Project>) => void
  removeProject: (id: string) => void
  setActiveProject: (id: string | null) => void
  setLoading: (loading: boolean) => void
}

export const useProjectStore = create<ProjectState>((set) => ({
  projects: [],
  activeProjectId: null,
  loading: false,

  setProjects: (projects): void => set({ projects }),
  addProject: (project): void =>
    set((s) => ({ projects: [project, ...s.projects] })),
  updateProject: (id, updates): void =>
    set((s) => ({
      projects: s.projects.map((p) => (p.id === id ? { ...p, ...updates } : p))
    })),
  removeProject: (id): void =>
    set((s) => ({
      projects: s.projects.filter((p) => p.id !== id),
      activeProjectId: s.activeProjectId === id ? null : s.activeProjectId
    })),
  setActiveProject: (id): void => set({ activeProjectId: id }),
  setLoading: (loading): void => set({ loading })
}))

// Selectors
export const selectActiveProject = (state: ProjectState): Project | null =>
  state.projects.find((p) => p.id === state.activeProjectId) ?? null
