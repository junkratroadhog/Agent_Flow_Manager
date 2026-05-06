import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '../ui/Dialog'
import { Input } from '../ui/Input'
import { Textarea } from '../ui/Textarea'
import { Button } from '../ui/Button'
import { useProjectStore } from '../../stores'
import { projectService } from '../../services'

interface NewProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function NewProjectDialog({
  open,
  onOpenChange
}: NewProjectDialogProps): JSX.Element {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [workspacePath, setWorkspacePath] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { addProject, setActiveProject } = useProjectStore()

  const handleSubmit = async (): Promise<void> => {
    if (!name.trim() || submitting) return
    setSubmitting(true)
    try {
      const project = await projectService.create({
        name: name.trim(),
        description: description.trim() || undefined,
        workspace_path: workspacePath.trim() || undefined,
        workspace_type: 'local'
      })
      addProject(project)
      setActiveProject(project.id)
      setName('')
      setDescription('')
      setWorkspacePath('')
      onOpenChange(false)
    } catch (e) {
      alert(`Failed to create project: ${e instanceof Error ? e.message : String(e)}`)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Project</DialogTitle>
          <DialogDescription>Create a workspace for organizing related sessions.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-text-secondary">Name *</label>
            <Input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Project"
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-text-secondary">Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description..."
              rows={3}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-text-secondary">
              Workspace Path (optional)
            </label>
            <Input
              value={workspacePath}
              onChange={(e) => setWorkspacePath(e.target.value)}
              placeholder="/path/to/project"
            />
            <p className="text-[10px] text-text-tertiary">
              The directory the agent will work in. Can be set later.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!name.trim() || submitting}>
            {submitting ? 'Creating...' : 'Create Project'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
