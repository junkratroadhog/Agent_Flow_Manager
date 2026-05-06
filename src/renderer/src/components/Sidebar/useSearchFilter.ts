import { useMemo } from 'react'

export function useSearchFilter<T>(
  items: T[],
  query: string,
  getSearchableText: (item: T) => string
): T[] {
  return useMemo(() => {
    if (!query.trim()) return items
    const lower = query.toLowerCase()
    return items.filter((item) => getSearchableText(item).toLowerCase().includes(lower))
  }, [items, query, getSearchableText])
}
