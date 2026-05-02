// Shared TypeScript types between main, preload, and renderer.
// This file is intentionally minimal at this stage - it will be
// expanded in Chapter 6 (IPC & Process Communication).

export interface AppInfo {
  name: string
  version: string
}
