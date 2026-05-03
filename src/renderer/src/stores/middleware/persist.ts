import { type StateCreator, type StoreMutatorIdentifier } from 'zustand'
import { persist as zustandPersist, type PersistOptions } from 'zustand/middleware'

/**
 * Creates a persisted store using localStorage.
 * Only persists keys listed in `partialize`.
 */
export function createPersistedStore<
  T,
  Mps extends [StoreMutatorIdentifier, unknown][] = [],
  Mcs extends [StoreMutatorIdentifier, unknown][] = []
>(
  name: string,
  initializer: StateCreator<T, Mps, Mcs>,
  partialize?: (state: T) => Partial<T>
): StateCreator<T, Mps, Mcs> {
  const options: PersistOptions<T, Partial<T>> = {
    name,
    storage: {
      getItem: (key) => {
        const value = localStorage.getItem(key)
        return value ? JSON.parse(value) : null
      },
      setItem: (key, value) => {
        localStorage.setItem(key, JSON.stringify(value))
      },
      removeItem: (key) => {
        localStorage.removeItem(key)
      }
    }
  }

  if (partialize) {
    options.partialize = partialize
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return zustandPersist(initializer as any, options) as unknown as StateCreator<T, Mps, Mcs>
}
