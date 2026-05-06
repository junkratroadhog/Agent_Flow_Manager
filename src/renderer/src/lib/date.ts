export type DateGroup = 'Today' | 'Yesterday' | 'This Week' | 'This Month' | 'Older'

export function groupByDate<T extends { updated_at: string }>(items: T[]): Record<DateGroup, T[]> {
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startOfYesterday = new Date(startOfToday)
  startOfYesterday.setDate(startOfYesterday.getDate() - 1)
  const startOfThisWeek = new Date(startOfToday)
  startOfThisWeek.setDate(startOfThisWeek.getDate() - now.getDay())
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const groups: Record<DateGroup, T[]> = {
    Today: [],
    Yesterday: [],
    'This Week': [],
    'This Month': [],
    Older: []
  }

  for (const item of items) {
    const d = new Date(item.updated_at)
    if (d >= startOfToday) groups.Today.push(item)
    else if (d >= startOfYesterday) groups.Yesterday.push(item)
    else if (d >= startOfThisWeek) groups['This Week'].push(item)
    else if (d >= startOfThisMonth) groups['This Month'].push(item)
    else groups.Older.push(item)
  }

  return groups
}

export function formatRelative(dateString: string): string {
  const d = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffHr = Math.floor(diffMs / 3600000)
  const diffDay = Math.floor(diffMs / 86400000)

  if (diffMin < 1) return 'just now'
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHr < 24) return `${diffHr}h ago`
  if (diffDay < 7) return `${diffDay}d ago`
  return d.toLocaleDateString()
}
