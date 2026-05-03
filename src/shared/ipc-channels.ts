/**
 * Centralized IPC channel names. ALL handlers and renderer calls must use these constants.
 * This prevents typos and makes it easy to find all usages.
 */

export const IPC = {
  // Projects
  PROJECT_LIST: 'projects:list',
  PROJECT_CREATE: 'projects:create',
  PROJECT_UPDATE: 'projects:update',
  PROJECT_DELETE: 'projects:delete',
  PROJECT_GET: 'projects:get',

  // Sessions
  SESSION_LIST: 'sessions:list',
  SESSION_CREATE: 'sessions:create',
  SESSION_UPDATE: 'sessions:update',
  SESSION_DELETE: 'sessions:delete',
  SESSION_PIN: 'sessions:pin',
  SESSION_ARCHIVE: 'sessions:archive',
  SESSION_GET: 'sessions:get',

  // Messages
  MESSAGE_LIST: 'messages:list',
  MESSAGE_CREATE: 'messages:create',
  MESSAGE_DELETE: 'messages:delete',

  // Agents
  AGENT_LIST: 'agents:list',
  AGENT_CREATE: 'agents:create',
  AGENT_UPDATE_STATUS: 'agents:updateStatus',
  AGENT_GET: 'agents:get',
  AGENT_CHILDREN: 'agents:children',

  // Settings
  SETTINGS_GET: 'settings:get',
  SETTINGS_SET: 'settings:set',
  SETTINGS_GET_ALL: 'settings:getAll',

  // API Keys
  APIKEY_SET: 'apikey:set',
  APIKEY_HAS: 'apikey:has',
  APIKEY_DELETE: 'apikey:delete',
  APIKEY_LIST_PROVIDERS: 'apikey:listProviders',

  // App
  APP_VERSION: 'app:version',
  APP_PLATFORM: 'app:platform',
  APP_USER_DATA_PATH: 'app:userDataPath',

  // Window controls (already in Chapter 2)
  WINDOW_MINIMIZE: 'window:minimize',
  WINDOW_MAXIMIZE: 'window:maximize',
  WINDOW_CLOSE: 'window:close',
  WINDOW_IS_MAXIMIZED: 'window:isMaximized'
} as const

export const IPC_EVENTS = {
  // Pushed from main → renderer
  AGENT_STATUS_CHANGED: 'event:agent:statusChanged',
  AGENT_TOKENS_UPDATED: 'event:agent:tokensUpdated',
  AGENT_SPAWNED: 'event:agent:spawned',
  MESSAGE_STREAM_DELTA: 'event:message:streamDelta',
  MESSAGE_STREAM_COMPLETE: 'event:message:streamComplete',
  TOOL_CALL_REQUESTED: 'event:tool:requested',
  TOOL_CALL_COMPLETED: 'event:tool:completed',
  WINDOW_MAXIMIZED: 'window:maximized'
} as const

export type IPCChannel = (typeof IPC)[keyof typeof IPC]
export type IPCEvent = (typeof IPC_EVENTS)[keyof typeof IPC_EVENTS]
