import { create } from 'zustand'

export interface FlowNode {
  id: string
  type: 'primary' | 'sub' | 'tool'
  agentId: string
  position: { x: number; y: number }
  data: {
    label: string
    status: string
    model?: string
    currentAction?: string
  }
}

export interface FlowEdge {
  id: string
  source: string
  target: string
  type: 'spawn' | 'message' | 'result'
  animated?: boolean
}

export interface FlowState {
  nodesBySession: Record<string, FlowNode[]>
  edgesBySession: Record<string, FlowEdge[]>
  manualPositions: Record<string, { x: number; y: number }>

  setNodes: (sessionId: string, nodes: FlowNode[]) => void
  setEdges: (sessionId: string, edges: FlowEdge[]) => void
  addNode: (sessionId: string, node: FlowNode) => void
  addEdge: (sessionId: string, edge: FlowEdge) => void
  updateNode: (sessionId: string, nodeId: string, updates: Partial<FlowNode>) => void
  setManualPosition: (nodeId: string, position: { x: number; y: number }) => void
  clearSession: (sessionId: string) => void
}

export const useFlowStore = create<FlowState>((set) => ({
  nodesBySession: {},
  edgesBySession: {},
  manualPositions: {},

  setNodes: (sessionId, nodes): void =>
    set((s) => ({ nodesBySession: { ...s.nodesBySession, [sessionId]: nodes } })),
  setEdges: (sessionId, edges): void =>
    set((s) => ({ edgesBySession: { ...s.edgesBySession, [sessionId]: edges } })),
  addNode: (sessionId, node): void =>
    set((s) => ({
      nodesBySession: {
        ...s.nodesBySession,
        [sessionId]: [...(s.nodesBySession[sessionId] ?? []), node]
      }
    })),
  addEdge: (sessionId, edge): void =>
    set((s) => ({
      edgesBySession: {
        ...s.edgesBySession,
        [sessionId]: [...(s.edgesBySession[sessionId] ?? []), edge]
      }
    })),
  updateNode: (sessionId, nodeId, updates): void =>
    set((s) => ({
      nodesBySession: {
        ...s.nodesBySession,
        [sessionId]: (s.nodesBySession[sessionId] ?? []).map((n) =>
          n.id === nodeId ? { ...n, ...updates } : n
        )
      }
    })),
  setManualPosition: (nodeId, position): void =>
    set((s) => ({ manualPositions: { ...s.manualPositions, [nodeId]: position } })),
  clearSession: (sessionId): void =>
    set((s) => {
      const { [sessionId]: _n, ...restNodes } = s.nodesBySession
      const { [sessionId]: _e, ...restEdges } = s.edgesBySession
      void _n
      void _e
      return { nodesBySession: restNodes, edgesBySession: restEdges }
    })
}))
