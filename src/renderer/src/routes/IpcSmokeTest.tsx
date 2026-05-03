import { useEffect, useState } from 'react'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { projectService } from '../services'
import type { Project } from '@shared/db-types'

export default function IpcSmokeTest(): JSX.Element {
  const [projects, setProjects] = useState<Project[]>([])
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)

  const refresh = async (): Promise<void> => {
    try {
      const list = await projectService.list()
      setProjects(list)
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  const handleCreate = async (): Promise<void> => {
    if (!name.trim()) return
    try {
      await projectService.create({ name: name.trim() })
      setName('')
      await refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    }
  }

  const handleDelete = async (id: string): Promise<void> => {
    try {
      await projectService.delete(id)
      await refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    }
  }

  return (
    <div className="flex-1 overflow-auto p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <header>
          <h1 className="text-2xl font-semibold">IPC Smoke Test</h1>
          <p className="text-text-secondary">
            Verify that the renderer can talk to the main process and database.
          </p>
        </header>

        {error && (
          <div className="rounded-md border border-status-error/40 bg-status-error/10 p-3 text-sm text-status-error">
            {error}
          </div>
        )}

        <section className="space-y-3">
          <h2 className="text-lg font-medium">Create Project</h2>
          <div className="flex gap-2">
            <Input
              placeholder="Project name..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            />
            <Button onClick={handleCreate}>Create</Button>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-medium">Projects ({projects.length})</h2>
          {projects.length === 0 ? (
            <p className="text-sm text-text-tertiary">No projects yet.</p>
          ) : (
            <ul className="space-y-2">
              {projects.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between rounded-md border border-border bg-bg-elevated p-3"
                >
                  <div>
                    <p className="font-medium">{p.name}</p>
                    <p className="text-xs text-text-tertiary font-mono">{p.id}</p>
                  </div>
                  <Button variant="danger" size="sm" onClick={() => handleDelete(p.id)}>
                    Delete
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}
