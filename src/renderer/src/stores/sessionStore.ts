import { create } from 'zustand'
import type { Session, Message } from '@shared/db-types'

export interface SessionState {
  sessions: Session[]
  activeSessionId: string | null
  messagesBySession: Record<string, Message[]>
  draftBySession: Record<string, string>
  isStreaming: boolean
  loading: boolean

  setSessions: (sessions: Session[]) => void
  addSession: (session: Session) => void
  updateSession: (id: string, updates: Partial<Session>) => void
  removeSession: (id: string) => void
  setActiveSession: (id: string | null) => void

  setMessages: (sessionId: string, messages: Message[]) => void
  appendMessage: (sessionId: string, message: Message) => void
  updateLastMessage: (sessionId: string, content: string) => void

  setDraft: (sessionId: string, draft: string) => void
  clearDraft: (sessionId: string) => void

  setStreaming: (streaming: boolean) => void
  setLoading: (loading: boolean) => void
}

export const useSessionStore = create<SessionState>((set) => ({
  sessions: [],
  activeSessionId: null,
  messagesBySession: {},
  draftBySession: {},
  isStreaming: false,
  loading: false,

  setSessions: (sessions): void => set({ sessions }),
  addSession: (session): void =>
    set((s) => ({ sessions: [session, ...s.sessions] })),
  updateSession: (id, updates): void =>
    set((s) => ({
      sessions: s.sessions.map((sess) => (sess.id === id ? { ...sess, ...updates } : sess))
    })),
  removeSession: (id): void =>
    set((s) => {
      const { [id]: _removed, ...rest } = s.messagesBySession
      void _removed
      return {
        sessions: s.sessions.filter((sess) => sess.id !== id),
        messagesBySession: rest,
        activeSessionId: s.activeSessionId === id ? null : s.activeSessionId
      }
    }),
  setActiveSession: (id): void => set({ activeSessionId: id }),

  setMessages: (sessionId, messages): void =>
    set((s) => ({
      messagesBySession: { ...s.messagesBySession, [sessionId]: messages }
    })),

  appendMessage: (sessionId, message): void =>
    set((s) => ({
      messagesBySession: {
        ...s.messagesBySession,
        [sessionId]: [...(s.messagesBySession[sessionId] ?? []), message]
      }
    })),

  updateLastMessage: (sessionId, content): void =>
    set((s) => {
      const msgs = s.messagesBySession[sessionId] ?? []
      if (msgs.length === 0) return s
      const updated = [...msgs]
      updated[updated.length - 1] = { ...updated[updated.length - 1], content }
      return {
        messagesBySession: { ...s.messagesBySession, [sessionId]: updated }
      }
    }),

  setDraft: (sessionId, draft): void =>
    set((s) => ({
      draftBySession: { ...s.draftBySession, [sessionId]: draft }
    })),

  clearDraft: (sessionId): void =>
    set((s) => {
      const { [sessionId]: _removed, ...rest } = s.draftBySession
      void _removed
      return { draftBySession: rest }
    }),

  setStreaming: (streaming): void => set({ isStreaming: streaming }),
  setLoading: (loading): void => set({ loading })
}))

// Selectors
export const selectActiveSession = (state: SessionState): Session | null =>
  state.sessions.find((s) => s.id === state.activeSessionId) ?? null

export const selectActiveMessages = (state: SessionState): Message[] =>
  state.activeSessionId ? state.messagesBySession[state.activeSessionId] ?? [] : []
