import { describe, it, expect, beforeEach } from 'vitest'
import { useUIStore } from '../../src/renderer/src/stores/uiStore'
import { useProjectStore } from '../../src/renderer/src/stores/projectStore'
import { useSessionStore } from '../../src/renderer/src/stores/sessionStore'
import { useAgentStore } from '../../src/renderer/src/stores/agentStore'
import { useToolStore } from '../../src/renderer/src/stores/toolStore'

describe('uiStore', () => {
  beforeEach(() => {
    useUIStore.setState({
      leftSidebarVisible: true,
      rightSidebarVisible: true,
      bottomPanelVisible: false
    })
  })

  it('toggles left sidebar', () => {
    const before = useUIStore.getState().leftSidebarVisible
    useUIStore.getState().toggleLeftSidebar()
    expect(useUIStore.getState().leftSidebarVisible).toBe(!before)
  })

  it('sets sidebar view', () => {
    useUIStore.getState().setLeftSidebarView('projects')
    expect(useUIStore.getState().leftSidebarView).toBe('projects')
  })
})

describe('projectStore', () => {
  beforeEach(() => {
    useProjectStore.setState({ projects: [], activeProjectId: null })
  })

  it('adds a project', () => {
    const project = {
      id: 'p1',
      name: 'Test',
      workspace_type: 'local' as const,
      settings_json: '{}',
      created_at: 'now',
      updated_at: 'now'
    }
    useProjectStore.getState().addProject(project)
    expect(useProjectStore.getState().projects.length).toBe(1)
  })

  it('removes a project and clears active if matched', () => {
    const project = {
      id: 'p1',
      name: 'Test',
      workspace_type: 'local' as const,
      settings_json: '{}',
      created_at: 'now',
      updated_at: 'now'
    }
    useProjectStore.getState().addProject(project)
    useProjectStore.getState().setActiveProject('p1')
    useProjectStore.getState().removeProject('p1')
    expect(useProjectStore.getState().projects.length).toBe(0)
    expect(useProjectStore.getState().activeProjectId).toBeNull()
  })
})

describe('sessionStore', () => {
  beforeEach(() => {
    useSessionStore.setState({
      sessions: [],
      activeSessionId: null,
      messagesBySession: {},
      draftBySession: {}
    })
  })

  it('appends messages', () => {
    const msg = {
      id: 'm1',
      session_id: 's1',
      role: 'user' as const,
      content: 'Hi',
      tokens_in: 0,
      tokens_out: 0,
      cost: 0,
      metadata_json: '{}',
      created_at: 'now'
    }
    useSessionStore.getState().appendMessage('s1', msg)
    expect(useSessionStore.getState().messagesBySession['s1'].length).toBe(1)
  })

  it('manages drafts', () => {
    useSessionStore.getState().setDraft('s1', 'Hello world')
    expect(useSessionStore.getState().draftBySession['s1']).toBe('Hello world')
    useSessionStore.getState().clearDraft('s1')
    expect(useSessionStore.getState().draftBySession['s1']).toBeUndefined()
  })
})

describe('agentStore', () => {
  beforeEach(() => {
    useAgentStore.setState({ agentsBySession: {}, actionsByAgent: {} })
  })

  it('adds an agent', () => {
    const agent = {
      id: 'a1',
      session_id: 's1',
      name: 'Agent',
      role: 'r',
      model: 'm',
      status: 'idle' as const,
      tokens_used: 0,
      cost: 0,
      metadata_json: '{}',
      created_at: 'now'
    }
    useAgentStore.getState().addAgent(agent)
    expect(useAgentStore.getState().agentsBySession['s1'].length).toBe(1)
  })

  it('updates agent status across sessions', () => {
    const agent = {
      id: 'a1',
      session_id: 's1',
      name: 'A',
      role: 'r',
      model: 'm',
      status: 'idle' as const,
      tokens_used: 0,
      cost: 0,
      metadata_json: '{}',
      created_at: 'now'
    }
    useAgentStore.getState().addAgent(agent)
    useAgentStore.getState().updateAgentStatus('a1', 'working', 'Doing X')
    const updated = useAgentStore.getState().agentsBySession['s1'][0]
    expect(updated.status).toBe('working')
    expect(updated.current_action).toBe('Doing X')
  })
})

describe('toolStore', () => {
  beforeEach(() => {
    useToolStore.setState({ installedTools: [], approvals: [] })
  })

  it('checks approval at global scope', () => {
    useToolStore.getState().addApproval({
      toolName: 'web_search',
      scope: 'global',
      approvedAt: 'now'
    })
    expect(useToolStore.getState().hasApproval('web_search')).toBe(true)
  })

  it('checks approval at session scope', () => {
    useToolStore.getState().addApproval({
      toolName: 'fs_write',
      scope: 'session',
      scopeId: 's1',
      approvedAt: 'now'
    })
    expect(useToolStore.getState().hasApproval('fs_write', 's1')).toBe(true)
    expect(useToolStore.getState().hasApproval('fs_write', 's2')).toBe(false)
  })

  it('revokes approval', () => {
    useToolStore.getState().addApproval({
      toolName: 'x',
      scope: 'global',
      approvedAt: 'now'
    })
    useToolStore.getState().revokeApproval('x', 'global')
    expect(useToolStore.getState().hasApproval('x')).toBe(false)
  })
})
