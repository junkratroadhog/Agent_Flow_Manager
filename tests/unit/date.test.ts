import { describe, it, expect } from 'vitest'
import { groupByDate, formatRelative } from '../../src/renderer/src/lib/date'

describe('groupByDate', () => {
  it('groups items into date buckets', () => {
    const now = new Date()
    const yesterday = new Date(now.getTime() - 25 * 60 * 60 * 1000)
    const old = new Date('2020-01-01T00:00:00Z')

    const items = [
      { id: '1', updated_at: now.toISOString() },
      { id: '2', updated_at: yesterday.toISOString() },
      { id: '3', updated_at: old.toISOString() }
    ]

    const grouped = groupByDate(items)
    expect(grouped.Today.length).toBe(1)
    expect(grouped.Older.length).toBe(1)
  })
})

describe('formatRelative', () => {
  it('returns "just now" for very recent dates', () => {
    expect(formatRelative(new Date().toISOString())).toBe('just now')
  })

  it('returns minutes for recent dates', () => {
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000)
    expect(formatRelative(fiveMinAgo.toISOString())).toMatch(/m ago/)
  })

  it('returns hours for hour-old dates', () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000)
    expect(formatRelative(twoHoursAgo.toISOString())).toMatch(/h ago/)
  })
})
