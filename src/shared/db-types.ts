import { z } from 'zod'

// Project
export const ProjectSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(200),
  description: z.string().nullable().optional(),
  workspace_path: z.string().nullable().optional(),
  workspace_type: z.enum(['local', 'ssh']).default('local'),
  icon: z.string().nullable().optional(),
  color: z.string().nullable().optional(),
  settings_json: z.string().default('{}'),
  created_at: z.string(),
  updated_at: z.string()
})

export const CreateProjectSchema = ProjectSchema.omit({
  id: true,
  created_at: true,
  updated_at: true
}).partial({ workspace_type: true, settings_json: true })

export type Project = z.infer<typeof ProjectSchema>
export type CreateProjectInput = z.infer<typeof CreateProjectSchema>

// Session
export const SessionSchema = z.object({
  id: z.string(),
  project_id: z.string(),
  title: z.string().default('Untitled Session'),
  pinned: z.number().default(0),
  archived: z.number().default(0),
  metadata_json: z.string().default('{}'),
  created_at: z.string(),
  updated_at: z.string()
})

export const CreateSessionSchema = SessionSchema.omit({
  id: true,
  created_at: true,
  updated_at: true
}).partial({ title: true, pinned: true, archived: true, metadata_json: true })

export type Session = z.infer<typeof SessionSchema>
export type CreateSessionInput = z.infer<typeof CreateSessionSchema>

// Message
export const MessageSchema = z.object({
  id: z.string(),
  session_id: z.string(),
  parent_message_id: z.string().nullable().optional(),
  role: z.enum(['user', 'assistant', 'system', 'tool']),
  content: z.string(),
  model: z.string().nullable().optional(),
  tokens_in: z.number().default(0),
  tokens_out: z.number().default(0),
  cost: z.number().default(0),
  metadata_json: z.string().default('{}'),
  created_at: z.string()
})

export const CreateMessageSchema = MessageSchema.omit({
  id: true,
  created_at: true
}).partial({
  parent_message_id: true,
  model: true,
  tokens_in: true,
  tokens_out: true,
  cost: true,
  metadata_json: true
})

export type Message = z.infer<typeof MessageSchema>
export type CreateMessageInput = z.infer<typeof CreateMessageSchema>

// Agent
export const AgentStatus = z.enum(['idle', 'thinking', 'working', 'done', 'failed', 'paused'])

export const AgentSchema = z.object({
  id: z.string(),
  session_id: z.string(),
  parent_agent_id: z.string().nullable().optional(),
  name: z.string(),
  role: z.string(),
  model: z.string(),
  status: AgentStatus.default('idle'),
  current_action: z.string().nullable().optional(),
  tokens_used: z.number().default(0),
  cost: z.number().default(0),
  started_at: z.string().nullable().optional(),
  completed_at: z.string().nullable().optional(),
  metadata_json: z.string().default('{}'),
  created_at: z.string()
})

export const CreateAgentSchema = AgentSchema.omit({
  id: true,
  created_at: true
}).partial({
  parent_agent_id: true,
  status: true,
  current_action: true,
  tokens_used: true,
  cost: true,
  started_at: true,
  completed_at: true,
  metadata_json: true
})

export type Agent = z.infer<typeof AgentSchema>
export type CreateAgentInput = z.infer<typeof CreateAgentSchema>
export type AgentStatusType = z.infer<typeof AgentStatus>

// Tool Call
export const ToolCallSchema = z.object({
  id: z.string(),
  agent_id: z.string().nullable().optional(),
  message_id: z.string().nullable().optional(),
  tool_name: z.string(),
  arguments_json: z.string().default('{}'),
  result_json: z.string().nullable().optional(),
  approved: z.number().default(0),
  approved_scope: z.string().nullable().optional(),
  status: z.enum(['pending', 'approved', 'rejected', 'completed', 'failed']).default('pending'),
  error: z.string().nullable().optional(),
  duration_ms: z.number().nullable().optional(),
  created_at: z.string()
})

export type ToolCall = z.infer<typeof ToolCallSchema>

// Settings
export const SettingSchema = z.object({
  key: z.string(),
  value_json: z.string(),
  updated_at: z.string()
})

export type Setting = z.infer<typeof SettingSchema>
